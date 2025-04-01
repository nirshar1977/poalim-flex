class BaseClassifier {
    constructor(userId, transactions, mortgage) {
      this.userId = userId;
      this.transactions = transactions;
      this.mortgage = mortgage;
      this.incomeTransactions = this.filterTransactions('income');
      this.expenseTransactions = this.filterTransactions('expense');
      this.financialMetrics = this.calculateFinancialMetrics();
    }
  
    filterTransactions(type) {
      return this.transactions.filter(t => t.type === type);
    }
  
    calculateFinancialMetrics() {
      const totalIncome = this.incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = this.expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      return {
        totalIncome,
        totalExpenses,
        monthlyIncome: totalIncome / 3,
        monthlyExpenses: totalExpenses / 3,
        expenseToIncomeRatio: totalExpenses / totalIncome
      };
    }
  
    classify() {
      throw new Error('Classify method must be implemented');
    }
  }
  
  module.exports = BaseClassifier;