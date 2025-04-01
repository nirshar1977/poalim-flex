const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');
const Mortgage = require('../models/mortgage');
const { authenticate } = require('../middleware/auth');
const { predictFinancialStress } = require('../utils/aiAnalytics');

// Get financial stress prediction
router.get('/financial-stress', authenticate, async (req, res) => {
    try {
        // Get user's transaction history
        const transactions = await Transaction.find({
            userId: req.user.id,
            date: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } // Last 180 days
        });
        
        // Get user's mortgage data
        const mortgages = await Mortgage.find({ userId: req.user.id });
        const totalMonthlyPayment = mortgages.reduce(
            (sum, mortgage) => sum + mortgage.monthlyPayment, 
            0
        );
        
        // Predict financial stress for the next 3 months
        const stressPrediction = await predictFinancialStress(
            transactions, 
            totalMonthlyPayment
        );
        
        res.json(stressPrediction);
    } catch (error) {
        console.error('Financial stress prediction error:', error);
        res.status(500).json({ message: 'Server error predicting financial stress' });
    }
});

// Get spending patterns
router.get('/spending-patterns', authenticate, async (req, res) => {
    try {
        // Get all user transactions from the past year
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const transactions = await Transaction.find({
            userId: req.user.id,
            type: 'expense',
            date: { $gte: oneYearAgo }
        });
        
        // Group by month and category
        const monthlySpending = {};
        const categoryTotals = {};
        
        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (transaction.type === 'expense') {
                if (!monthlySpending[monthKey]) {
                    monthlySpending[monthKey] = {};
                }
                
                if (!monthlySpending[monthKey][transaction.category]) {
                    monthlySpending[monthKey][transaction.category] = 0;
                }
                
                monthlySpending[monthKey][transaction.category] += transaction.amount;
                
                // Total by category
                if (!categoryTotals[transaction.category]) {
                    categoryTotals[transaction.category] = 0;
                }
                
                categoryTotals[transaction.category] += transaction.amount;
            }
        });
        
        // Calculate average monthly expenses by category
        const monthCount = Object.keys(monthlySpending).length || 1; // Avoid division by zero
        const averageMonthlyByCategory = {};
        
        Object.entries(categoryTotals).forEach(([category, total]) => {
            averageMonthlyByCategory[category] = total / monthCount;
        });
        
        // Find months with unusually high expenses
        const stressMonths = [];
        Object.entries(monthlySpending).forEach(([month, categories]) => {
            const totalForMonth = Object.values(categories).reduce((sum, amount) => sum + amount, 0);
            const averageMonthly = Object.values(averageMonthlyByCategory).reduce((sum, avg) => sum + avg, 0);
            
            if (totalForMonth > averageMonthly * 1.2) { // 20% higher than average
                stressMonths.push({
                    month,
                    total: totalForMonth,
                    percentAboveAverage: ((totalForMonth / averageMonthly) - 1) * 100,
                    topCategories: Object.entries(categories)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([category, amount]) => ({ category, amount }))
                });
            }
        });
        
        res.json({
            monthlySpending,
            categoryTotals,
            averageMonthlyByCategory,
            stressMonths
        });
    } catch (error) {
        console.error('Spending patterns analysis error:', error);
        res.status(500).json({ message: 'Server error analyzing spending patterns' });
    }
});

module.exports = router;