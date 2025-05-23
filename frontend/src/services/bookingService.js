// frontend/src/services/bookingService.js
import axios from 'axios';

const API_URL = 'http://localhost:3003'; // Base URL của Booking Service

const getToken = () => localStorage.getItem('token');

// Hàm tiện ích để tạo đối tượng lỗi chuẩn (tương tự như trong patientService.js)
const createErrorObject = (message, details = {}) => {
    const error = new Error(message);
    for (const key in details) {
        if (Object.hasOwnProperty.call(details, key)) {
            error[key] = details[key];
        }
    }
    return error;
};

/**
 * Tạo một lịch hẹn mới.
 * @param {object} appointmentData - Dữ liệu lịch hẹn.
 * @param {number} appointmentData.doctor_id - ID của bác sĩ.
 * @param {number} appointmentData.doctor_schedule_id - ID của khung giờ làm việc đã chọn.
 * @param {string} [appointmentData.reason_for_visit] - Lý do khám bệnh (tùy chọn).
 * @returns {Promise<object>} Dữ liệu lịch hẹn đã tạo.
 */
export const createAppointment = async (appointmentData) => {
    const token = getToken();
    if (!token) {
        console.warn('No token found. User might need to login to book an appointment.');
        return Promise.reject(createErrorObject('Vui lòng đăng nhập để đặt lịch.', { requiresLogin: true }));
    }

    if (!appointmentData.doctor_id || !appointmentData.doctor_schedule_id) {
        return Promise.reject(createErrorObject('Thông tin bác sĩ hoặc khung giờ không hợp lệ.'));
    }

    try {
        const response = await axios.post(`${API_URL}/appointments`, appointmentData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating appointment:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || 'Không thể tạo lịch hẹn. Vui lòng thử lại.';
        // Đảm bảo ném ra một Error object
        throw createErrorObject(errorMessage, { originalErrorData: error.response?.data || error });
    }
};

// (Các hàm khác như getMyAppointments, cancelAppointment, etc. sẽ được thêm sau)
