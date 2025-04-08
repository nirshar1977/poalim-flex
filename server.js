const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const mortgageRoutes = require('./routes/mortgage');
const flexRoutes = require('./routes/flex');
const notificationRoutes = require('./routes/notification');
const analyticRoutes = require('./routes/analytics');

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Replace this line:
app.use(cors());

app.use(cors({
  origin: true,  // This will reflect the request origin
  credentials: true
}));
  
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI, {   
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mortgage', mortgageRoutes);
app.use('/api/flex', flexRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});