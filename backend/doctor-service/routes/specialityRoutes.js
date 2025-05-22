// backend/doctor-service/routes/specialityRoutes.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// CREATE a new speciality
router.post('/', async (req, res) => {
    const { name, description, image_url } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Speciality name is required.' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO specialities (name, description, image_url) VALUES (?, ?, ?)',
            [name, description, image_url]
        );
        res.status(201).json({ id: result.insertId, message: 'Speciality created successfully.' });
    } catch (error) {
        console.error('[SpecialityRoutes-POST] Error creating speciality:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Speciality name already exists.', error: error.message });
        }
        res.status(500).json({ message: 'Failed to create speciality.', error: error.message });
    }
});

// GET all specialities
router.get('/', async (req, res) => {
    try {
        const [specialities] = await db.query('SELECT * FROM specialities ORDER BY name ASC');
        res.json(specialities);
    } catch (error) {
        console.error('[SpecialityRoutes-GET /] Error fetching specialities:', error);
        res.status(500).json({ message: 'Failed to fetch specialities.', error: error.message });
    }
});

// GET a single speciality by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: 'Speciality ID must be an integer.' });
    }
    try {
        const [specialities] = await db.query('SELECT * FROM specialities WHERE id = ?', [id]);
        if (specialities.length === 0) {
            return res.status(404).json({ message: 'Speciality not found.' });
        }
        res.json(specialities[0]);
    } catch (error) {
        console.error('[SpecialityRoutes-GET /:id] Error fetching speciality by ID:', error);
        res.status(500).json({ message: 'Failed to fetch speciality.', error: error.message });
    }
});

// UPDATE a speciality by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: 'Speciality ID must be an integer.' });
    }
    const { name, description, image_url } = req.body;

    let setClauses = [];
    const params = [];
    if (name !== undefined) { setClauses.push('name = ?'); params.push(name); }
    if (description !== undefined) { setClauses.push('description = ?'); params.push(description); }
    if (image_url !== undefined) { setClauses.push('image_url = ?'); params.push(image_url); }

    if (setClauses.length === 0) {
        return res.status(400).json({ message: 'No fields to update provided.' });
    }

    const query = `UPDATE specialities SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    params.push(id);

    try {
        const [result] = await db.query(query, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Speciality not found or no new data to update.' });
        }
        res.json({ message: 'Speciality updated successfully.' });
    } catch (error) {
        console.error('[SpecialityRoutes-PUT] Error updating speciality:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Speciality name already exists.', error: error.message });
        }
        res.status(500).json({ message: 'Failed to update speciality.', error: error.message });
    }
});

// DELETE a speciality by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: 'Speciality ID must be an integer.' });
    }
    try {
        // Cân nhắc: Trước khi xóa chuyên khoa, kiểm tra xem có bác sĩ nào đang thuộc chuyên khoa này không.
        // Nếu có, có thể không cho xóa hoặc set speciality_id của bác sĩ thành NULL.
        const [result] = await db.query('DELETE FROM specialities WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Speciality not found.' });
        }
        res.json({ message: 'Speciality deleted successfully.' });
    } catch (error) {
        console.error('[SpecialityRoutes-DELETE] Error deleting speciality:', error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2'){ // Lỗi nếu có bác sĩ đang tham chiếu đến chuyên khoa này
            return res.status(400).json({ message: 'Cannot delete speciality as it is currently assigned to one or more doctors.', error: error.message });
        }
        res.status(500).json({ message: 'Failed to delete speciality.', error: error.message });
    }
});

module.exports = router;