const BaseClassifier = require('./base/BaseClassifier');

class FinancialStabilityClassifier extends BaseClassifier {
  classify() {
    const riskLevel = this.classifyRisk();
    
    if (riskLevel === 'high_risk' || riskLevel === 'medium_risk') {
      return {
        classification: 'limited_financial_stability',
        recommendationType: 'financial_restructuring',
        suggestedAction: {
          options: [
            'Extend mortgage period',
            'Temporary payment reduction',
            'Explore debt consolidation',
            'Financial counseling'
          ],
          potentialSavings: Math.round(this.mortgage.monthlyPayment * 0.2),
          rationale: 'Insufficient financial buffer and high expense ratio'
        },
        score: 75
      };
    }
    
    return null;
  }

  // Optional: Override base risk classification if needed
  classifyRisk() {
    const { expenseToIncomeRatio, cashBuffer } = this.financialMetrics;
    
    if (expenseToIncomeRatio > 0.7) return 'high_risk';
    if (cashBuffer < this.mortgage.monthlyPayment * 1.5) return 'medium_risk';
    
    return 'low_risk';
  }
}

module.exports = FinancialStabilityClassifier;