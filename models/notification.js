const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mortgageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mortgage'
  },
  type: {
    type: String,
    enum: ['flex_offer', 'payment_reminder', 'system', 'custom'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  actionUrl: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  expireAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);