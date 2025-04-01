const express = require('express');
const router = express.Router();
const Mortgage = require('../models/mortgage');
const { authenticate } = require('../middleware/auth');

// Create a mortgage (for testing purposes)
router.post('/', authenticate, async (req, res) => {
    try {
        const { 
            mortgageId, 
            originalAmount, 
            currentBalance, 
            interestRate, 
            startDate, 
            endDate, 
            monthlyPayment, 
            remainingMonths,
            flexEnabled 
        } = req.body;
        
        // Create new mortgage
        const mortgage = new Mortgage({
            userId: req.user.id,
            mortgageId,
            originalAmount,
            currentBalance,
            interestRate,
            startDate,
            endDate,
            monthlyPayment,
            remainingMonths,
            lastPaymentDate: new Date(),
            flexEnabled: flexEnabled || false,
            flexUsageCount: 0,
            maxFlexUsagePerYear: 4
        });
        
        await mortgage.save();
        
        res.status(201).json(mortgage);
    } catch (error) {
        console.error('Create mortgage error:', error);
        res.status(500).json({ message: 'Server error creating mortgage' });
    }
});

// Get all mortgages for user
router.get('/', authenticate, async (req, res) => {
    try {
        const mortgages = await Mortgage.find({ userId: req.user.id });
        res.json(mortgages);
    } catch (error) {
        console.error('Fetch mortgages error:', error);
        res.status(500).json({ message: 'Server error fetching mortgages' });
    }
});

// Get mortgage details
router.get('/:id', authenticate, async (req, res) => {
    try {
        const mortgage = await Mortgage.findOne({ 
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!mortgage) {
            return res.status(404).json({ message: 'Mortgage not found' });
        }
        
        res.json(mortgage);
    } catch (error) {
        console.error('Fetch mortgage details error:', error);
        res.status(500).json({ message: 'Server error fetching mortgage details' });
    }
});

// Toggle Flex feature for a mortgage
router.put('/:id/toggle-flex', authenticate, async (req, res) => {
    try {
        const mortgage = await Mortgage.findOne({ 
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!mortgage) {
            return res.status(404).json({ message: 'Mortgage not found' });
        }
        
        mortgage.flexEnabled = !mortgage.flexEnabled;
        await mortgage.save();
        
        res.json({ 
            mortgageId: mortgage._id,
            flexEnabled: mortgage.flexEnabled
        });
    } catch (error) {
        console.error('Toggle flex error:', error);
        res.status(500).json({ message: 'Server error toggling flex feature' });
    }
});

// Update max flex usage per year
router.put('/:id/max-flex-usage', authenticate, async (req, res) => {
    try {
        const { maxUsage } = req.body;
        
        if (maxUsage < 1 || maxUsage > 6) {
            return res.status(400).json({ 
                message: 'Max flex usage must be between 1 and 6' 
            });
        }
        
        const mortgage = await Mortgage.findOneAndUpdate(
            { 
                _id: req.params.id,
                userId: req.user.id
            },
            { maxFlexUsagePerYear: maxUsage },
            { new: true }
        );
        
        if (!mortgage) {
            return res.status(404).json({ message: 'Mortgage not found' });
        }
        
        res.json({ 
            mortgageId: mortgage._id,
            maxFlexUsagePerYear: mortgage.maxFlexUsagePerYear
        });
    } catch (error) {
        console.error('Update max flex usage error:', error);
        res.status(500).json({ message: 'Server error updating max flex usage' });
    }
});

module.exports = router;