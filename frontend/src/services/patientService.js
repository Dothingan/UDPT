// frontend/src/services/patientService.js
import axios from 'axios';

const API_URL = 'http://localhost:3004'; // Base URL của Patient Service

const getToken = () => localStorage.getItem('token');

// Hàm tiện ích để tạo đối tượng lỗi chuẩn
const createErrorObject = (message, details = {}) => {
    const error = new Error(message);
    // Gắn thêm các thuộc tính tùy chỉnh vào đối tượng lỗi
    for (const key in details) {
        if (Object.hasOwnProperty.call(details, key)) {
            error[key] = details[key];
        }
    }
    return error;
};


// Hàm lấy thông tin hồ sơ bệnh nhân của người dùng đang đăng nhập
export const getMyPatientProfile = async () => {
    const token = getToken();
    if (!token) {
        console.warn('No token found. User might need to login.');
        // Promise.reject nên trả về một Error object
        return Promise.reject(createErrorObject('Vui lòng đăng nhập để xem hồ sơ.', { requiresLogin: true }));
    }

    try {
        const response = await axios.get(`${API_URL}/patients/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching my patient profile:', error.response?.data || error.message);
        if (error.response && error.response.status === 404) {
            throw createErrorObject(
                error.response.data?.message || 'Không tìm thấy hồ sơ bệnh nhân cho tài khoản này. Bạn có muốn tạo hồ sơ mới?',
                { status: 404, isCustomError: true, originalErrorData: error.response.data, requiresProfileCreation: true }
            );
        }
        // Đảm bảo error.response.data cũng được bọc trong Error nếu nó không phải là Error instance
        if (error.response?.data && !(error.response.data instanceof Error)) {
            throw createErrorObject(error.response.data.message || 'Lỗi từ server khi tải hồ sơ.', { originalErrorData: error.response.data });
        }
        throw error.response?.data || createErrorObject('Không thể tải hồ sơ bệnh nhân.');
    }
};

// Hàm tạo hồ sơ bệnh nhân mới cho người dùng đang đăng nhập
export const createMyPatientProfile = async (profileData) => {
    const token = getToken();
    if (!token) {
        return Promise.reject(createErrorObject('Vui lòng đăng nhập để tạo hồ sơ.', { requiresLogin: true }));
    }
    try {
        const response = await axios.post(`${API_URL}/patients`, profileData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating patient profile:', error.response?.data || error.message);
        if (error.response?.data && !(error.response.data instanceof Error)) {
            throw createErrorObject(error.response.data.message || 'Lỗi từ server khi tạo hồ sơ.', { originalErrorData: error.response.data });
        }
        throw error.response?.data || createErrorObject('Không thể tạo hồ sơ bệnh nhân.');
    }
};


// Hàm cập nhật hồ sơ bệnh nhân (cần patientId)
export const updatePatientProfile = async (patientId, profileData) => {
    const token = getToken();
    if (!token) {
        return Promise.reject(createErrorObject('Vui lòng đăng nhập để cập nhật hồ sơ.', { requiresLogin: true }));
    }
    try {
        const response = await axios.put(`${API_URL}/patients/${patientId}`, profileData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating patient profile ${patientId}:`, error.response?.data || error.message);
        if (error.response?.data && !(error.response.data instanceof Error)) {
            throw createErrorObject(error.response.data.message || 'Lỗi từ server khi cập nhật hồ sơ.', { originalErrorData: error.response.data });
        }
        throw error.response?.data || createErrorObject('Không thể cập nhật hồ sơ bệnh nhân.');
    }
};

// --- Các hàm cho Clinics (ví dụ) ---
export const getAllClinics = async () => {
    try {
        const response = await axios.get(`${API_URL}/clinics`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all clinics:', error.response?.data || error.message);
        if (error.response?.data && !(error.response.data instanceof Error)) {
            throw createErrorObject(error.response.data.message || 'Lỗi từ server khi tải phòng khám.', { originalErrorData: error.response.data });
        }
        throw error.response?.data || createErrorObject('Failed to fetch clinics');
    }
};

// --- Các hàm cho Specialities (ví dụ) ---
export const getAllSpecialities = async () => {
    try {
        const response = await axios.get(`${API_URL}/specialities`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all specialities:', error.response?.data || error.message);
        if (error.response?.data && !(error.response.data instanceof Error)) {
            throw createErrorObject(error.response.data.message || 'Lỗi từ server khi tải chuyên khoa.', { originalErrorData: error.response.data });
        }
        throw error.response?.data || createErrorObject('Failed to fetch specialities');
    }
};


// === CÁC HÀM CẦN TOKEN (VÍ DỤ CHO ADMIN) ===

// Tạo bác sĩ mới (cần token admin)
export const createDoctor = async (doctorData) => {
    const token = getToken();
    if (!token) throw createErrorObject('No token found. Please login.');
    try {
        const response = await axios.post(`${API_URL}/doctors`, doctorData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating doctor:', error.response?.data || error.message);
        if (error.response?.data && !(error.response.data instanceof Error)) {
            throw createErrorObject(error.response.data.message || 'Lỗi từ server khi tạo bác sĩ.', { originalErrorData: error.response.data });
        }
        throw error.response?.data || createErrorObject('Failed to create doctor');
    }
};
