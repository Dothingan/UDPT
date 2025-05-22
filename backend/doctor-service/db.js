// Ví dụ cho: backend/doctor-service/db.js
const mysql = require('mysql2');
require('dotenv').config(); // Bỏ dòng này nếu service chạy trong Docker và nhận env từ docker-compose

// Biến môi trường sẽ được truyền vào từ Docker Compose
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

console.log(`[DoctorService-db.js] Initializing DB connection with:`);
console.log(`  DB_HOST: ${dbHost}`);
console.log(`  DB_USER: ${dbUser}`);
console.log(`  DB_NAME: ${dbName}`);
// Không log DB_PASSWORD

let pool;
if (!dbHost || !dbUser || !dbName) { // Kiểm tra các biến môi trường cơ bản
    console.error('[DoctorService-db.js] CRITICAL: Missing one or more required DB environment variables (DB_HOST, DB_USER, DB_NAME).');
    pool = null; // Đảm bảo pool là null nếu thiếu thông tin
} else {
    try {
        pool = mysql.createPool({
            host: dbHost,
            user: dbUser,
            password: dbPassword, // dbPassword có thể là undefined nếu không đặt, MySQL sẽ xử lý
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 20000 // 20 giây
        });
        console.log('[DoctorService-db.js] MySQL Pool created.');
    } catch (error) {
        console.error('[DoctorService-db.js] CRITICAL: Failed to create MySQL Pool object:', error);
        pool = null; // Đảm bảo pool là null nếu có lỗi
    }
}


if (!pool) {
    console.error('[DoctorService-db.js] CRITICAL: MySQL Pool is undefined or failed to initialize.');
    module.exports = {
        query: () => Promise.reject(new Error("DoctorService DB pool is not initialized or connection failed.")),
        execute: () => Promise.reject(new Error("DoctorService DB pool is not initialized or connection failed."))
    };
} else {
    // Test kết nối ban đầu
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('[DoctorService-db.js] Error connecting to DB via pool test connection:', err.code, err.message);
            // Không throw error ở đây để service có thể vẫn khởi động và thử kết nối lại sau
            return;
        }
        if (connection) {
            console.log('[DoctorService-db.js] Successfully connected to DB (test connection).');
            connection.release();
        }
    });
    console.log('[DoctorService-db.js] Exporting pool.promise()...');
    module.exports = pool.promise();
}
