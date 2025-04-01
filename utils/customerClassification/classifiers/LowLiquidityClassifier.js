const BaseClassifier = require('../base/BaseClassifier');

class LowLiquidityClassifier extends BaseClassifier {
  classify() {
    const { monthlyIncome, monthlyExpenses } = this.financialMetrics;
    
    if (monthlyIncome - monthlyExpenses < this.mortgage.monthlyPayment * 1.5) {
      return {
        classification: 'low_liquidity',
        recommendationType: 'mortgage_refinance',
        suggestedAction: {
          options: [
            'Extend mortgage period',
            'Temporary payment reduction',
            'Interest rate adjustment'
          ],
          potentialSavings: this.mortgage.monthlyPayment * 0.2,
          rationale: 'Insufficient buffer between income and expenses'
        },
        score: 75
      };
    }
    
    return null;
  }
}

module.exports = LowLiquidityClassifier;