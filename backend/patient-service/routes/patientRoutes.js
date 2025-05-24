// backend/patient-service/routes/patientRoutes.js
const express = require('express');
const db = require('../db');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// CREATE a new patient profile
// Ai có thể tạo: Admin, hoặc chính người dùng đó tạo hồ sơ cho mình.
router.post('/', authMiddleware, async (req, res) => {
    const {
        user_id, full_name, date_of_birth, gender,
        phone_number, address, blood_type, allergies, chronic_conditions
    } = req.body;

    // Nếu user_id được cung cấp, nó phải khớp với user đang đăng nhập (nếu không phải admin)
    // Hoặc admin có thể tạo cho bất kỳ user_id nào (hoặc tạo patient không cần user_id)
    const creatingUserId = req.user.userId; // Lấy từ token
    const targetUserId = user_id ? parseInt(user_id) : null;

    if (!full_name) {
        return res.status(400).json({ message: 'Full name is required.' });
    }

    // Logic phân quyền tạo:
    // 1. Admin có thể tạo cho bất kỳ ai, hoặc không cần user_id.
    // 2. Patient có thể tự tạo hồ sơ cho mình (targetUserId phải là creatingUserId).
    if (req.user.role !== 'admin' && targetUserId && targetUserId !== creatingUserId) {
        return res.status(403).json({ message: 'Forbidden: You can only create a patient profile for yourself.' });
    }
    // Nếu không phải admin và không cung cấp user_id, mặc định user_id là của người đang tạo
    const finalUserId = (req.user.role !== 'admin' && !targetUserId) ? creatingUserId : targetUserId;


    try {
        // Kiểm tra user_id có tồn tại không nếu được cung cấp
        if (finalUserId) {
            const [users] = await db.query('SELECT id FROM users WHERE id = ?', [finalUserId]);
            if (users.length === 0) {
                return res.status(400).json({ message: `User with ID ${finalUserId} not found.` });
            }
        }

        const [result] = await db.query(
            'INSERT INTO patients (user_id, full_name, date_of_birth, gender, phone_number, address, blood_type, allergies, chronic_conditions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [finalUserId, full_name, date_of_birth, gender, phone_number, address, blood_type, allergies, chronic_conditions]
        );
        res.status(201).json({ id: result.insertId, message: 'Patient profile created successfully.' });
    } catch (error) {
        console.error('[PatientRoutes-POST] Error creating patient profile:', error);
        if (error.code === 'ER_DUP_ENTRY') { // Do user_id hoặc phone_number có UNIQUE constraint
            if (error.message.includes('patients.user_id')) {
                return res.status(409).json({ message: 'A patient profile already exists for this user ID.', error: error.message });
            }
            if (error.message.includes('patients.phone_number')) {
                return res.status(409).json({ message: 'This phone number is already associated with another patient profile.', error: error.message });
            }
        }
        res.status(500).json({ message: 'Failed to create patient profile.', error: error.message });
    }
});

// GET patient profile for the logged-in user (hoặc user_id cụ thể nếu là admin)
// GET /patients/me (lấy thông tin patient của user đang đăng nhập)
// GET /patients/:patientId (admin lấy thông tin patient bất kỳ)
// GET /patients/user/:userId (admin lấy thông tin patient theo user_id)

// Lấy thông tin bệnh nhân của chính người dùng đang đăng nhập
router.get('/me', authMiddleware, async (req, res) => {
    const userId = req.user.userId; // Lấy từ token
    try {
        const [patients] = await db.query('SELECT * FROM patients WHERE user_id = ?', [userId]);
        if (patients.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found for the current user.' });
        }
        res.json(patients[0]);
    } catch (error) {
        console.error('[PatientRoutes-GET /me] Error fetching patient profile for user:', userId, error);
        res.status(500).json({ message: 'Failed to fetch patient profile.', error: error.message });
    }
});

// GET a specific patient profile by patientId (Admin hoặc chính bệnh nhân đó, hoặc bác sĩ liên quan)
router.get('/:patientId', authMiddleware, async (req, res) => {
    const { patientId } = req.params;
    const requestingUserId = req.user.userId;
    const requestingUserRole = req.user.role;

    if (isNaN(parseInt(patientId))) {
        return res.status(400).json({ message: 'Patient ID must be an integer.' });
    }

    try {
        const [patients] = await db.query('SELECT * FROM patients WHERE id = ?', [patientId]);
        if (patients.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }
        const patient = patients[0];

        // Phân quyền: Admin được xem, hoặc chính bệnh nhân đó (nếu patient.user_id khớp)
        // Bác sĩ cũng có thể được xem nếu có logic nghiệp vụ cho phép (hiện tại chưa thêm)
        if (requestingUserRole === 'admin' || (patient.user_id && patient.user_id === requestingUserId)) {
            res.json(patient);
        } else {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to view this patient profile.' });
        }
    } catch (error) {
        console.error(`[PatientRoutes-GET /:patientId] Error fetching patient profile ${patientId}:`, error);
        res.status(500).json({ message: 'Failed to fetch patient profile.', error: error.message });
    }
});


// Endpoint lấy danh sách cuộc hẹn của bệnh nhân
// router.get('/appointments/me', authMiddleware, async (req, res) => {
//     try {
//         console.log('Đang tải lịch hẹn cho user:', req.user.userId);
//         const userId = req.user.userId;
//         const appointments = await db('appointments')
//             .select(
//                 'appointments.id',
//                 'appointments.reason_for_visit',
//                 'appointments.status',
//                 'doctors.full_name as doctor_name',
//                 'doctor_schedules.schedule_date as appointment_date',
//                 db.raw('NULL as clinic_name')
//             )
//             .join('doctors', 'appointments.doctor_id', 'doctors.id')
//             .join('doctor_schedules', 'appointments.doctor_schedule_id', 'doctor_schedules.id')
//             .where('appointments.patient_user_id', userId); // Thay patient_user_id bằng patient_id nếu cần
//         console.log('Lịch hẹn đã tải:', appointments);
//         res.json(appointments);
//     } catch (error) {
//         console.error('[PatientRoutes-GET /appointments/me]', error);
//         res.status(500).json({ message: 'Lỗi server khi tải lịch hẹn.', error: error.message });
//     }
// });


// UPDATE patient profile (Admin hoặc chính bệnh nhân đó)
router.put('/:patientId', authMiddleware, async (req, res) => {
    const { patientId } = req.params;
    const requestingUserId = req.user.userId;
    const requestingUserRole = req.user.role;

    if (isNaN(parseInt(patientId))) {
        return res.status(400).json({ message: 'Patient ID must be an integer.' });
    }

    const {
        full_name, date_of_birth, gender, phone_number,
        address, blood_type, allergies, chronic_conditions
        // user_id không nên cho phép cập nhật qua đây để tránh nhầm lẫn
    } = req.body;

    try {
        // Kiểm tra xem patient profile có tồn tại và người dùng có quyền sửa không
        const [patients] = await db.query('SELECT user_id FROM patients WHERE id = ?', [patientId]);
        if (patients.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }
        const patientUserId = patients[0].user_id;

        if (requestingUserRole !== 'admin' && (!patientUserId || patientUserId !== requestingUserId)) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own patient profile.' });
        }

        let setClauses = [];
        const paramsToUpdate = [];
        const addUpdate = (field, value) => {
            if (value !== undefined) { // Cho phép truyền giá trị rỗng để xóa (nếu cột cho phép NULL)
                setClauses.push(`${field} = ?`);
                paramsToUpdate.push(value === '' ? null : value);
            }
        };

        addUpdate('full_name', full_name);
        addUpdate('date_of_birth', date_of_birth);
        addUpdate('gender', gender);
        addUpdate('phone_number', phone_number);
        addUpdate('address', address);
        addUpdate('blood_type', blood_type);
        addUpdate('allergies', allergies);
        addUpdate('chronic_conditions', chronic_conditions);

        if (setClauses.length === 0) {
            return res.status(400).json({ message: 'No fields to update provided.' });
        }

        const query = `UPDATE patients SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        paramsToUpdate.push(patientId);

        const [result] = await db.query(query, paramsToUpdate);
        if (result.affectedRows === 0) {
            // Điều này không nên xảy ra nếu check ở trên đã pass
            return res.status(404).json({ message: 'Patient profile not found or no new data to update.' });
        }
        res.json({ message: 'Patient profile updated successfully.' });

    } catch (error) {
        console.error(`[PatientRoutes-PUT /:patientId] Error updating patient profile ${patientId}:`, error);
        if (error.code === 'ER_DUP_ENTRY' && error.message.includes('patients.phone_number')) {
            return res.status(409).json({ message: 'This phone number is already associated with another patient profile.', error: error.message });
        }
        res.status(500).json({ message: 'Failed to update patient profile.', error: error.message });
    }
});

// DELETE patient profile (Admin only)
router.delete('/:patientId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Only admins can delete patient profiles.' });
    }
    const { patientId } = req.params;
    if (isNaN(parseInt(patientId))) {
        return res.status(400).json({ message: 'Patient ID must be an integer.' });
    }
    try {
        // Khi xóa patient, các medical_history_entries liên quan sẽ tự động bị xóa do ON DELETE CASCADE
        const [result] = await db.query('DELETE FROM patients WHERE id = ?', [patientId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }
        res.json({ message: 'Patient profile deleted successfully.' });
    } catch (error) {
        console.error(`[PatientRoutes-DELETE /:patientId] Error deleting patient profile ${patientId}:`, error);
        res.status(500).json({ message: 'Failed to delete patient profile.', error: error.message });
    }
});

// // PUT /appointments/:appointmentId
// router.put('/appointments/:appointmentId', authMiddleware, async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         const { appointmentId } = req.params;
//         const { reason_for_visit, status } = req.body;

//         const appointment = await db('appointments')
//             .where({ id: appointmentId, patient_user_id: userId })
//             .first();
//         if (!appointment) {
//             return res.status(404).json({ message: 'Lịch hẹn không tồn tại hoặc không thuộc về bạn.' });
//         }

//         await db('appointments')
//             .where({ id: appointmentId })
//             .update({
//                 reason_for_visit,
//                 status,
//                 updated_at: db.fn.now()
//             });

//         res.json({ message: 'Cập nhật lịch hẹn thành công.' });
//     } catch (error) {
//         console.error('[PatientRoutes-PUT /appointments/:appointmentId]', error);
//         res.status(500).json({ message: 'Lỗi server.' });
//     }
// });

// // DELETE /appointments/:appointmentId
// router.delete('/appointments/:appointmentId', authMiddleware, async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         const { appointmentId } = req.params;

//         const appointment = await db('appointments')
//             .where({ id: appointmentId, patient_user_id: userId })
//             .first();
//         if (!appointment) {
//             return res.status(404).json({ message: 'Lịch hẹn không tồn tại hoặc không thuộc về bạn.' });
//         }

//         await db('appointments')
//             .where({ id: appointmentId })
//             .del();

//         res.json({ message: 'Xóa lịch hẹn thành công.' });
//     } catch (error) {
//         console.error('[PatientRoutes-DELETE /appointments/:appointmentId]', error);
//         res.status(500).json({ message: 'Lỗi server.' });
//     }
// });
// // export const getMyPatientProfile = async () => {
// //     try {
// //         // Assuming `axios` is set up with the base URL already
// //         const response = await axios.get('/patients/me'); // Sends GET request to /patients/me
// //         return response.data; // Returns the patient profile data
// //     } catch (error) {
// //         console.error('Error fetching patient profile:', error);
// //         throw error; // Propagate the error
// //     }
// // };
// // // services/patientService.js
// // import axios from 'axios';

// // // Update the patient's profile for the logged-in user
// // export const updatePatientProfile = async (patientId, updatedData) => {
// //     try {
// //         // Assuming `axios` is set up with the base URL already
// //         const response = await axios.put(`/patients/${patientId}`, updatedData);
// //         return response.data; // Return the success message or updated profile
// //     } catch (error) {
// //         console.error('Error updating patient profile:', error);
// //         throw error; // Propagate the error
// //     }
// // };




// module.exports = router;
router.get('/appointments/me', authMiddleware, async (req, res) => {
    try {
        console.log('Đang tải lịch hẹn cho user:', req.user.userId);
        const userId = req.user.userId;
        const [appointments] = await db.query(
            `SELECT appointments.id,
                    appointments.reason_for_visit,
                    appointments.status,
                    doctors.full_name AS doctor_name,
                    doctor_schedules.schedule_date AS appointment_date,
                    NULL AS clinic_name
             FROM appointments
             JOIN doctors ON appointments.doctor_id = doctors.id
             JOIN doctor_schedules ON appointments.doctor_schedule_id = doctor_schedules.id
             WHERE appointments.patient_user_id = ?`,
            [userId]
        );
        console.log('Lịch hẹn đã tải:', appointments);
        res.json(appointments);
    } catch (error) {
        console.error('[PatientRoutes-GET /appointments/me]', error.message, error.sqlMessage);
        res.status(500).json({
            message: 'Lỗi server khi tải lịch hẹn.',
            error: error.message,
            sqlMessage: error.sqlMessage
        });
    }
});

router.put('/appointments/:appointmentId', authMiddleware, async (req, res) => {
    try {
        console.log('Đang cập nhật lịch hẹn:', req.params.appointmentId, 'cho user:', req.user.userId);
        const userId = req.user.userId;
        const { appointmentId } = req.params;
        const { reason_for_visit, status } = req.body;

        const [appointment] = await db.query(
            'SELECT * FROM appointments WHERE id = ? AND patient_user_id = ?',
            [appointmentId, userId]
        );
        if (!appointment.length) {
            return res.status(404).json({ message: 'Lịch hẹn không tồn tại hoặc không thuộc về bạn.' });
        }

        await db.query(
            'UPDATE appointments SET reason_for_visit = ?, status = ?, updated_at = NOW() WHERE id = ?',
            [reason_for_visit, status, appointmentId]
        );
        res.json({ message: 'Cập nhật lịch hẹn thành công.' });
    } catch (error) {
        console.error('[PatientRoutes-PUT /appointments/:appointmentId]', error.message, error.sqlMessage);
        res.status(500).json({
            message: 'Lỗi server khi cập nhật lịch hẹn.',
            error: error.message,
            sqlMessage: error.sqlMessage
        });
    }
});

router.delete('/appointments/:appointmentId', authMiddleware, async (req, res) => {
    try {
        console.log('Đang xóa lịch hẹn:', req.params.appointmentId, 'cho user:', req.user.userId);
        const userId = req.user.userId;
        const { appointmentId } = req.params;

        const [appointment] = await db.query(
            'SELECT * FROM appointments WHERE id = ? AND patient_user_id = ?',
            [appointmentId, userId]
        );
        if (!appointment.length) {
            return res.status(404).json({ message: 'Lịch hẹn không tồn tại hoặc không thuộc về bạn.' });
        }

        await db.query('DELETE FROM appointments WHERE id = ?', [appointmentId]);
        res.json({ message: 'Xóa lịch hẹn thành công.' });
    } catch (error) {
        console.error('[PatientRoutes-DELETE /appointments/:appointmentId]', error.message, error.sqlMessage);
        res.status(500).json({
            message: 'Lỗi server khi xóa lịch hẹn.',
            error: error.message,
            sqlMessage: error.sqlMessage
        });
    }
});

module.exports = router;