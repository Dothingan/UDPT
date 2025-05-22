// auth-service/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
// const db = require('./db'); // db.js đã tự kết nối khi được require, không cần gọi gì thêm ở đây trừ khi muốn test.

const app = express();

app.use(cors()); // Cho phép CORS, cấu hình chặt hơn cho production
app.use(express.json()); // Để parse JSON request bodies

app.use('/auth', authRoutes); // Sử dụng authRoutes cho các path bắt đầu bằng /auth

app.get('/', (req, res) => {
    res.send('Auth Service with MySQL is running!');
});

const PORT = process.env.AUTH_SERVICE_PORT || 3001;
app.listen(PORT, () => {
    console.log(`Auth Service (MySQL) listening on port ${PORT}`);
});