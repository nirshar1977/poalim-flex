const Notification = require('../models/notification');

class CustomerClassificationService {
  constructor(userId, transactions, mortgage) {
    this.userId = userId;
    this.transactions = transactions;
    this.mortgage = mortgage;
    this.classifiers = [
      require('./classifiers/HighExpensesClassifier'),
      require('./classifiers/LowLiquidityClassifier'),
      // Add other classifiers here
    ];
  }

  async classify() {
    const classifications = [];

    for (const ClassifierClass of this.classifiers) {
      const classifier = new ClassifierClass(
        this.userId, 
        this.transactions, 
        this.mortgage
      );
      
      const result = classifier.classify();
      if (result) {
        classifications.push(result);
      }
    }

    // If no specific classification, return standard
    if (classifications.length === 0) {
      classifications.push({
        classification: 'standard',
        recommendationType: 'no_action',
        suggestedAction: null,
        score: 50
      });
    }

    // Create and save notification
    const notification = new Notification({
      userId: this.userId,
      type: 'system',
      title: 'Personalized Financial Recommendation',
      message: 'We\'ve analyzed your financial profile and have a tailored suggestion.',
      ...classifications[0], // Use the first (highest priority) classification
      isRead: false,
      createdAt: new Date()
    });

    await notification.save();

    return notification;
  }
}

module.exports = CustomerClassificationService;