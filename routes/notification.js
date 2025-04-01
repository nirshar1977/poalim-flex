const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const Mortgage = require('../models/mortgage');
const Transaction = require('../models/transaction');
const { authenticate } = require('../middleware/auth');
const { analyzeFinancialStress } = require('../utils/aiAnalytics');

// Get all notifications for user
router.get('/', authenticate, async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user.id
        }).sort({ createdAt: -1 });
        
        res.json(notifications);
    } catch (error) {
        console.error('Fetch notifications error:', error);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json(notification);
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ message: 'Server error marking notification as read' });
    }
});

// Mark all notifications as read
router.put('/read-all', authenticate, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );
        
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ message: 'Server error marking all notifications as read' });
    }
});

// Generate flex offer notifications based on AI analysis
router.get('/generate-flex-offers', authenticate, async (req, res) => {
    try {
        // Get user's mortgages with flex enabled
        const mortgages = await Mortgage.find({
            userId: req.user.id,
            flexEnabled: true
        });
        
        if (mortgages.length === 0) {
            return res.json({ message: 'No eligible mortgages found for flex offers' });
        }
        
        // Get user's transaction history
        const transactions = await Transaction.find({
            userId: req.user.id,
            date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
        });
        
        // For each mortgage, analyze financial stress and create notification if needed
        const createdNotifications = [];
        
        for (const mortgage of mortgages) {
            // Check if user already used flex this month
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const alreadyUsedThisMonth = mortgage.flexHistory.some(item => {
                const itemDate = new Date(item.date);
                return itemDate.getMonth() === currentMonth && 
                       itemDate.getFullYear() === currentYear;
            });
            
            if (alreadyUsedThisMonth) {
                continue;
            }
            
            // Check annual usage limit
            const usageThisYear = mortgage.flexHistory.filter(item => 
                new Date(item.date).getFullYear() === currentYear
            ).length;
            
            if (usageThisYear >= mortgage.maxFlexUsagePerYear) {
                continue;
            }
            
            // Analyze financial stress
            const stressAnalysis = await analyzeFinancialStress(
                transactions, 
                mortgage.monthlyPayment
            );
            
            if (stressAnalysis.isStressed) {
                // Create flex offer notification
                const suggestedReduction = Math.min(
                    Math.round(mortgage.monthlyPayment * 0.3 / 100) * 100, // 30% of payment, rounded to nearest 100
                    1500 // Max 1500 ₪
                );
                
                const notification = new Notification({
                    userId: req.user.id,
                    mortgageId: mortgage._id,
                    type: 'flex_offer',
                    title: 'Reduce Your Mortgage Payment This Month',
                    message: `Looking for extra financial flexibility? You can reduce your mortgage payment this month by up to ₪${suggestedReduction}.`,
                    actionUrl: `/mortgage/${mortgage._id}/flex`,
                    priority: 'high'
                });
                
                await notification.save();
                createdNotifications.push(notification);
            }
        }
        
        res.json({
            message: `Created ${createdNotifications.length} flex offer notifications`,
            notifications: createdNotifications
        });
    } catch (error) {
        console.error('Generate flex offers error:', error);
        res.status(500).json({ message: 'Server error generating flex offers' });
    }
});

module.exports = router;