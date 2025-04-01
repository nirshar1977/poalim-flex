const express = require('express');
const router = express.Router();
const Mortgage = require('../models/mortgage');
const Notification = require('../models/notification');
const { authenticate } = require('../middleware/auth');
const { calculateDistributionPlan } = require('../utils/flexCalculator');

// Get flex usage history for a mortgage
router.get('/:mortgageId/history', authenticate, async (req, res) => {
    try {
        const mortgage = await Mortgage.findOne({ 
            _id: req.params.mortgageId,
            userId: req.user.id
        });
        
        if (!mortgage) {
            return res.status(404).json({ message: 'Mortgage not found' });
        }
        
        res.json(mortgage.flexHistory);
    } catch (error) {
        console.error('Fetch flex history error:', error);
        res.status(500).json({ message: 'Server error fetching flex history' });
    }
});

// Apply flex payment reduction
router.post('/:mortgageId/reduce', authenticate, async (req, res) => {
    try {
        const { reductionAmount, applyMonth } = req.body;
        
        // Validate input
        if (!reductionAmount || reductionAmount <= 0) {
            return res.status(400).json({ 
                message: 'Invalid reduction amount' 
            });
        }
        
        const mortgage = await Mortgage.findOne({ 
            _id: req.params.mortgageId,
            userId: req.user.id
        });
        
        if (!mortgage) {
            return res.status(404).json({ message: 'Mortgage not found' });
        }
        
        // Check if flex is enabled
        if (!mortgage.flexEnabled) {
            return res.status(400).json({ 
                message: 'Flex feature is not enabled for this mortgage' 
            });
        }
        
        // Check usage limits
        const currentYear = new Date().getFullYear();
        const usageThisYear = mortgage.flexHistory.filter(item => 
            new Date(item.date).getFullYear() === currentYear
        ).length;
        
        if (usageThisYear >= mortgage.maxFlexUsagePerYear) {
            return res.status(400).json({ 
                message: `You've reached the maximum flex usage (${mortgage.maxFlexUsagePerYear}) for this year` 
            });
        }
        
        // Check if reduction amount is valid
        if (reductionAmount > mortgage.monthlyPayment * 0.5) {
            return res.status(400).json({ 
                message: 'Reduction amount cannot exceed 50% of your monthly payment' 
            });
        }
        
        // Calculate distribution plan
        const applyDate = applyMonth ? new Date(applyMonth) : new Date();
        const distributionPlan = calculateDistributionPlan(
            mortgage.remainingMonths,
            reductionAmount,
            mortgage.interestRate,
            applyDate
        );
        
        // Update mortgage with new flex usage
        const flexEntry = {
            date: applyDate,
            originalAmount: mortgage.monthlyPayment,
            reducedAmount: reductionAmount,
            distributionPlan
        };
        
        mortgage.flexHistory.push(flexEntry);
        mortgage.flexUsageCount += 1;
        await mortgage.save();
        
        // Create a notification for the successful flex application
        await new Notification({
            userId: req.user.id,
            mortgageId: mortgage._id,
            type: 'flex_offer',
            title: 'Flex Payment Reduction Applied',
            message: `Your mortgage payment for ${applyDate.toLocaleString('default', { month: 'long' })} has been reduced by ₪${reductionAmount}.`,
            priority: 'high'
        }).save();
        
        res.json({
            message: 'Flex payment reduction applied successfully',
            flexEntry
        });
    } catch (error) {
        console.error('Apply flex reduction error:', error);
        res.status(500).json({ message: 'Server error applying flex reduction' });
    }
});

// Calculate potential distribution plan (preview)
router.post('/:mortgageId/calculate', authenticate, async (req, res) => {
    try {
        const { reductionAmount } = req.body;
        
        // Validate input
        if (!reductionAmount || reductionAmount <= 0) {
            return res.status(400).json({ 
                message: 'Invalid reduction amount' 
            });
        }
        
        const mortgage = await Mortgage.findOne({ 
            _id: req.params.mortgageId,
            userId: req.user.id
        });
        
        if (!mortgage) {
            return res.status(404).json({ message: 'Mortgage not found' });
        }
        
        // Calculate distribution plan
        const distributionPlan = calculateDistributionPlan(
            mortgage.remainingMonths,
            reductionAmount,
            mortgage.interestRate,
            new Date()
        );
        
        res.json({
            reductionAmount,
            originalMonthlyPayment: mortgage.monthlyPayment,
            reducedMonthlyPayment: mortgage.monthlyPayment - reductionAmount,
            distributionPlan,
            totalInterestAdded: distributionPlan.reduce(
                (sum, item) => sum + (item.additionalAmount - (reductionAmount / distributionPlan.length)),
                0
            )
        });
    } catch (error) {
        console.error('Calculate flex distribution error:', error);
        res.status(500).json({ message: 'Server error calculating flex distribution' });
    }
});

module.exports = router;