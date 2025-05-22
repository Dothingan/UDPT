// backend/doctor-service/server.js
require('dotenv').config(); // Để đọc biến từ .env khi chạy local
const express = require('express');
const cors = require('cors');

// Import routes
const doctorRoutes = require('./routes/doctorRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const specialityRoutes = require('./routes/specialityRoutes');
// Giả sử bạn đã có file authMiddleware.js trong thư mục middleware
// const authMiddleware = require('./middleware/authMiddleware'); // Sẽ dùng sau

const app = express();

// Middlewares
app.use(cors()); // Cho phép CORS cho tất cả các origin (cấu hình chặt hơn cho production)
app.use(express.json()); // Để parse JSON request bodies

// Logging middleware đơn giản (bạn có thể dùng morgan cho phức tạp hơn)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - UserID: ${req.user?.userId || 'Guest'}`);
    next();
});

// API Routes
// Kiểm tra xem các biến này có phải là function (router hợp lệ) không
if (typeof doctorRoutes !== 'function') {
    console.error('FATAL ERROR: doctorRoutes is not a function. Check export from ./routes/doctorRoutes.js');
    process.exit(1); // Thoát nếu router không hợp lệ
}
app.use('/doctors', doctorRoutes);

if (typeof clinicRoutes !== 'function') {
    console.error('FATAL ERROR: clinicRoutes is not a function. Check export from ./routes/clinicRoutes.js');
    process.exit(1);
}
app.use('/clinics', clinicRoutes);

if (typeof specialityRoutes !== 'function') {
    console.error('FATAL ERROR: specialityRoutes is not a function. Check export from ./routes/specialityRoutes.js');
    process.exit(1);
}
app.use('/specialities', specialityRoutes); // Dòng này có thể là dòng 24 hoặc gần đó

// Route cơ bản để kiểm tra service có chạy không
app.get('/', (req, res) => {
    res.send('Doctor Service is running with Doctor, Clinic, and Speciality routes!');
});

// Error handling middleware (đặt ở cuối cùng)
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Unhandled Error:`, err.stack || err);
    res.status(500).json({ message: 'An unexpected error occurred on the server.' });
});


const PORT = process.env.DOCTOR_SERVICE_PORT || 3002;
app.listen(PORT, () => {
    console.log(`Doctor Service listening on port ${PORT}`);
});
