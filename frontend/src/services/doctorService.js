// frontend/src/services/doctorService.js
import axios from 'axios';

const API_URL = 'http://localhost:3002'; // Base URL của Doctor Service

// Hàm lấy danh sách tất cả bác sĩ
export const getAllDoctors = async () => {
    try {
        const response = await axios.get(`${API_URL}/doctors`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all doctors:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch doctors');
    }
};

// Hàm lấy thông tin chi tiết một bác sĩ
export const getDoctorById = async (doctorId) => {
    try {
        const response = await axios.get(`${API_URL}/doctors/${doctorId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching doctor with ID ${doctorId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to fetch doctor ${doctorId}`);
    }
};

// Hàm lấy các lịch làm việc còn trống của bác sĩ theo ngày
export const getAvailableSchedulesByDoctorAndDate = async (doctorId, date) => {
    // date phải có định dạng YYYY-MM-DD
    try {
        const response = await axios.get(`${API_URL}/doctors/${doctorId}/available-schedules?date=${date}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching available schedules for doctor ${doctorId} on ${date}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch available schedules');
    }
};

// --- Các hàm cho Clinics (ví dụ) ---
export const getAllClinics = async () => {
    try {
        const response = await axios.get(`${API_URL}/clinics`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all clinics:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch clinics');
    }
};

// --- Các hàm cho Specialities (ví dụ) ---
export const getAllSpecialities = async () => {
    try {
        const response = await axios.get(`${API_URL}/specialities`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all specialities:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch specialities');
    }
};


// === CÁC HÀM CẦN TOKEN (VÍ DỤ CHO ADMIN) ===
// Bạn cần lấy token từ AuthContext hoặc localStorage
const getToken = () => localStorage.getItem('token');


// Tạo bác sĩ mới (cần token admin)
export const createDoctor = async (doctorData) => {
    const token = getToken();
    if (!token) throw new Error('No token found. Please login.');
    try {
        const response = await axios.post(`${API_URL}/doctors`, doctorData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating doctor:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to create doctor');
    }
};

// (Tương tự cho createClinic, createSpeciality, updateDoctor, deleteDoctor, etc.)
