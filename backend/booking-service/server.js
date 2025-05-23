// backend/booking-service/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - UserID: ${req.user?.userId || 'Guest'}`);
    next();
});

// API Routes
app.use('/appointments', bookingRoutes);

app.get('/', (req, res) => {
    res.send('Booking Service is running!');
});

app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Unhandled Error:`, err.stack || err);
    res.status(500).json({ message: 'An unexpected error occurred on the server.' });
});

const PORT = process.env.BOOKING_SERVICE_PORT || 3003;
app.listen(PORT, () => {
    console.log(`Booking Service listening on port ${PORT}`);
});
