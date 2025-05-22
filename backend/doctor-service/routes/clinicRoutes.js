// backend/doctor-service/routes/clinicRoutes.js
const express = require('express');
const db = require('../db'); // Import db connection
const router = express.Router();

// Middleware xác thực (sẽ thêm sau, tạm thời bỏ qua để dễ test)
// const authMiddleware = require('../middleware/authMiddleware'); // Giả sử bạn sẽ tạo file này

// CREATE a new clinic
// Tạm thời chưa dùng authMiddleware
router.post('/', async (req, res) => {
    const { name, address, phone_number, email, website, description, image_url, operating_hours } = req.body;

    if (!name || !address) {
        return res.status(400).json({ message: 'Clinic name and address are required.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO clinics (name, address, phone_number, email, website, description, image_url, operating_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, address, phone_number, email, website, description, image_url, operating_hours]
        );
        res.status(201).json({ id: result.insertId, message: 'Clinic created successfully.' });
    } catch (error) {
        console.error('[ClinicRoutes] Error creating clinic:', error);
        if (error.code === 'ER_DUP_ENTRY') { // Bắt lỗi nếu email bị trùng (do có UNIQUE constraint)
            return res.status(409).json({ message: 'Email already exists for another clinic.', error: error.message });
        }
        res.status(500).json({ message: 'Failed to create clinic.', error: error.message });
    }
});

// GET all clinics
router.get('/', async (req, res) => {
    try {
        const [clinics] = await db.query('SELECT * FROM clinics');
        res.json(clinics);
    } catch (error) {
        console.error('[ClinicRoutes] Error fetching clinics:', error);
        res.status(500).json({ message: 'Failed to fetch clinics.', error: error.message });
    }
});

// GET a single clinic by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [clinics] = await db.query('SELECT * FROM clinics WHERE id = ?', [id]);
        if (clinics.length === 0) {
            return res.status(404).json({ message: 'Clinic not found.' });
        }
        res.json(clinics[0]);
    } catch (error) {
        console.error('[ClinicRoutes] Error fetching clinic by ID:', error);
        res.status(500).json({ message: 'Failed to fetch clinic.', error: error.message });
    }
});

// UPDATE a clinic by ID
// Tạm thời chưa dùng authMiddleware
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, address, phone_number, email, website, description, image_url, operating_hours } = req.body;

    // Xây dựng câu query động dựa trên các trường được cung cấp
    let setClauses = [];
    const params = [];

    if (name !== undefined) { setClauses.push('name = ?'); params.push(name); }
    if (address !== undefined) { setClauses.push('address = ?'); params.push(address); }
    if (phone_number !== undefined) { setClauses.push('phone_number = ?'); params.push(phone_number); }
    if (email !== undefined) { setClauses.push('email = ?'); params.push(email); }
    if (website !== undefined) { setClauses.push('website = ?'); params.push(website); }
    if (description !== undefined) { setClauses.push('description = ?'); params.push(description); }
    if (image_url !== undefined) { setClauses.push('image_url = ?'); params.push(image_url); }
    if (operating_hours !== undefined) { setClauses.push('operating_hours = ?'); params.push(operating_hours); }

    if (setClauses.length === 0) {
        return res.status(400).json({ message: 'No fields to update provided.' });
    }

    const query = `UPDATE clinics SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    params.push(id);

    try {
        const [result] = await db.query(query, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Clinic not found or no new data to update.' });
        }
        res.json({ message: 'Clinic updated successfully.' });
    } catch (error) {
        console.error('[ClinicRoutes] Error updating clinic:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already exists for another clinic.', error: error.message });
        }
        res.status(500).json({ message: 'Failed to update clinic.', error: error.message });
    }
});

// DELETE a clinic by ID
// Tạm thời chưa dùng authMiddleware
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Cân nhắc: Trước khi xóa phòng khám, bạn có thể muốn kiểm tra xem có bác sĩ nào đang liên kết với phòng khám này không
        // và quyết định hành động (ví dụ: không cho xóa, hoặc set clinic_id của bác sĩ thành NULL)
        const [result] = await db.query('DELETE FROM clinics WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Clinic not found.' });
        }
        res.json({ message: 'Clinic deleted successfully.' });
    } catch (error) {
        console.error('[ClinicRoutes] Error deleting clinic:', error);
        res.status(500).json({ message: 'Failed to delete clinic.', error: error.message });
    }
});

module.exports = router;