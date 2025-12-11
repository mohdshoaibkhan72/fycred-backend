const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import Routes
const personalLoanRoutes = require('./routes/personalLoanRoutes');
const homeLoanRoutes = require('./routes/homeLoanRoutes');
const balanceTransferRoutes = require('./routes/balanceTransferRoutes');
const offerRoutes = require('./routes/offerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const statusRoutes = require('./routes/statusRoutes');
const eligibilityRoutes = require('./routes/eligibilityRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminAuthRoutes = require('./routes/adminAuth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

connectDB();

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB Disconnected');
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB Connected');
});

// Routes
app.use('/api/personal-loan', personalLoanRoutes);
app.use('/api/home-loan', homeLoanRoutes);
app.use('/api/balance-transfer', balanceTransferRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/auth', adminAuthRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Fycred Backend API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
