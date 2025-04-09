const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { authenticate } = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { customerId, email, password, firstName, lastName, phone } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { customerId }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User already exists with this email or customer ID' 
            });
        }
        
        // Create new user
        const user = new User({
            customerId,
            email,
            password,
            firstName,
            lastName,
            phone
        });
        
        await user.save();
        
        // Generate token
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        res.status(201).json({
            token,
            user: {
                id: user._id,
                customerId: user.customerId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Server error during registration',
            error: error.message 
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Validate password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Generate token
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        res.json({
            token,
            user: {
                id: user._id,
                customerId: user.customerId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login',
            error: error.message 
        });
    }
});

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        console.log('User ID from token:', req.user.id);
        
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            console.error('User not found for ID:', req.user.id);
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});

// Update notification preferences
router.put('/notifications', authenticate, async (req, res) => {
    try {
        const { email, push, sms } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { 
                'notifications.email': email,
                'notifications.push': push,
                'notifications.sms': sms
            },
            { new: true }
        ).select('-password');
        
        res.json(user);
    } catch (error) {
        console.error('Notification preferences update error:', error);
        res.status(500).json({ 
            message: 'Server error updating notification preferences',
            error: error.message 
        });
    }
});

module.exports = router;