// backend/doctor-service/server.js
// Bỏ require('dotenv').config(); nếu chạy hoàn toàn qua Docker và biến env được truyền từ docker-compose
// Nếu chạy local trực tiếp (npm run dev) thì giữ lại require('dotenv').config();
if (process.env.NODE_ENV !== 'docker') { // Ví dụ: chỉ load dotenv nếu không phải môi trường docker
    require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
}

const express = require('express');
const cors = require('cors');

// Import routes
const doctorRoutes = require('./routes/doctorRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const specialityRoutes = require('./routes/specialityRoutes');
// authMiddleware không cần import ở đây, nó được dùng trong các file route

const app = express();

// Middlewares
app.use(cors()); // Cho phép CORS cho tất cả các origin (cấu hình chặt hơn cho production)
app.use(express.json()); // Để parse JSON request bodies

// Logging middleware đơn giản (bạn có thể dùng morgan cho phức tạp hơn)
app.use((req, res, next) => {
    const userId = req.user ? req.user.userId : 'Guest';
    const role = req.user ? req.user.role : 'N/A';
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - UserID: ${userId}, Role: ${role}`);
    next();
});

// API Routes
app.use('/doctors', doctorRoutes);
app.use('/clinics', clinicRoutes);
app.use('/specialities', specialityRoutes);

// Route cơ bản để kiểm tra service có chạy không
app.get('/', (req, res) => {
    res.send('Doctor Service is running with Doctor, Clinic, and Speciality routes!');
});

// Error handling middleware (phải đặt ở cuối cùng, sau tất cả app.use và app.get)
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] === Unhandled Error ===`);
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack);
    console.error('=========================');

    // Tránh gửi stack trace chi tiết cho client trong môi trường production
    if (res.headersSent) {
        return next(err); // Nếu header đã gửi, ủy thác cho error handler mặc định của Express
    }
    res.status(err.status || 500).json({
        message: err.message || 'An unexpected error occurred on the server.',
        // error: process.env.NODE_ENV === 'development' ? err : {} // Chỉ gửi chi tiết lỗi ở dev
    });
});


const PORT = process.env.DOCTOR_SERVICE_PORT || 3002;
app.listen(PORT, () => {
    console.log(`Doctor Service listening on port ${PORT}`);
    console.log(`JWT_SECRET used by Doctor Service: ${process.env.JWT_SECRET ? 'Loaded' : 'NOT LOADED - CRITICAL!'}`);
    console.log(`DB_HOST used by Doctor Service: ${process.env.DB_HOST}`);

});
