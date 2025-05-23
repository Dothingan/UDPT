// backend/doctor-service/routes/doctorRoutes.js
const express = require('express');
const db = require('../db'); // Import db connection
const router = express.Router();
// Giả sử bạn đã tạo file middleware/authMiddleware.js
const authMiddleware = require('../middleware/authMiddleware');

// === DOCTOR CRUD OPERATIONS ===

// CREATE a new doctor - YÊU CẦU XÁC THỰC (ví dụ: chỉ admin)
router.post('/', authMiddleware, async (req, res) => {
    console.log(`[${new Date().toISOString()}] INFO: Attempting to CREATE doctor by UserID: ${req.user?.userId}, Role: ${req.user?.role}`);
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Only admins can create doctors.' });
    }

    const {
        full_name, email, phone_number,
        speciality_id,
        description, avatar_url, experience_years,
        clinic_id
    } = req.body;

    if (!full_name) {
        return res.status(400).json({ message: 'Full name is a required field.' });
    }

    // Kiểm tra sự tồn tại của speciality_id (nếu được cung cấp và không phải null/rỗng)
    if (speciality_id && speciality_id !== null && speciality_id !== '') {
        try {
            const [specialities] = await db.query('SELECT id FROM specialities WHERE id = ?', [parseInt(speciality_id)]);
            if (specialities.length === 0) {
                return res.status(400).json({ message: `Speciality with ID ${speciality_id} not found.` });
            }
        } catch (checkError) {
            console.error('[DoctorRoutes-POST] Error checking speciality existence:', checkError);
            return res.status(500).json({ message: 'Error verifying speciality existence.', error: checkError.message });
        }
    }

    // Kiểm tra sự tồn tại của clinic_id (nếu được cung cấp và không phải null/rỗng)
    if (clinic_id && clinic_id !== null && clinic_id !== '') {
        try {
            const [clinics] = await db.query('SELECT id FROM clinics WHERE id = ?', [parseInt(clinic_id)]);
            if (clinics.length === 0) {
                return res.status(400).json({ message: `Clinic with ID ${clinic_id} not found.` });
            }
        } catch (checkError) {
            console.error('[DoctorRoutes-POST] Error checking clinic existence:', checkError);
            return res.status(500).json({ message: 'Error verifying clinic existence.', error: checkError.message });
        }
    }

    try {
        const [result] = await db.query(
            'INSERT INTO doctors (full_name, email, phone_number, speciality_id, description, avatar_url, experience_years, clinic_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                full_name,
                email || null,
                phone_number || null,
                (speciality_id && speciality_id !== '') ? parseInt(speciality_id) : null,
                description || null,
                avatar_url || null,
                experience_years || 0,
                (clinic_id && clinic_id !== '') ? parseInt(clinic_id) : null
            ]
        );
        res.status(201).json({ id: result.insertId, message: 'Doctor created successfully.' });
    } catch (error) {
        console.error('[DoctorRoutes-POST] Error creating doctor:', error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            let field = error.message.includes('fk_doctor_clinic') ? 'clinic_id' : 'speciality_id';
            let id_value = error.message.includes('fk_doctor_clinic') ? clinic_id : speciality_id;
            return res.status(400).json({ message: `Invalid ${field}. Item with ID ${id_value} does not exist.`, error: error.message });
        }
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email or phone number already exists for another doctor.', error: error.message });
        }
        res.status(500).json({ message: 'Failed to create doctor.', error: error.message });
    }
});

// GET all doctors (with clinic and speciality name) - Public
router.get('/', async (req, res) => {
    console.log(`[${new Date().toISOString()}] INFO: Received request for GET /doctors`);
    try {
        const query = `
            SELECT
                d.id, d.full_name, d.email, d.phone_number,
                d.description, d.avatar_url, d.experience_years, d.created_at, d.updated_at,
                d.clinic_id,
                c.name AS clinic_name,
                c.address AS clinic_address,
                d.speciality_id,
                s.name AS speciality_name
            FROM doctors d
                     LEFT JOIN clinics c ON d.clinic_id = c.id
                     LEFT JOIN specialities s ON d.speciality_id = s.id
            ORDER BY d.full_name ASC;
        `;
        const [doctors] = await db.query(query);
        res.json(doctors);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: [DoctorRoutes-GET /] Error fetching doctors:`, error);
        res.status(500).json({ message: 'Failed to fetch doctors.', error: error.message });
    }
});

// GET a single doctor by ID (with clinic and speciality name) - Public
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`[${new Date().toISOString()}] INFO: Received request for GET /doctors/${id}`);
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: 'Doctor ID must be an integer.' });
    }
    try {
        const query = `
            SELECT
                d.id, d.full_name, d.email, d.phone_number,
                d.description, d.avatar_url, d.experience_years, d.created_at, d.updated_at,
                d.clinic_id,
                c.name AS clinic_name,
                c.address AS clinic_address,
                d.speciality_id,
                s.name AS speciality_name
            FROM doctors d
                     LEFT JOIN clinics c ON d.clinic_id = c.id
                     LEFT JOIN specialities s ON d.speciality_id = s.id
            WHERE d.id = ?
        `;
        const [doctors] = await db.query(query, [id]);
        if (doctors.length === 0) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }
        res.json(doctors[0]);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: [DoctorRoutes-GET /:id] Error fetching doctor by ID ${id}:`, error);
        res.status(500).json({ message: 'Failed to fetch doctor.', error: error.message });
    }
});

// UPDATE a doctor by ID - YÊU CẦU XÁC THỰC (ví dụ: chỉ admin)
router.put('/:id', authMiddleware, async (req, res) => {
    console.log(`[${new Date().toISOString()}] INFO: Attempting to UPDATE doctor ID: ${req.params.id} by UserID: ${req.user?.userId}, Role: ${req.user?.role}`);
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Only admins can update doctors.' });
    }

    const { id } = req.params;
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: 'Doctor ID must be an integer.' });
    }
    const {
        full_name, email, phone_number,
        speciality_id,
        description, avatar_url, experience_years,
        clinic_id
    } = req.body;

    let setClauses = [];
    const paramsToUpdate = [];
    const addUpdate = (field, value, isNumericId = false) => {
        if (value !== undefined) {
            setClauses.push(`${field} = ?`);
            if ((field === 'clinic_id' || field === 'speciality_id') && (value === '' || value === null)) {
                paramsToUpdate.push(null);
            } else if (isNumericId && value !== null && value !== '') {
                paramsToUpdate.push(parseInt(value));
            } else {
                paramsToUpdate.push(value);
            }
        }
    };

    addUpdate('full_name', full_name);
    addUpdate('email', email);
    addUpdate('phone_number', phone_number);
    addUpdate('speciality_id', speciality_id, true);
    addUpdate('description', description);
    addUpdate('avatar_url', avatar_url);
    addUpdate('experience_years', experience_years);
    addUpdate('clinic_id', clinic_id, true);

    if (setClauses.length === 0) {
        return res.status(400).json({ message: 'No fields to update provided.' });
    }

    if (speciality_id && speciality_id !== '' && speciality_id !== null) {
        try {
            const [specialities] = await db.query('SELECT id FROM specialities WHERE id = ?', [parseInt(speciality_id)]);
            if (specialities.length === 0) {
                return res.status(400).json({ message: `Speciality with ID ${speciality_id} not found.` });
            }
        } catch (checkError) {
            console.error('[DoctorRoutes-PUT] Error checking speciality existence:', checkError);
            return res.status(500).json({ message: 'Error verifying speciality existence.', error: checkError.message });
        }
    }
    if (clinic_id && clinic_id !== '' && clinic_id !== null) {
        try {
            const [clinics] = await db.query('SELECT id FROM clinics WHERE id = ?', [parseInt(clinic_id)]);
            if (clinics.length === 0) {
                return res.status(400).json({ message: `Clinic with ID ${clinic_id} not found.` });
            }
        } catch (checkError) {
            console.error('[DoctorRoutes-PUT] Error checking clinic existence:', checkError);
            return res.status(500).json({ message: 'Error verifying clinic existence.', error: checkError.message });
        }
    }

    const query = `UPDATE doctors SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    paramsToUpdate.push(id);

    try {
        const [result] = await db.query(query, paramsToUpdate);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Doctor not found or no new data to update.' });
        }
        res.json({ message: 'Doctor updated successfully.' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: [DoctorRoutes-PUT] Error updating doctor ${id}:`, error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            let field = error.message.includes('fk_doctor_clinic') ? 'clinic_id' : 'speciality_id';
            let id_value = error.message.includes('fk_doctor_clinic') ? clinic_id : speciality_id;
            return res.status(400).json({ message: `Invalid ${field}. Item with ID ${id_value} does not exist.`, error: error.message });
        }
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email or phone number already exists for another doctor.', error: error.message });
        }
        res.status(500).json({ message: 'Failed to update doctor.', error: error.message });
    }
});

// DELETE a doctor by ID - YÊU CẦU XÁC THỰC (ví dụ: chỉ admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    console.log(`[${new Date().toISOString()}] INFO: Attempting to DELETE doctor ID: ${req.params.id} by UserID: ${req.user?.userId}, Role: ${req.user?.role}`);
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Only admins can delete doctors.' });
    }

    const { id } = req.params;
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: 'Doctor ID must be an integer.' });
    }
    try {
        const [result] = await db.query('DELETE FROM doctors WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }
        res.json({ message: 'Doctor deleted successfully.' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: [DoctorRoutes-DELETE] Error deleting doctor ${id}:`, error);
        res.status(500).json({ message: 'Failed to delete doctor.', error: error.message });
    }
});


// === SCHEDULE MANAGEMENT FOR A DOCTOR ===

// CREATE new schedule(s) for a doctor - YÊU CẦU XÁC THỰC
router.post('/:doctorId/schedules', authMiddleware, async (req, res) => {
    const { doctorId } = req.params;
    console.log(`[${new Date().toISOString()}] INFO: Received request for POST /doctors/${doctorId}/schedules by user ${req.user.userId} (role: ${req.user.role})`);

    // TODO: Implement proper authorization (e.g., admin or the doctor themselves)
    if (req.user.role !== 'admin') {
        console.warn(`[DoctorRoutes-POST /:doctorId/schedules] Authorization check needed for non-admin user.`);
        // For now, allow if authenticated, but this needs refinement
        // Example: check if req.user.userId corresponds to the doctorId if role is 'doctor'
    }

    let slots = req.body;
    if (!Array.isArray(slots)) {
        slots = [slots];
    }
    if (slots.some(slot => !slot.schedule_date || !slot.start_time || !slot.end_time)) {
        return res.status(400).json({ message: 'Each slot must have schedule_date (YYYY-MM-DD), start_time (HH:MM:SS), and end_time (HH:MM:SS).' });
    }

    try {
        const [doctors] = await db.query('SELECT id FROM doctors WHERE id = ?', [doctorId]);
        if (doctors.length === 0) {
            return res.status(404).json({ message: `Doctor with ID ${doctorId} not found.` });
        }
    } catch (docError) {
        console.error(`[${new Date().toISOString()}] ERROR: [DoctorRoutes-POST /:doctorId/schedules] Error checking doctor existence:`, docError);
        return res.status(500).json({ message: 'Error verifying doctor existence.', error: docError.message });
    }

    const createdSlotsInfo = [];
    const errors = [];

    for (const slot of slots) {
        try {
            if (new Date(`1970-01-01T${slot.start_time}Z`) >= new Date(`1970-01-01T${slot.end_time}Z`)) {
                errors.push({ slot, error: 'start_time must be before end_time' });
                continue;
            }
            const [result] = await db.query(
                'INSERT INTO doctor_schedules (doctor_id, schedule_date, start_time, end_time, is_booked) VALUES (?, ?, ?, ?, ?)',
                [doctorId, slot.schedule_date, slot.start_time, slot.end_time, false]
            );
            createdSlotsInfo.push({ id: result.insertId, ...slot });
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ERROR: [DoctorRoutes-POST /:doctorId/schedules] Error inserting slot:`, slot, error);
            let errorMessage = 'Failed to create schedule slot.';
            if (error.code === 'ER_DUP_ENTRY') {
                errorMessage = `Schedule slot for doctor ${doctorId} on ${slot.schedule_date} at ${slot.start_time} already exists.`;
            } else if (error.code === 'ER_NO_REFERENCED_ROW_2'){
                errorMessage = `Doctor with ID ${doctorId} does not exist (foreign key constraint).`;
            }
            errors.push({ slot, error: errorMessage, details: error.message });
        }
    }

    if (errors.length > 0 && createdSlotsInfo.length === 0) {
        return res.status(500).json({ message: 'All schedule slots failed to create.', errors });
    }
    if (errors.length > 0) {
        return res.status(207).json({ message: 'Some schedule slots created, but some failed.', created: createdSlotsInfo, errors });
    }
    res.status(201).json({ message: 'Schedule slots created successfully.', created: createdSlotsInfo });
});

// GET all schedules for a doctor (can filter by date range) - YÊU CẦU XÁC THỰC
router.get('/:doctorId/schedules', authMiddleware, async (req, res) => {
    const { doctorId } = req.params;
    console.log(`[${new Date().toISOString()}] INFO: Received request for GET /doctors/${doctorId}/schedules by user ${req.user.userId} (role: ${req.user.role})`);
    // TODO: Implement proper authorization

    const { startDate, endDate, date } = req.query;

    let query = 'SELECT * FROM doctor_schedules WHERE doctor_id = ?';
    const queryParams = [doctorId];
    if (date) {
        query += ' AND schedule_date = ?';
        queryParams.push(date);
    } else {
        if (startDate) { query += ' AND schedule_date >= ?'; queryParams.push(startDate); }
        if (endDate) { query += ' AND schedule_date <= ?'; queryParams.push(endDate); }
    }
    query += ' ORDER BY schedule_date ASC, start_time ASC';

    try {
        const [schedules] = await db.query(query, queryParams);
        res.json(schedules);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: [DoctorRoutes-GET /:doctorId/schedules] Error fetching schedules for doctor ${doctorId}:`, error);
        res.status(500).json({ message: 'Failed to fetch schedules.', error: error.message });
    }
});

// GET available (is_booked = false) schedules for a doctor (public)
router.get('/:doctorId/available-schedules', async (req, res) => {
    const { doctorId } = req.params;
    const { date } = req.query;
    console.log(`[${new Date().toISOString()}] INFO: Received request for GET /doctors/${doctorId}/available-schedules?date=${date}`);

    if (!date) {
        return res.status(400).json({ message: 'A specific date query parameter is required (YYYY-MM-DD).' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { // Basic date format validation
        return res.status(400).json({ message: 'Date format must be YYYY-MM-DD.' });
    }

    try {
        const query = `
            SELECT id, schedule_date, start_time, end_time 
            FROM doctor_schedules 
            WHERE doctor_id = ? 
            AND schedule_date = ? 
            AND is_booked = FALSE 
            AND CONCAT(schedule_date, ' ', start_time) > NOW() 
            ORDER BY start_time ASC
        `;
        const [availableSlots] = await db.query(query, [doctorId, date]);
        res.json(availableSlots);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: [DoctorRoutes-GET /:doctorId/available-schedules] Error fetching available schedules for doctor ${doctorId} on ${date}:`, error);
        res.status(500).json({ message: 'Failed to fetch available schedules.', error: error.message });
    }
});

// UPDATE a specific schedule slot (e.g., to mark as booked) - YÊU CẦU XÁC THỰC
// This API might be called by Booking Service or an Admin/Doctor.
router.put('/:doctorId/schedules/:scheduleId', authMiddleware, async (req, res) => {
    const { doctorId, scheduleId } = req.params;
    const { is_booked } = req.body;
    console.log(`[${new Date().toISOString()}] INFO: Received request for PUT /doctors/${doctorId}/schedules/${scheduleId} by user ${req.user.userId} (role: ${req.user.role})`);

    // TODO: Implement more granular authorization
    if (req.user.role !== 'admin' /* && !isBookingService(req.user) && !isDoctorOwner(req.user, doctorId) */) {
        // console.warn(`[DoctorRoutes-PUT /:doctorId/schedules/:scheduleId] Authorization check needed.`);
        // For now, allow if admin, but this needs refinement.
        // If not admin, and not a service call, it should probably be forbidden or more specific.
    }

    if (is_booked === undefined) {
        return res.status(400).json({ message: 'is_booked field is required in the request body.' });
    }
    if (typeof is_booked !== 'boolean') {
        return res.status(400).json({ message: 'is_booked must be a boolean (true or false).' });
    }

    try {
        const [result] = await db.query(
            'UPDATE doctor_schedules SET is_booked = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND doctor_id = ?',
            [is_booked, scheduleId, doctorId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `Schedule slot with ID ${scheduleId} for doctor ID ${doctorId} not found, or no change in is_booked status.` });
        }
        res.json({ message: `Schedule slot ID ${scheduleId} updated successfully. is_booked set to ${is_booked}.` });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: [DoctorRoutes-PUT /:doctorId/schedules/:scheduleId] Error updating schedule:`, error);
        res.status(500).json({ message: 'Failed to update schedule slot.', error: error.message });
    }
});

// DELETE a specific schedule slot - YÊU CẦU XÁC THỰC
router.delete('/:doctorId/schedules/:scheduleId', authMiddleware, async (req, res) => {
    const { doctorId, scheduleId } = req.params;
    console.log(`[${new Date().toISOString()}] INFO: Received request for DELETE /doctors/${doctorId}/schedules/${scheduleId} by user ${req.user.userId} (role: ${req.user.role})`);

    // TODO: Implement proper authorization (e.g., admin or the doctor themselves if slot is not booked)
    if (req.user.role !== 'admin') {
        // console.warn(`[DoctorRoutes-DELETE /:doctorId/schedules/:scheduleId] Authorization check needed.`);
    }

    try {
        const [schedules] = await db.query('SELECT is_booked FROM doctor_schedules WHERE id = ? AND doctor_id = ?', [scheduleId, doctorId]);
        if (schedules.length === 0) {
            return res.status(404).json({ message: `Schedule slot ID ${scheduleId} for doctor ID ${doctorId} not found.` });
        }
        // Consider business logic: can a booked slot be deleted? Or should it be cancelled via appointment?
        // if (schedules[0].is_booked) {
        //     return res.status(400).json({ message: `Cannot delete schedule slot ID ${scheduleId} because it is already booked.` });
        // }

        const [result] = await db.query('DELETE FROM doctor_schedules WHERE id = ? AND doctor_id = ?', [scheduleId, doctorId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `Schedule slot ID ${scheduleId} for doctor ID ${doctorId} not found for deletion (should have been caught earlier).` });
        }
        res.json({ message: `Schedule slot ID ${scheduleId} deleted successfully.` });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: [DoctorRoutes-DELETE /:doctorId/schedules/:scheduleId] Error deleting schedule:`, error);
        res.status(500).json({ message: 'Failed to delete schedule slot.', error: error.message });
    }
});

module.exports = router;
