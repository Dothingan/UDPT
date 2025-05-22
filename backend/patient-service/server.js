// backend/patient-service/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const patientRoutes = require('./routes/patientRoutes');
const medicalHistoryRoutes = require('./routes/medicalHistoryRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Logging middleware đơn giản
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from UserID: ${req.user?.userId || 'Guest'}`);
    next();
});

// API Routes
app.use('/patients', patientRoutes);
// Gắn medicalHistoryRoutes như một sub-router của patientRoutes
// Điều này có nghĩa là các route trong medicalHistoryRoutes sẽ được truy cập qua /patients/:patientId/history
patientRoutes.use('/:patientId/history', medicalHistoryRoutes);


// Route cơ bản để kiểm tra service có chạy không
app.get('/', (req, res) => {
    res.send('Patient Service is running!');
});

// Error handling middleware (đặt ở cuối cùng)
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Unhandled Error:`, err.stack || err);
    res.status(500).json({ message: 'An unexpected error occurred on the server.' });
});


const PORT = process.env.PATIENT_SERVICE_PORT || 3004;
app.listen(PORT, () => {
    console.log(`Patient Service listening on port ${PORT}`);
});
