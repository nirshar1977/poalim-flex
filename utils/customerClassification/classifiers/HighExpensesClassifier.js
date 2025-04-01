const BaseClassifier = require('../base/BaseClassifier');

class HighExpensesClassifier extends BaseClassifier {
  classify() {
    const { expenseToIncomeRatio } = this.financialMetrics;
    
    if (expenseToIncomeRatio > 0.7) {
      return {
        classification: 'high_expenses',
        recommendationType: 'flex_reduction',
        suggestedAction: {
          reductionAmount: Math.min(this.mortgage.monthlyPayment * 0.3, 3000),
          newMonthlyPayment: this.mortgage.monthlyPayment * 0.7,
          rationale: 'High expenses relative to income'
        },
        score: 85
      };
    }
    
    return null;
  }
}

module.exports = HighExpensesClassifier;