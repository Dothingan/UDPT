// backend/patient-service/routes/medicalHistoryRoutes.js
const express = require('express');
const db = require('../db');
// { mergeParams: true } cho phép router con truy cập params từ router cha (ví dụ :patientId)
const router = express.Router({ mergeParams: true });
const authMiddleware = require('../middleware/authMiddleware');

// Middleware để kiểm tra xem patientId có hợp lệ và người dùng có quyền truy cập không
// (Có thể tách ra thành middleware riêng nếu dùng nhiều)
async function checkPatientAccess(req, res, next) {
    const { patientId } = req.params;
    const requestingUserId = req.user.userId;
    const requestingUserRole = req.user.role;

    if (isNaN(parseInt(patientId))) {
        return res.status(400).json({ message: 'Patient ID must be an integer.' });
    }

    try {
        const [patients] = await db.query('SELECT id, user_id FROM patients WHERE id = ?', [patientId]);
        if (patients.length === 0) {
            return res.status(404).json({ message: `Patient profile with ID ${patientId} not found.` });
        }
        const patient = patients[0];
        req.patient = patient; // Gắn thông tin patient vào request để dùng sau

        // Phân quyền: Admin, hoặc chính bệnh nhân đó, hoặc bác sĩ (cần logic phức tạp hơn cho bác sĩ)
        if (requestingUserRole === 'admin' || (patient.user_id && patient.user_id === requestingUserId)) {
            next();
        } else {
            // TODO: Thêm logic cho phép bác sĩ truy cập lịch sử bệnh nhân họ đang điều trị
            return res.status(403).json({ message: 'Forbidden: You do not have permission to access medical history for this patient.' });
        }
    } catch (error) {
        console.error(`[MedicalHistoryRoutes-Middleware] Error checking patient access for patient ${patientId}:`, error);
        return res.status(500).json({ message: 'Error verifying patient access.', error: error.message });
    }
}


// CREATE a new medical history entry for a patient
// Ai có thể tạo: Admin, Bác sĩ (cho bệnh nhân của họ), hoặc Bệnh nhân tự thêm (tùy logic)
router.post('/', authMiddleware, checkPatientAccess, async (req, res) => {
    const { patientId } = req.params; // Lấy từ URL
    const { entry_date, entry_type, title, description, doctor_id, clinic_id, attachments_urls } = req.body;

    if (!entry_date || !description) {
        return res.status(400).json({ message: 'Entry date and description are required.' });
    }

    // (Tùy chọn) Kiểm tra doctor_id, clinic_id có tồn tại không
    // ...

    try {
        const [result] = await db.query(
            'INSERT INTO medical_history_entries (patient_id, entry_date, entry_type, title, description, doctor_id, clinic_id, attachments_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [patientId, entry_date, entry_type, title, description, doctor_id || null, clinic_id || null, attachments_urls ? JSON.stringify(attachments_urls) : null]
        );
        res.status(201).json({ id: result.insertId, message: 'Medical history entry created successfully.' });
    } catch (error) {
        console.error(`[MedicalHistoryRoutes-POST /patients/${patientId}/history] Error creating entry:`, error);
        res.status(500).json({ message: 'Failed to create medical history entry.', error: error.message });
    }
});

// GET all medical history entries for a patient
router.get('/', authMiddleware, checkPatientAccess, async (req, res) => {
    const { patientId } = req.params;
    try {
        // Sắp xếp theo ngày giảm dần để xem mục mới nhất trước
        const [entries] = await db.query('SELECT * FROM medical_history_entries WHERE patient_id = ? ORDER BY entry_date DESC, created_at DESC', [patientId]);
        res.json(entries);
    } catch (error) {
        console.error(`[MedicalHistoryRoutes-GET /patients/${patientId}/history] Error fetching entries:`, error);
        res.status(500).json({ message: 'Failed to fetch medical history entries.', error: error.message });
    }
});

// GET a specific medical history entry
router.get('/:entryId', authMiddleware, checkPatientAccess, async (req, res) => {
    const { patientId, entryId } = req.params;
    if (isNaN(parseInt(entryId))) {
        return res.status(400).json({ message: 'Entry ID must be an integer.' });
    }
    try {
        const [entries] = await db.query('SELECT * FROM medical_history_entries WHERE id = ? AND patient_id = ?', [entryId, patientId]);
        if (entries.length === 0) {
            return res.status(404).json({ message: 'Medical history entry not found.' });
        }
        res.json(entries[0]);
    } catch (error) {
        console.error(`[MedicalHistoryRoutes-GET /patients/${patientId}/history/${entryId}] Error fetching entry:`, error);
        res.status(500).json({ message: 'Failed to fetch medical history entry.', error: error.message });
    }
});

// UPDATE a medical history entry
router.put('/:entryId', authMiddleware, checkPatientAccess, async (req, res) => {
    const { patientId, entryId } = req.params;
    if (isNaN(parseInt(entryId))) {
        return res.status(400).json({ message: 'Entry ID must be an integer.' });
    }
    const { entry_date, entry_type, title, description, doctor_id, clinic_id, attachments_urls } = req.body;

    let setClauses = [];
    const paramsToUpdate = [];
    const addUpdate = (field, value, isJson = false) => {
        if (value !== undefined) {
            setClauses.push(`${field} = ?`);
            paramsToUpdate.push(isJson && value !== null ? JSON.stringify(value) : (value === '' ? null : value) );
        }
    };

    addUpdate('entry_date', entry_date);
    addUpdate('entry_type', entry_type);
    addUpdate('title', title);
    addUpdate('description', description);
    addUpdate('doctor_id', doctor_id);
    addUpdate('clinic_id', clinic_id);
    addUpdate('attachments_urls', attachments_urls, true);


    if (setClauses.length === 0) {
        return res.status(400).json({ message: 'No fields to update provided.' });
    }

    const query = `UPDATE medical_history_entries SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND patient_id = ?`;
    paramsToUpdate.push(entryId, patientId);

    try {
        const [result] = await db.query(query, paramsToUpdate);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medical history entry not found or no new data to update.' });
        }
        res.json({ message: 'Medical history entry updated successfully.' });
    } catch (error) {
        console.error(`[MedicalHistoryRoutes-PUT /patients/${patientId}/history/${entryId}] Error updating entry:`, error);
        res.status(500).json({ message: 'Failed to update medical history entry.', error: error.message });
    }
});

// DELETE a medical history entry
router.delete('/:entryId', authMiddleware, checkPatientAccess, async (req, res) => {
    const { patientId, entryId } = req.params;
    if (isNaN(parseInt(entryId))) {
        return res.status(400).json({ message: 'Entry ID must be an integer.' });
    }
    try {
        const [result] = await db.query('DELETE FROM medical_history_entries WHERE id = ? AND patient_id = ?', [entryId, patientId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medical history entry not found.' });
        }
        res.json({ message: 'Medical history entry deleted successfully.' });
    } catch (error) {
        console.error(`[MedicalHistoryRoutes-DELETE /patients/${patientId}/history/${entryId}] Error deleting entry:`, error);
        res.status(500).json({ message: 'Failed to delete medical history entry.', error: error.message });
    }
});


module.exports = router;
