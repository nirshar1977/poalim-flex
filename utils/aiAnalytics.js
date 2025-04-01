const analyzeFinancialStress = async (transactions, monthlyMortgagePayment) => {
    // Group transactions by month and category
    const monthlyExpenses = {};
    const monthlyIncomes = {};
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (transaction.type === 'expense') {
            if (!monthlyExpenses[monthKey]) {
                monthlyExpenses[monthKey] = 0;
            }
            monthlyExpenses[monthKey] += transaction.amount;
        } else {
            if (!monthlyIncomes[monthKey]) {
                monthlyIncomes[monthKey] = 0;
            }
            monthlyIncomes[monthKey] += transaction.amount;
        }
    });
    
    // Calculate average expense and income
    const expenseMonths = Object.values(monthlyExpenses);
    const incomeMonths = Object.values(monthlyIncomes);
    
    const avgMonthlyExpense = expenseMonths.reduce((sum, val) => sum + val, 0) / expenseMonths.length || 0;
    const avgMonthlyIncome = incomeMonths.reduce((sum, val) => sum + val, 0) / incomeMonths.length || 0;
    
    // Find expense spikes (months with expenses at least 20% above average)
    const expenseSpikes = Object.entries(monthlyExpenses)
        .filter(([_, amount]) => amount > avgMonthlyExpense * 1.2)
        .map(([month, amount]) => ({ month, amount }));
    
    // Calculate current month's expense ratio (compared to average)
    const currentDate = new Date();
    const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthExpense = monthlyExpenses[currentMonthKey] || 0;
    const expenseRatio = currentMonthExpense / avgMonthlyExpense;
    
    // Calculate current financial stress indicators
    const mortgageToIncomeRatio = monthlyMortgagePayment / (avgMonthlyIncome || 1); // Avoid division by zero
    const expenseToIncomeRatio = avgMonthlyExpense / (avgMonthlyIncome || 1);
    const spikesFrequency = expenseSpikes.length / Object.keys(monthlyExpenses).length;
    
    // Determine stress level
    // 1. High mortgage to income ratio (> 0.35)
    // 2. High expense to income ratio (> 0.8)
    // 3. Current month expenses much higher than average (> 1.3)
    // 4. Frequent expense spikes (> 0.3)
    
    const stressScore = (
        (mortgageToIncomeRatio > 0.35 ? 1 : 0) +
        (expenseToIncomeRatio > 0.8 ? 1 : 0) +
        (expenseRatio > 1.3 ? 1 : 0) +
        (spikesFrequency > 0.3 ? 1 : 0)
    ) / 4;
    
    return {
        isStressed: stressScore >= 0.5,
        stressScore,
        stressLevel: stressScore < 0.25 ? 'low' : stressScore < 0.5 ? 'moderate' : stressScore < 0.75 ? 'high' : 'severe',
        indicators: {
            mortgageToIncomeRatio,
            expenseToIncomeRatio,
            currentExpenseRatio: expenseRatio,
            expenseSpikesFrequency: spikesFrequency
        },
        expenseSpikes
    };
};

const predictFinancialStress = async (transactions, monthlyMortgagePayment) => {
    // Similar to analyzeFinancialStress, but predicts future months
    // Group transactions by month and category for historical analysis
    const monthlyExpensesByCategory = {};
    const monthlyIncomes = {};
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (transaction.type === 'expense') {
            if (!monthlyExpensesByCategory[monthKey]) {
                monthlyExpensesByCategory[monthKey] = {};
            }
            
            if (!monthlyExpensesByCategory[monthKey][transaction.category]) {
                monthlyExpensesByCategory[monthKey][transaction.category] = 0;
            }
            
            monthlyExpensesByCategory[monthKey][transaction.category] += transaction.amount;
        } else {
            if (!monthlyIncomes[monthKey]) {
                monthlyIncomes[monthKey] = 0;
            }
            monthlyIncomes[monthKey] += transaction.amount;
        }
    });
    
    // Identify seasonal patterns
    const lastYear = [...Array(12)].map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });
    
    // Get category averages for monthly prediction
    const categories = {};
    Object.values(monthlyExpensesByCategory).forEach(monthCategories => {
        Object.entries(monthCategories).forEach(([category, amount]) => {
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(amount);
        });
    });
    
    // Calculate category averages
    const categoryAverages = {};
    Object.entries(categories).forEach(([category, amounts]) => {
        categoryAverages[category] = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
    });
    
    // Add seasonal factors (e.g., holidays, education expenses)
    const seasonalFactors = {
        '01': 1.1,  // January (post-holiday expenses)
        '04': 1.05, // April (spring break)
        '08': 1.2,  // August (back to school)
        '09': 1.15, // September (back to school/holidays)
        '12': 1.3   // December (holidays)
    };
    
    // Predict next 3 months
    const predictions = [];
    const currentDate = new Date();
    
    for (let i = 1; i <= 3; i++) {
        const futureDate = new Date(currentDate);
        futureDate.setMonth(currentDate.getMonth() + i);
        
        const monthKey = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;
        const monthName = futureDate.toLocaleString('default', { month: 'long' });
        const seasonalFactor = seasonalFactors[monthKey.split('-')[1]] || 1;
        
        // Predict expenses for this month
        const predictedExpenses = Object.entries(categoryAverages).reduce((sum, [category, avg]) => {
            // Apply category-specific seasonal factors
            let categoryFactor = 1;
            
            if (category === 'Education' && ['08', '09'].includes(monthKey.split('-')[1])) {
                categoryFactor = 1.8;
            } else if (category === 'Shopping' && ['11', '12'].includes(monthKey.split('-')[1])) {
                categoryFactor = 1.6;
            } else if (category === 'Travel' && ['06', '07', '08'].includes(monthKey.split('-')[1])) {
                categoryFactor = 1.5;
            }
            
            return sum + (avg * seasonalFactor * categoryFactor);
        }, 0);
        
        // Use average monthly income for prediction
        const avgMonthlyIncome = Object.values(monthlyIncomes).reduce((sum, val) => sum + val, 0) / 
                                 Object.keys(monthlyIncomes).length || 1;
        
        // Calculate stress indicators for this future month
        const mortgageToIncomeRatio = monthlyMortgagePayment / avgMonthlyIncome;
        const expenseToIncomeRatio = predictedExpenses / avgMonthlyIncome;
        
        const stressScore = (
            (mortgageToIncomeRatio > 0.35 ? 1 : 0) +
            (expenseToIncomeRatio > 0.8 ? 1 : 0) +
            (seasonalFactor > 1.2 ? 1 : 0)
        ) / 3;
        
        predictions.push({
            month: monthName,
            year: futureDate.getFullYear(),
            predictedExpenses,
            predictedIncome: avgMonthlyIncome,
            stressScore,
            stressLevel: stressScore < 0.25 ? 'low' : stressScore < 0.5 ? 'moderate' : stressScore < 0.75 ? 'high' : 'severe',
            likelyFlexCandidate: stressScore >= 0.5
        });
    }
    
    return {
        currentMonth: currentDate.toLocaleString('default', { month: 'long' }),
        predictions
    };
};

module.exports = { analyzeFinancialStress, predictFinancialStress };