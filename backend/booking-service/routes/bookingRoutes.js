// backend/booking-service/routes/bookingRoutes.js
const express = require('express');
const db = require('../db');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios'); // Để gọi Doctor Service

const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3002';

// Helper function để gọi Doctor Service và cập nhật is_booked
async function updateDoctorScheduleSlot(doctorId, scheduleId, is_booked, token) {
    try {
        // API này trong doctor-service cần được bảo vệ và chấp nhận token
        // Hoặc nếu giao tiếp service-to-service, có thể dùng một cơ chế xác thực khác (ví dụ: API key riêng)
        // Hiện tại, giả sử nó dùng cùng token admin hoặc một token dịch vụ đặc biệt
        const response = await axios.put(
            `${DOCTOR_SERVICE_URL}/doctors/${doctorId}/schedules/${scheduleId}`,
            { is_booked },
            { headers: { Authorization: `Bearer ${token}` } } // Cần token có quyền cập nhật
        );
        console.log(`[BookingRoutes] Slot ${scheduleId} update response from Doctor Service:`, response.data.message);
        return true;
    } catch (error) {
        console.error(`[BookingRoutes] Error updating doctor schedule slot ${scheduleId} to is_booked=${is_booked}:`,
            error.response?.data || error.message
        );
        // Nếu lỗi, chúng ta có thể cần rollback việc tạo appointment
        return false;
    }
}

// CREATE a new appointment (Bệnh nhân đặt lịch)
router.post('/', authMiddleware, async (req, res) => {
    const patientUserId = req.user.userId; // Lấy từ token của bệnh nhân đang đăng nhập
    const { doctor_id, doctor_schedule_id, reason_for_visit } = req.body;

    if (!doctor_id || !doctor_schedule_id) {
        return res.status(400).json({ message: 'Doctor ID and Doctor Schedule ID are required.' });
    }

    let connection;
    try {
        connection = await db.getConnection(); // Lấy một connection từ pool để dùng transaction
        await connection.beginTransaction();

        // Bước 1: Kiểm tra xem doctor_schedule_id có tồn tại và còn trống không (is_booked = false)
        // Đồng thời lấy thông tin doctor_id từ schedule để đảm bảo tính nhất quán
        const [schedules] = await connection.query(
            'SELECT id, doctor_id, is_booked FROM doctor_schedules WHERE id = ? FOR UPDATE', // FOR UPDATE để khóa dòng này lại
            [doctor_schedule_id]
        );

        if (schedules.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: `Doctor schedule slot with ID ${doctor_schedule_id} not found.` });
        }

        const scheduleSlot = schedules[0];

        if (scheduleSlot.doctor_id !== parseInt(doctor_id)) {
            await connection.rollback();
            return res.status(400).json({ message: 'Doctor ID provided does not match the doctor for this schedule slot.' });
        }

        if (scheduleSlot.is_booked) {
            await connection.rollback();
            return res.status(409).json({ message: `Schedule slot ID ${doctor_schedule_id} is already booked.` });
        }

        // Bước 2: Tạo lịch hẹn trong bảng appointments
        const [appointmentResult] = await connection.query(
            'INSERT INTO appointments (patient_user_id, doctor_id, doctor_schedule_id, status, reason_for_visit) VALUES (?, ?, ?, ?, ?)',
            [patientUserId, parseInt(doctor_id), doctor_schedule_id, 'PENDING', reason_for_visit || null]
        );
        const newAppointmentId = appointmentResult.insertId;

        // Bước 3: Cập nhật is_booked = true cho doctor_schedule_id trong bảng doctor_schedules
        // Cách 1: Gọi API của Doctor Service (nếu bạn muốn tách biệt hoàn toàn)
        // const tokenForServiceCall = req.headers.authorization.split(' ')[1]; // Lấy token hiện tại để gọi service khác (cần quyền admin/service)
        // const slotUpdated = await updateDoctorScheduleSlot(parseInt(doctor_id), doctor_schedule_id, true, tokenForServiceCall);
        // if (!slotUpdated) {
        //     await connection.rollback();
        //     return res.status(500).json({ message: 'Failed to update doctor schedule slot. Appointment creation rolled back.' });
        // }

        // Cách 2: Cập nhật trực tiếp vào DB (nếu các service dùng chung DB và bạn chấp nhận耦合)
        // Đây là cách đơn giản hơn cho dự án nhỏ
        const [updateResult] = await connection.query(
            'UPDATE doctor_schedules SET is_booked = TRUE WHERE id = ? AND is_booked = FALSE', // Thêm AND is_booked = FALSE để đảm bảo an toàn
            [doctor_schedule_id]
        );

        if (updateResult.affectedRows === 0) {
            // Trường hợp hiếm: slot đã bị đặt bởi một request khác ngay sau khi kiểm tra ở Bước 1
            await connection.rollback();
            return res.status(409).json({ message: 'Failed to book schedule slot as it was booked by another request. Please try again.' });
        }


        await connection.commit(); // Hoàn tất transaction
        res.status(201).json({ id: newAppointmentId, message: 'Appointment created successfully. Status is PENDING.' });

    } catch (error) {
        if (connection) await connection.rollback(); // Rollback nếu có lỗi
        console.error('[BookingRoutes-POST] Error creating appointment:', error);
        if (error.code === 'ER_DUP_ENTRY' && error.message.includes('appointments.doctor_schedule_id')) {
            return res.status(409).json({ message: 'This schedule slot has already been booked (duplicate entry).', error: error.message });
        }
        res.status(500).json({ message: 'Failed to create appointment.', error: error.message, stack: error.stac });
    } finally {
        if (connection) connection.release(); // Luôn giải phóng connection
    }
});

router.post('/appointments', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Yêu cầu xác thực người dùng.' });
        }
        const { doctor_id, doctor_schedule_id, reason_for_visit } = req.body;
        console.log('Đang tạo lịch hẹn cho user:', userId, 'với dữ liệu:', req.body);

        const [result] = await db.query(
            'INSERT INTO appointments (patient_user_id, doctor_id, doctor_schedule_id, status, reason_for_visit) VALUES (?, ?, ?, ?, ?)',
            [userId, doctor_id, doctor_schedule_id, 'PENDING', reason_for_visit]
        );
        res.status(201).json({ message: 'Tạo lịch hẹn thành công.', appointmentId: result.insertId });
    } catch (error) {
        console.error('[BookingRoutes-POST] Lỗi tạo lịch hẹn:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo lịch hẹn.', error: error.message });
    }
});
// Các API khác cho GET, PUT, DELETE appointments sẽ được thêm sau
// GET /appointments/my (lấy lịch hẹn của bệnh nhân đang đăng nhập)
// GET /appointments/doctor/:doctorId (lấy lịch hẹn của bác sĩ)
// PUT /appointments/:appointmentId/cancel (hủy lịch hẹn)

module.exports = router;
