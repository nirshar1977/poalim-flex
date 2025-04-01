/**
 * Calculates the distribution plan for a flex payment reduction
 * @param {number} remainingMonths - Remaining months in the mortgage
 * @param {number} reductionAmount - Amount to reduce this month's payment by
 * @param {number} interestRate - Annual interest rate (e.g., 0.03 for 3%)
 * @param {Date} startDate - Date to start the reduction
 * @returns {Array} Distribution plan with months and additional amounts
 */
const calculateDistributionPlan = (
    remainingMonths, 
    reductionAmount, 
    interestRate, 
    startDate
) => {
    // Convert annual interest rate to monthly
    const monthlyInterest = interestRate / 12;
    
    // Calculate total amount to be repaid (with interest)
    const totalToRepay = reductionAmount * (1 + monthlyInterest);
    
    // Determine distribution period (6 months or 25% of remaining term, whichever is greater)
    const distributionMonths = Math.max(6, Math.ceil(remainingMonths * 0.25));
    
    // Calculate monthly additional payment
    const monthlyAdditional = totalToRepay / distributionMonths;
    
    // Generate distribution plan
    const distributionPlan = [];
    const currentDate = new Date(startDate);
    
    // Skip the current month (which is being reduced)
    currentDate.setMonth(currentDate.getMonth() + 1);
    
    for (let i = 0; i < distributionMonths; i++) {
        distributionPlan.push({
            month: new Date(currentDate),
            additionalAmount: roundToNearest(monthlyAdditional, 0.01)
        });
        
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return distributionPlan;
};

/**
 * Helper to round to the nearest specified value
 */
const roundToNearest = (value, nearest) => {
    return Math.round(value / nearest) * nearest;
};

module.exports = { calculateDistributionPlan };