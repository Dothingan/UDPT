// backend/auth-service/db.js
const mysql = require('mysql2');
require('dotenv').config();

console.log('[db.js] DB_HOST from .env:', process.env.DB_HOST); // Dòng log để kiểm tra .env

let pool;
try {
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    console.log('[db.js] MySQL Pool created.');
} catch (error) {
    console.error('[db.js] CRITICAL: Failed to create MySQL Pool object:', error);
    // Nếu pool không tạo được, chúng ta không nên tiếp tục
    // Hoặc là throw error, hoặc export một cái gì đó mà sẽ gây lỗi rõ ràng hơn
    // Ví dụ, để lỗi xảy ra ở đây luôn:
    // throw new Error('Failed to create MySQL Pool in db.js');
}


if (!pool) {
    console.error('[db.js] CRITICAL: MySQL Pool is undefined after creation attempt. Make sure mysql2 is installed and .env variables are correct.');
    // Export một cái gì đó sẽ gây lỗi nếu cố sử dụng, hoặc throw error
    module.exports = {
        query: () => Promise.reject(new Error("Database pool is not initialized.")),
        execute: () => Promise.reject(new Error("Database pool is not initialized."))
    };
    // Hoặc: throw new Error("Database pool could not be initialized in db.js");
} else {
    // Test kết nối (optional, nhưng hữu ích để debug sớm)
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('[db.js] Error getting a connection from pool to MySQL database:', err.code, err.message);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.error('[db.js] Database connection was closed.');
            }
            if (err.code === 'ER_CON_COUNT_ERROR') {
                console.error('[db.js] Database has too many connections.');
            }
            if (err.code === 'ECONNREFUSED') {
                console.error('[db.js] Database connection was refused. Is MySQL server running and accessible? Are .env variables correct?');
            }
            // Không throw error ở đây vì đây là test bất đồng bộ, có thể chỉ log
            return;
        }
        if (connection) {
            console.log('[db.js] Successfully connected to MySQL database via pool (test connection).');
            connection.release();
        }
    });

    console.log('[db.js] Exporting pool.promise()...');
    module.exports = pool.promise(); // Đảm bảo dòng này là chính xác
}