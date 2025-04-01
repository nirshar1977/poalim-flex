const mongoose = require('mongoose');

const MortgageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mortgageId: {
        type: String,
        required: true,
        unique: true
    },
    originalAmount: {
        type: Number,
        required: true
    },
    currentBalance: {
        type: Number,
        required: true
    },
    interestRate: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    monthlyPayment: {
        type: Number,
        required: true
    },
    remainingMonths: {
        type: Number,
        required: true
    },
    lastPaymentDate: {
        type: Date
    },
    flexEnabled: {
        type: Boolean,
        default: false
    },
    flexHistory: [{
        date: Date,
        originalAmount: Number,
        reducedAmount: Number,
        distributionPlan: [{
            month: Date,
            additionalAmount: Number
        }]
    }],
    flexUsageCount: {
        type: Number,
        default: 0
    },
    maxFlexUsagePerYear: {
        type: Number,
        default: 4
    }
});

module.exports = mongoose.model('Mortgage', MortgageSchema);