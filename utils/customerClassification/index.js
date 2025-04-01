const Transaction = require('../models/transaction');
const Mortgage = require('../models/mortgage');
const CustomerClassificationService = require('./CustomerClassificationService');

const classifyCustomer = async (userId) => {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  const transactions = await Transaction.find({ 
    userId, 
    date: { $gte: ninetyDaysAgo } 
  });

  const mortgage = await Mortgage.findOne({ userId });

  const classificationService = new CustomerClassificationService(
    userId, 
    transactions, 
    mortgage
  );

  return await classificationService.classify();
};

module.exports = { classifyCustomer };