// // frontend/src/services/patientService.js
// import axios from 'axios';

// const API_URL = 'http://localhost:3004'; // Base URL của Patient Service

// const getToken = () => localStorage.getItem('token');

// // Hàm tiện ích để tạo đối tượng lỗi chuẩn
// const createErrorObject = (message, details = {}) => {
//     const error = new Error(message);
//     // Gắn thêm các thuộc tính tùy chỉnh vào đối tượng lỗi
//     for (const key in details) {
//         if (Object.hasOwnProperty.call(details, key)) {
//             error[key] = details[key];
//         }
//     }
//     return error;
// };


// // Hàm lấy thông tin hồ sơ bệnh nhân của người dùng đang đăng nhập
// export const getMyPatientProfile = async () => {
//     const token = getToken();
//     if (!token) {
//         console.warn('No token found. User might need to login.');
//         // Promise.reject nên trả về một Error object
//         return Promise.reject(createErrorObject('Vui lòng đăng nhập để xem hồ sơ.', { requiresLogin: true }));
//     }

//     try {
//         const response = await axios.get(`${API_URL}/patients/me`, {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching my patient profile:', error.response?.data || error.message);
//         if (error.response && error.response.status === 404) {
//             throw createErrorObject(
//                 error.response.data?.message || 'Không tìm thấy hồ sơ bệnh nhân cho tài khoản này. Bạn có muốn tạo hồ sơ mới?',
//                 { status: 404, isCustomError: true, originalErrorData: error.response.data, requiresProfileCreation: true }
//             );
//         }
//         // Đảm bảo error.response.data cũng được bọc trong Error nếu nó không phải là Error instance
//         if (error.response?.data && !(error.response.data instanceof Error)) {
//             throw createErrorObject(error.response.data.message || 'Lỗi từ server khi tải hồ sơ.', { originalErrorData: error.response.data });
//         }
//         throw error.response?.data || createErrorObject('Không thể tải hồ sơ bệnh nhân.');
//     }
// };

// // Hàm tạo hồ sơ bệnh nhân mới cho người dùng đang đăng nhập
// export const createMyPatientProfile = async (profileData) => {
//     const token = getToken();
//     if (!token) {
//         return Promise.reject(createErrorObject('Vui lòng đăng nhập để tạo hồ sơ.', { requiresLogin: true }));
//     }
//     try {
//         const response = await axios.post(`${API_URL}/patients`, profileData, {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error creating patient profile:', error.response?.data || error.message);
//         if (error.response?.data && !(error.response.data instanceof Error)) {
//             throw createErrorObject(error.response.data.message || 'Lỗi từ server khi tạo hồ sơ.', { originalErrorData: error.response.data });
//         }
//         throw error.response?.data || createErrorObject('Không thể tạo hồ sơ bệnh nhân.');
//     }
// };


// // Hàm cập nhật hồ sơ bệnh nhân (cần patientId)
// export const updatePatientProfile = async (patientId, profileData) => {
//     const token = getToken();
//     if (!token) {
//         return Promise.reject(createErrorObject('Vui lòng đăng nhập để cập nhật hồ sơ.', { requiresLogin: true }));
//     }
//     try {
//         const response = await axios.put(`${API_URL}/patients/${patientId}`, profileData, {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error(`Error updating patient profile ${patientId}:`, error.response?.data || error.message);
//         if (error.response?.data && !(error.response.data instanceof Error)) {
//             throw createErrorObject(error.response.data.message || 'Lỗi từ server khi cập nhật hồ sơ.', { originalErrorData: error.response.data });
//         }
//         throw error.response?.data || createErrorObject('Không thể cập nhật hồ sơ bệnh nhân.');
//     }
// };

// // --- Các hàm cho Clinics (ví dụ) ---
// export const getAllClinics = async () => {
//     try {
//         const response = await axios.get(`${API_URL}/clinics`);
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching all clinics:', error.response?.data || error.message);
//         if (error.response?.data && !(error.response.data instanceof Error)) {
//             throw createErrorObject(error.response.data.message || 'Lỗi từ server khi tải phòng khám.', { originalErrorData: error.response.data });
//         }
//         throw error.response?.data || createErrorObject('Failed to fetch clinics');
//     }
// };

// // --- Các hàm cho Specialities (ví dụ) ---
// export const getAllSpecialities = async () => {
//     try {
//         const response = await axios.get(`${API_URL}/specialities`);
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching all specialities:', error.response?.data || error.message);
//         if (error.response?.data && !(error.response.data instanceof Error)) {
//             throw createErrorObject(error.response.data.message || 'Lỗi từ server khi tải chuyên khoa.', { originalErrorData: error.response.data });
//         }
//         throw error.response?.data || createErrorObject('Failed to fetch specialities');
//     }
// };


// // === CÁC HÀM CẦN TOKEN (VÍ DỤ CHO ADMIN) ===

// // Tạo bác sĩ mới (cần token admin)
// export const createDoctor = async (doctorData) => {
//     const token = getToken();
//     if (!token) throw createErrorObject('No token found. Please login.');
//     try {
//         const response = await axios.post(`${API_URL}/doctors`, doctorData, {
//             headers: { Authorization: `Bearer ${token}` }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error creating doctor:', error.response?.data || error.message);
//         if (error.response?.data && !(error.response.data instanceof Error)) {
//             throw createErrorObject(error.response.data.message || 'Lỗi từ server khi tạo bác sĩ.', { originalErrorData: error.response.data });
//         }
//         throw error.response?.data || createErrorObject('Failed to create doctor');
//     }
// };


import axios from 'axios';

const API_URL = 'http://localhost:3004'; // Base URL của Patient Service

export const getToken = () => {
    const token = localStorage.getItem('token');
    console.log('Token lấy được:', token);
    return token;
};

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

// // Hàm lấy danh sách cuộc hẹn của bệnh nhân đang đăng nhập
// export const getMyAppointments = async () => {
//     const token = getToken();
//     if (!token) {
//         return Promise.reject(createErrorObject('Vui lòng đăng nhập để xem cuộc hẹn.', { requiresLogin: true }));
//     }
//     try {
//         const response = await axios.get(`${API_URL}/appointments/me`, {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching my appointments:', error.response?.data || error.message);
//         if (error.response && error.response.status === 404) {
//             throw createErrorObject(
//                 error.response.data?.message || 'Không tìm thấy cuộc hẹn nào cho bệnh nhân này.',
//                 { status: 404, isCustomError: true, originalErrorData: error.response.data, noAppointments: true }
//             );
//         }
//         if (error.response?.data && !(error.response.data instanceof Error)) {
//             throw createErrorObject(error.response.data.message || 'Lỗi từ server khi tải danh sách cuộc hẹn.', { originalErrorData: error.response.data });
//         }
//         throw error.response?.data || createErrorObject('Không thể tải danh sách cuộc hẹn.');
//     }
// };

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

export const getMyAppointments = async () => {
    const token = getToken();
    if (!token) {
        console.warn('Không tìm thấy token.');
        return Promise.reject(createErrorObject('Vui lòng đăng nhập để xem lịch hẹn.', { requiresLogin: true }));
    }
    try {
        console.log('Đang tải lịch hẹn với token:', token);
        const response = await axios.get(`${API_URL}/patients/appointments/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('getMyAppointments response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi tải lịch hẹn:', error.response?.data, error.response?.status, error.response?.data?.sqlMessage);
        throw error.response?.data || createErrorObject('Không thể tải lịch hẹn.');
    }
};

export const updateAppointment = async (appointmentId, data) => {
    const token = getToken();
    if (!token) throw createErrorObject('Vui lòng đăng nhập.', { requiresLogin: true });
    try {
        const response = await axios.put(`${API_URL}/appointments/${appointmentId}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || createErrorObject('Không thể cập nhật lịch hẹn.');
    }
};


export const deleteAppointment = async (appointmentId) => {
    const token = getToken();
    if (!token) throw createErrorObject('Vui lòng đăng nhập.', { requiresLogin: true });
    try {
        const response = await axios.delete(`${API_URL}/appointments/${appointmentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || createErrorObject('Không thể xóa lịch hẹn.');
    }
};

export const getDoctors = async () => {
    const token = getToken();
    if (!token) throw createErrorObject('Vui lòng đăng nhập.', { requiresLogin: true });
    try {
        const response = await axios.get(`${API_URL}/doctors`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || createErrorObject('Không thể tải danh sách bác sĩ.');
    }
};

export const getAvailableSchedules = async (doctorId) => {
    const token = getToken();
    if (!token) throw createErrorObject('Vui lòng đăng nhập.', { requiresLogin: true });
    try {
        const response = await axios.get(`${API_URL}/doctors/${doctorId}/schedules?available=true`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || createErrorObject('Không thể tải lịch trống.');
    }
};