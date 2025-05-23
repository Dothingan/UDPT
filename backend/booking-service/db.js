// backend/booking-service/db.js
const mysql = require('mysql2');
require('dotenv').config(); // Bỏ comment nếu chạy local không qua Docker

// Biến môi trường sẽ được truyền vào từ Docker Compose
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

console.log(`[BookingService-db.js] Initializing DB connection with:`);
console.log(`  DB_HOST: ${dbHost}`);
console.log(`  DB_USER: ${dbUser}`);
console.log(`  DB_NAME: ${dbName}`);

let pool;
if (!dbHost || !dbUser || !dbName) {
    console.error('[BookingService-db.js] CRITICAL: Missing DB environment variables.');
    pool = null;
} else {
    try {
        pool = mysql.createPool({
            host: dbHost,
            user: dbUser,
            password: dbPassword,
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 20000
        });
        console.log('[BookingService-db.js] MySQL Pool created.');
    } catch (error) {
        console.error('[BookingService-db.js] CRITICAL: Failed to create MySQL Pool object:', error);
        pool = null;
    }
}

if (!pool) {
    console.error('[BookingService-db.js] CRITICAL: MySQL Pool is undefined or failed to initialize.');
    module.exports = {
        query: () => Promise.reject(new Error("BookingService DB pool is not initialized.")),
        execute: () => Promise.reject(new Error("BookingService DB pool is not initialized."))
    };
} else {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('[BookingService-db.js] Error connecting to DB via pool test connection:', err.code, err.message);
            return;
        }
        if (connection) {
            console.log('[BookingService-db.js] Successfully connected to DB (test connection).');
            connection.release();
        }
    });
    console.log('[BookingService-db.js] Exporting pool.promise()...');
    module.exports = pool.promise();
}
