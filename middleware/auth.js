const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');
    
    console.log('Received headers:', req.headers);
    console.log('Received x-auth-token:', token);
    
    // Check if no token
    if (!token) {
        console.error('No token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('Decoded token:', decoded);
        
        // Add user from payload
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = { authenticate };