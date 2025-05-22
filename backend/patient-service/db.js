// backend/patient-service/db.js
const mysql = require('mysql2');
require('dotenv').config();

console.log('[PatientService-db.js] Attempting to connect with DB_HOST:', process.env.DB_HOST);
console.log('[PatientService-db.js] Attempting to connect with DB_USER:', process.env.DB_USER);
console.log('[PatientService-db.js] Attempting to connect with DB_NAME:', process.env.DB_NAME);

let pool;
try {
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 20000
    });
    console.log('[PatientService-db.js] MySQL Pool created.');
} catch (error) {
    console.error('[PatientService-db.js] CRITICAL: Failed to create MySQL Pool object:', error);
}

if (!pool) {
    console.error('[PatientService-db.js] CRITICAL: MySQL Pool is undefined.');
    module.exports = {
        query: () => Promise.reject(new Error("PatientService DB pool is not initialized.")),
        execute: () => Promise.reject(new Error("PatientService DB pool is not initialized."))
    };
} else {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('[PatientService-db.js] Error connecting to DB via pool test connection:', err.code, err.message);
            return;
        }
        if (connection) {
            console.log('[PatientService-db.js] Successfully connected to DB (test connection).');
            connection.release();
        }
    });
    console.log('[PatientService-db.js] Exporting pool.promise()...');
    module.exports = pool.promise();
}
