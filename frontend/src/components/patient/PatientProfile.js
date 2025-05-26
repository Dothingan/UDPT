// // frontend/src/components/patient/PatientProfile.js
// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { getMyPatientProfile, updatePatientProfile } from '../../services/patientService';
// import styles from './PatientProfile.module.css';




// function PatientProfile() {
//     const { user, isAuthenticated, token } = useAuth();
//     const [patientProfile, setPatientProfile] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const navigate = useNavigate();

//     // State cho chế độ chỉnh sửa và dữ liệu form
//     const [isEditing, setIsEditing] = useState(false);
//     const [formData, setFormData] = useState({
//         full_name: '',
//         date_of_birth: '',
//         gender: '',
//         phone_number: '',
//         address: '',
//         blood_type: '',
//         allergies: '',
//         chronic_conditions: ''
//     });
//     const [updateMessage, setUpdateMessage] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);


//     useEffect(() => {
//         if (!isAuthenticated || !token) {
//             navigate('/login', { state: { from: '/my-profile' } });
//             return;
//         }

//         const fetchProfile = async () => {
//             try {
//                 setLoading(true);
//                 setError('');
//                 setUpdateMessage('');
//                 const data = await getMyPatientProfile();
//                 setPatientProfile(data);
//                 // Nạp dữ liệu vào formData khi lấy được profile
//                 if (data) {
//                     setFormData({
//                         full_name: data.full_name || '',
//                         date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : '', // Định dạng YYYY-MM-DD cho input type="date"
//                         gender: data.gender || '',
//                         phone_number: data.phone_number || '',
//                         address: data.address || '',
//                         blood_type: data.blood_type || '',
//                         allergies: data.allergies || '',
//                         chronic_conditions: data.chronic_conditions || ''
//                     });
//                 }
//             } catch (err) {
//                 if (err.status === 404) {
//                     setError('Bạn chưa có hồ sơ bệnh nhân.');
//                 } else if (err.requiresLogin) {
//                     navigate('/login', { state: { from: '/my-profile' } });
//                 } else {
//                     setError(err.message || 'Không thể tải hồ sơ bệnh nhân.');
//                 }
//                 console.error("Error in fetchProfile:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchProfile();
//     }, [isAuthenticated, token, navigate]);



//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleEditToggle = () => {
//         if (!isEditing && patientProfile) {
//             // Khi bắt đầu chỉnh sửa, nạp lại dữ liệu mới nhất từ patientProfile vào form
//             setFormData({
//                 full_name: patientProfile.full_name || '',
//                 date_of_birth: patientProfile.date_of_birth ? patientProfile.date_of_birth.split('T')[0] : '',
//                 gender: patientProfile.gender || '',
//                 phone_number: patientProfile.phone_number || '',
//                 address: patientProfile.address || '',
//                 blood_type: patientProfile.blood_type || '',
//                 allergies: patientProfile.allergies || '',
//                 chronic_conditions: patientProfile.chronic_conditions || ''
//             });
//         }
//         setIsEditing(!isEditing);
//         setUpdateMessage(''); // Xóa thông báo cũ khi chuyển chế độ
//         setError(''); // Xóa lỗi cũ
//     };

//     const handleSubmitUpdate = async (e) => {
//         e.preventDefault();
//         if (!patientProfile || !patientProfile.id) {
//             setUpdateMessage('Không tìm thấy ID bệnh nhân để cập nhật.');
//             return;
//         }
//         setIsSubmitting(true);
//         setUpdateMessage('');
//         try {
//             // Chỉ gửi các trường có giá trị, hoặc gửi tất cả tùy theo API backend của bạn
//             // Backend API (PUT /patients/:patientId) đã được thiết kế để chỉ cập nhật các trường được cung cấp
//             const updatedData = await updatePatientProfile(patientProfile.id, formData);
//             setPatientProfile(prev => ({ ...prev, ...formData })); // Cập nhật profile hiển thị ngay
//             setUpdateMessage(updatedData.message || 'Cập nhật hồ sơ thành công!');
//             setIsEditing(false); // Thoát chế độ chỉnh sửa
//         } catch (err) {
//             setUpdateMessage(err.message || 'Cập nhật hồ sơ thất bại.');
//             console.error("Error updating profile:", err);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const formatDate = (dateString) => {
//         if (!dateString) return 'N/A';
//         // Kiểm tra xem dateString có phải là định dạng YYYY-MM-DD không
//         if (dateString.includes('T')) { // Nếu là ISO string từ server
//             const date = new Date(dateString);
//             return date.toLocaleDateString('vi-VN');
//         }
//         // Nếu đã là YYYY-MM-DD (từ input type="date")
//         const parts = dateString.split('-');
//         if (parts.length === 3) {
//             return `${parts[2]}/${parts[1]}/${parts[0]}`;
//         }
//         return dateString; // Trả về nguyên bản nếu không khớp
//     };


//     if (loading) {
//         return <div className={styles.loading}>Đang tải hồ sơ của bạn...</div>;
//     }

//     if (error && !patientProfile) {
//         return (
//             <div className={styles.container}>
//                 <p className={styles.error}>{error}</p>
//                 {/* Nút tạo hồ sơ có thể được đặt ở một trang riêng biệt */}
//                 {/* <button onClick={() => navigate('/create-patient-profile')} className={styles.actionButton}>
//                     Tạo Hồ Sơ Mới
//                 </button> */}
//             </div>
//         );
//     }

//     if (!patientProfile && !isEditing) { // Nếu không có profile và không đang edit (ví dụ sau khi fetch lỗi nhưng ko set error)
//         return (
//             <div className={styles.container}>
//                 <p className={styles.noProfile}>Không tìm thấy thông tin hồ sơ bệnh nhân hoặc bạn chưa tạo hồ sơ.</p>
//                 {/* <button onClick={() => navigate('/create-patient-profile')} className={styles.actionButton}>
//                     Tạo Hồ Sơ Mới
//                 </button> */}
//             </div>
//         );
//     }

//     return (
//         <div className={styles.container}>
//             <h2 className={styles.title}>Hồ Sơ Bệnh Nhân</h2>

//             {updateMessage && (
//                 <p className={`${styles.message} ${updateMessage.includes('thất bại') ? styles.errorMessage : styles.successMessage}`}>
//                     {updateMessage}
//                 </p>
//             )}

//             {!isEditing ? (
//                 // Chế độ xem thông tin
//                 <>
//                     <div className={styles.profileDetails}>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Họ và tên:</span>
//                             <span className={styles.value}>{patientProfile?.full_name}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Email (tài khoản):</span>
//                             <span className={styles.value}>{user?.email}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Ngày sinh:</span>
//                             <span className={styles.value}>{formatDate(patientProfile?.date_of_birth)}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Giới tính:</span>
//                             <span className={styles.value}>{patientProfile?.gender || 'N/A'}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Số điện thoại:</span>
//                             <span className={styles.value}>{patientProfile?.phone_number || 'N/A'}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Địa chỉ:</span>
//                             <span className={styles.value}>{patientProfile?.address || 'N/A'}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Nhóm máu:</span>
//                             <span className={styles.value}>{patientProfile?.blood_type || 'N/A'}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Dị ứng:</span>
//                             <span className={styles.value}>{patientProfile?.allergies || 'Không có'}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Bệnh mãn tính:</span>
//                             <span className={styles.value}>{patientProfile?.chronic_conditions || 'Không có'}</span>
//                         </div>
//                     </div>
//                     <div className={styles.actions}>
//                         <button onClick={handleEditToggle} className={styles.actionButton}>
//                             Chỉnh Sửa Hồ Sơ
//                         </button>
//                         <Link to="/my-medical-history" className={styles.actionLink}>Xem Tiền Sử Bệnh</Link>
//                     </div>
//                 </>
//             ) : (
//                 // Chế độ chỉnh sửa thông tin
//                 <form onSubmit={handleSubmitUpdate} className={styles.editForm}>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="full_name">Họ và tên:</label>
//                         <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} required className={styles.inputField} />
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="date_of_birth">Ngày sinh:</label>
//                         <input type="date" id="date_of_birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} className={styles.inputField} />
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="gender">Giới tính:</label>
//                         <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className={styles.inputField}>
//                             <option value="">Chọn giới tính</option>
//                             <option value="Male">Nam</option>
//                             <option value="Female">Nữ</option>
//                             <option value="Other">Khác</option>
//                         </select>
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="phone_number">Số điện thoại:</label>
//                         <input type="tel" id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className={styles.inputField} />
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="address">Địa chỉ:</label>
//                         <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} className={styles.textareaField}></textarea>
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="blood_type">Nhóm máu:</label>
//                         <input type="text" id="blood_type" name="blood_type" value={formData.blood_type} onChange={handleInputChange} className={styles.inputField} />
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="allergies">Dị ứng:</label>
//                         <textarea id="allergies" name="allergies" value={formData.allergies} onChange={handleInputChange} className={styles.textareaField}></textarea>
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="chronic_conditions">Bệnh mãn tính:</label>
//                         <textarea id="chronic_conditions" name="chronic_conditions" value={formData.chronic_conditions} onChange={handleInputChange} className={styles.textareaField}></textarea>
//                     </div>
//                     <div className={styles.formActions}>
//                         <button type="submit" disabled={isSubmitting} className={styles.saveButton}>
//                             {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
//                         </button>
//                         <button type="button" onClick={handleEditToggle} disabled={isSubmitting} className={styles.cancelButton}>
//                             Hủy
//                         </button>
//                     </div>
//                 </form>
//             )}
//         </div>
//     );
// }

// export default PatientProfile;


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { getMyPatientProfile, updatePatientProfile, createMyPatientProfile, getMyAppointments } from '../../services/patientService';
// import styles from './PatientProfile.module.css';

// function PatientProfile() {
//     const { user, isAuthenticated, token } = useAuth();
//     const [patientProfile, setPatientProfile] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [isEditing, setIsEditing] = useState(false);
//     const [formData, setFormData] = useState({
//         full_name: '',
//         date_of_birth: '',
//         gender: '',
//         phone_number: '',
//         address: '',
//         blood_type: '',
//         allergies: '',
//         chronic_conditions: ''
//     });
//     const [message, setMessage] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [appointments, setAppointments] = useState([]);
//     const [appointmentsLoading, setAppointmentsLoading] = useState(false);
//     const [appointmentsError, setAppointmentsError] = useState('');
//     const navigate = useNavigate();

//     // Fetch appointments function
//     const fetchAppointments = async () => {
//         try {
//             setAppointmentsLoading(true);
//             setAppointmentsError('');
//             const data = await getMyAppointments();
//             setAppointments(data);
//         } catch (err) {
//             setAppointmentsError(err.message || 'Không thể tải lịch hẹn.');
//         } finally {
//             setAppointmentsLoading(false);
//         }
//     };

//     // Fetch profile and appointments on mount
//     useEffect(() => {
//         if (!isAuthenticated || !token) {
//             navigate('/login', { state: { from: '/my-profile' } });
//             return;
//         }

//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//                 setError('');
//                 setMessage('');
                
//                 const profileData = await getMyPatientProfile();
//                 setPatientProfile(profileData);
                
//                 if (profileData) {
//                     setFormData({
//                         full_name: profileData.full_name || '',
//                         date_of_birth: profileData.date_of_birth ? profileData.date_of_birth.split('T')[0] : '',
//                         gender: profileData.gender || '',
//                         phone_number: profileData.phone_number || '',
//                         address: profileData.address || '',
//                         blood_type: profileData.blood_type || '',
//                         allergies: profileData.allergies || '',
//                         chronic_conditions: profileData.chronic_conditions || ''
//                     });
//                     await fetchAppointments();
//                 }
//             } catch (err) {
//                 if (err.status === 404) {
//                     setError('Bạn chưa có hồ sơ bệnh nhân. Vui lòng tạo hồ sơ.');
//                 } else {
//                     setError(err.message || 'Không thể tải dữ liệu.');
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [isAuthenticated, token, navigate]);

//     // Handle form input changes
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     // Handle edit button click
//     const handleEditClick = () => {
//         if (patientProfile) {
//             setFormData({
//                 full_name: patientProfile.full_name || '',
//                 date_of_birth: patientProfile.date_of_birth ? patientProfile.date_of_birth.split('T')[0] : '',
//                 gender: patientProfile.gender || '',
//                 phone_number: patientProfile.phone_number || '',
//                 address: patientProfile.address || '',
//                 blood_type: patientProfile.blood_type || '',
//                 allergies: patientProfile.allergies || '',
//                 chronic_conditions: patientProfile.chronic_conditions || ''
//             });
//         }
//         setIsEditing(true);
//         setMessage('');
//         setError('');
//     };

//     // Handle form submission (create or update)
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsSubmitting(true);
//         setMessage('');
//         setError('');

//         try {
//             if (patientProfile) {
//                 // Update existing profile
//                 await updatePatientProfile(patientProfile.id, formData);
//                 setPatientProfile({ ...patientProfile, ...formData });
//                 setMessage('Cập nhật hồ sơ thành công!');
//             } else {
//                 // Create new profile
//                 const result = await createMyPatientProfile(formData);
//                 setPatientProfile({ id: result.id, ...formData });
//                 setMessage('Tạo hồ sơ thành công!');
//                 await fetchAppointments(); // Fetch appointments after creating profile
//             }
//             setIsEditing(false);
//             setFormData({
//                 full_name: '',
//                 date_of_birth: '',
//                 gender: '',
//                 phone_number: '',
//                 address: '',
//                 blood_type: '',
//                 allergies: '',
//                 chronic_conditions: ''
//             });
//         } catch (err) {
//             setMessage(err.message || 'Lỗi khi lưu thông tin.');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // Format date for display
//     const formatDate = (dateString) => {
//         if (!dateString) return 'N/A';
//         if (dateString.includes('T')) {
//             const date = new Date(dateString);
//             return date.toLocaleDateString('vi-VN');
//         }
//         const parts = dateString.split('-');
//         if (parts.length === 3) {
//             return `${parts[2]}/${parts[1]}/${parts[0]}`;
//         }
//         return dateString;
//     };

//     if (loading) {
//         return <div className={styles.loading}>Đang tải dữ liệu...</div>;
//     }

//     return (
//         <div className={styles.container}>
//             <h2 className={styles.title}>Hồ Sơ Bệnh Nhân</h2>

//             {message && (
//                 <p className={`${styles.message} ${message.includes('Lỗi') ? styles.errorMessage : styles.successMessage}`}>
//                     {message}
//                 </p>
//             )}

//             {(!patientProfile || isEditing) ? (
//                 // Form for creating or editing profile
//                 <form onSubmit={handleSubmit} className={styles.editForm}>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="full_name">Họ và tên:</label>
//                         <input
//                             type="text"
//                             id="full_name"
//                             name="full_name"
//                             value={formData.full_name}
//                             onChange={handleInputChange}
//                             required
//                             className={styles.inputField}
//                         />
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="date_of_birth">Ngày sinh:</label>
//                         <input
//                             type="date"
//                             id="date_of_birth"
//                             name="date_of_birth"
//                             value={formData.date_of_birth}
//                             onChange={handleInputChange}
//                             className={styles.inputField}
//                         />
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="gender">Giới tính:</label>
//                         <select
//                             id="gender"
//                             name="gender"
//                             value={formData.gender}
//                             onChange={handleInputChange}
//                             className={styles.inputField}
//                         >
//                             <option value="">Chọn giới tính</option>
//                             <option value="Male">Nam</option>
//                             <option value="Female">Nữ</option>
//                             <option value="Other">Khác</option>
//                         </select>
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="phone_number">Số điện thoại:</label>
//                         <input
//                             type="tel"
//                             id="phone_number"
//                             name="phone_number"
//                             value={formData.phone_number}
//                             onChange={handleInputChange}
//                             className={styles.inputField}
//                         />
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="address">Địa chỉ:</label>
//                         <textarea
//                             id="address"
//                             name="address"
//                             value={formData.address}
//                             onChange={handleInputChange}
//                             className={styles.textareaField}
//                         />
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="blood_type">Nhóm máu:</label>
//                         <input
//                             type="text"
//                             id="blood_type"
//                             name="blood_type"
//                             value={formData.blood_type}
//                             onChange={handleInputChange}
//                             className={styles.inputField}
//                         />
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="allergies">Dị ứng:</label>
//                         <textarea
//                             id="allergies"
//                             name="allergies"
//                             value={formData.allergies}
//                             onChange={handleInputChange}
//                             className={styles.textareaField}
//                         />
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="chronic_conditions">Bệnh mãn tính:</label>
//                         <textarea
//                             id="chronic_conditions"
//                             name="chronic_conditions"
//                             value={formData.chronic_conditions}
//                             onChange={handleInputChange}
//                             className={styles.textareaField}
//                         />
//                     </div>
//                     <div className={styles.formActions}>
//                         <button
//                             type="submit"
//                             disabled={isSubmitting}
//                             className={styles.saveButton}
//                         >
//                             {isSubmitting ? 'Đang xử lý...' : patientProfile ? 'Lưu thay đổi' : 'Tạo Hồ Sơ'}
//                         </button>
//                         {patientProfile && (
//                             <button
//                                 type="button"
//                                 onClick={() => setIsEditing(false)}
//                                 className={styles.cancelButton}
//                             >
//                                 Hủy
//                             </button>
//                         )}
//                     </div>
//                 </form>
//             ) : (
//                 // View mode
//                 <>
//                     <div className={styles.profileDetails}>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Họ và tên:</span>
//                             <span className={styles.value}>{patientProfile?.full_name}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Email:</span>
//                             <span className={styles.value}>{user?.email}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Ngày sinh:</span>
//                             <span className={styles.value}>{formatDate(patientProfile?.date_of_birth)}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Giới tính:</span>
//                             <span className={styles.value}>{patientProfile?.gender || 'N/A'}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Số điện thoại:</span>
//                             <span className={styles.value}>{patientProfile?.phone_number || 'N/A'}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Địa chỉ:</span>
//                             <span className={styles.value}>{patientProfile?.address || 'N/A'}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Nhóm máu:</span>
//                             <span className={styles.value}>{patientProfile?.blood_type || 'N/A'}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Dị ứng:</span>
//                             <span className={styles.value}>{patientProfile?.allergies || 'Không có'}</span>
//                         </div>
//                         <div className={styles.detailItem}>
//                             <span className={styles.label}>Bệnh mãn tính:</span>
//                             <span className={styles.value}>{patientProfile?.chronic_conditions || 'Không có'}</span>
//                         </div>
//                     </div>
//                     <div className={styles.formActions}>
//                         <button
//                             onClick={handleEditClick}
//                             className={styles.editButton}
//                         >
//                             Chỉnh sửa hồ sơ
//                         </button>
//                     </div>
//                     <div className={styles.appointmentsSection}>
//                         <h3>Lịch Hẹn Của Tôi</h3>
//                         {appointmentsLoading ? (
//                             <p>Đang tải lịch hẹn...</p>
//                         ) : appointmentsError ? (
//                             <p className={styles.error}>{appointmentsError}</p>
//                         ) : appointments && appointments.length > 0 ? (
//                             <ul className={styles.appointmentsList}>
//                                 {appointments.map(app => (
//                                     <li key={app.id} className={styles.appointmentItem}>
//                                         <div>
//                                             <strong>Bác sĩ:</strong> {app.doctor_name || 'N/A'}
//                                         </div>
//                                         <div>
//                                             <strong>Phòng khám:</strong> {app.clinic_name || 'N/A'}
//                                         </div>
//                                         <div>
//                                             <strong>Thời gian:</strong> {app.appointment_date ? new Date(app.appointment_date).toLocaleString('vi-VN') : 'N/A'}
//                                         </div>
//                                         <div>
//                                             <strong>Trạng thái:</strong> {app.status || 'N/A'}
//                                         </div>
//                                     </li>
//                                 ))}
//                             </ul>
//                         ) : (
//                             <p>Bạn chưa có lịch hẹn nào.</p>
//                         )}
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

// export default PatientProfile;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyPatientProfile, updatePatientProfile, createMyPatientProfile, getMyAppointments, updateAppointment, deleteAppointment } from '../../services/patientService';
import styles from './PatientProfile.module.css';

function PatientProfile() {
    const { user, isAuthenticated, token } = useAuth();
    const [patientProfile, setPatientProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        date_of_birth: '',
        gender: '',
        phone_number: '',
        address: '',
        blood_type: '',
        allergies: '',
        chronic_conditions: ''
    });
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);
    const [appointmentsError, setAppointmentsError] = useState('');
    const navigate = useNavigate();

    // Fetch appointments function
    const fetchAppointments = async () => {
        try {
            setAppointmentsLoading(true);
            setAppointmentsError('');
            const data = await getMyAppointments();
            console.log('Appointments data:', data);
            setAppointments(data);
        } catch (err) {
            console.error('Fetch appointments error:', err);
            setAppointmentsError(err.sqlMessage || err.message || 'Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.');
        } finally {
            setAppointmentsLoading(false);
        }
    };

    // Fetch profile and appointments on mount
    useEffect(() => {
        if (!isAuthenticated || !token) {
            navigate('/login', { state: { from: '/my-profile' } });
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                setMessage('');
                
                const profileData = await getMyPatientProfile();
                console.log('Profile data:', profileData);
                setPatientProfile(profileData);
                
                if (profileData) {
                    setFormData({
                        full_name: profileData.full_name || '',
                        date_of_birth: profileData.date_of_birth ? profileData.date_of_birth.split('T')[0] : '',
                        gender: profileData.gender || '',
                        phone_number: profileData.phone_number || '',
                        address: profileData.address || '',
                        blood_type: profileData.blood_type || '',
                        allergies: profileData.allergies || '',
                        chronic_conditions: profileData.chronic_conditions || ''
                    });
                    await fetchAppointments();
                }
            } catch (err) {
                if (err.status === 404) {
                    setError('Bạn chưa có hồ sơ bệnh nhân. Vui lòng tạo hồ sơ.');
                } else {
                    setError(err.message || 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, token, navigate]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle edit button click
    const handleEditClick = () => {
        if (patientProfile) {
            setFormData({
                full_name: patientProfile.full_name || '',
                date_of_birth: patientProfile.date_of_birth ? patientProfile.date_of_birth.split('T')[0] : '',
                gender: patientProfile.gender || '',
                phone_number: patientProfile.phone_number || '',
                address: patientProfile.address || '',
                blood_type: patientProfile.blood_type || '',
                allergies: patientProfile.allergies || '',
                chronic_conditions: patientProfile.chronic_conditions || ''
            });
        }
        setIsEditing(true);
        setMessage('');
        setError('');
    };

    // Handle form submission (create or update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        setError('');

        try {
            if (patientProfile) {
                await updatePatientProfile(patientProfile.id, formData);
                setPatientProfile({ ...patientProfile, ...formData });
                setMessage('Cập nhật hồ sơ thành công!');
            } else {
                const result = await createMyPatientProfile(formData);
                console.log('New patientProfile:', { id: result.id, ...formData });
                setPatientProfile({ id: result.id, ...formData });
                setMessage('Tạo hồ sơ thành công!');
                await fetchAppointments();
            }
            setIsEditing(false);
            setFormData({
                full_name: '',
                date_of_birth: '',
                gender: '',
                phone_number: '',
                address: '',
                blood_type: '',
                allergies: '',
                chronic_conditions: ''
            });
        } catch (err) {
            setError(err.message || 'Lỗi khi lưu thông tin. Vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle edit appointment
    const handleEditAppointment = async (appointmentId) => {
        try {
            const reason = prompt('Nhập lý do khám mới:', '');
            const status = prompt('Nhập trạng thái mới (PENDING, CONFIRMED, CANCELLED):', 'PENDING');
            if (!reason || !status) {
                setAppointmentsError('Vui lòng nhập đầy đủ thông tin.');
                return;
            }
            if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status.toUpperCase())) {
                setAppointmentsError('Trạng thái không hợp lệ. Chọn PENDING, CONFIRMED, hoặc CANCELLED.');
                return;
            }
            const data = { reason_for_visit: reason, status: status.toUpperCase() };
            console.log('Đang sửa lịch hẹn:', { appointmentId, data });
            await updateAppointment(appointmentId, data);
            setAppointmentsError('');
            alert('Cập nhật lịch hẹn thành công.');
            fetchAppointments(); // Làm mới danh sách
        } catch (error) {
            console.error('Lỗi sửa lịch hẹn:', error);
            setAppointmentsError(error.message || 'Không thể cập nhật lịch hẹn.');
        }
    };

    const handleDeleteAppointment = async (appointmentId) => {
        if (!window.confirm('Bạn có chắc muốn xóa lịch hẹn này?')) return;
        try {
            console.log('Đang xóa lịch hẹn:', appointmentId);
            await deleteAppointment(appointmentId);
            setAppointmentsError('');
            alert('Xóa lịch hẹn thành công.');
            fetchAppointments(); // Làm mới danh sách
        } catch (error) {
            console.error('Lỗi xóa lịch hẹn:', error);
            setAppointmentsError(error.message || 'Không thể xóa lịch hẹn.');
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        if (dateString.includes('T')) {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
        }
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateString;
    };

    if (loading) {
        return <div className={styles.loading}>Đang tải dữ liệu...</div>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Hồ Sơ Bệnh Nhân</h2>

            {message && (
                <p className={`${styles.message} ${message.includes('Lỗi') ? styles.errorMessage : styles.successMessage}`}>
                    {message}
                </p>
            )}
            {error && (
                <p className={styles.errorMessage}>
                    {error}
                </p>
            )}

            {(!patientProfile || isEditing) ? (
                <form onSubmit={handleSubmit} className={styles.editForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="full_name">Họ và tên:</label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            required
                            className={styles.inputField}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="date_of_birth">Ngày sinh:</label>
                        <input
                            type="date"
                            id="date_of_birth"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            className={styles.inputField}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="gender">Giới tính:</label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className={styles.inputField}
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="Male">Nam</option>
                            <option value="Female">Nữ</option>
                            <option value="Other">Khác</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="phone_number">Số điện thoại:</label>
                        <input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            className={styles.inputField}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="address">Địa chỉ:</label>
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className={styles.textareaField}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="blood_type">Nhóm máu:</label>
                        <input
                            type="text"
                            id="blood_type"
                            name="blood_type"
                            value={formData.blood_type}
                            onChange={handleInputChange}
                            className={styles.inputField}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="allergies">Dị ứng:</label>
                        <textarea
                            id="allergies"
                            name="allergies"
                            value={formData.allergies}
                            onChange={handleInputChange}
                            className={styles.textareaField}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="chronic_conditions">Bệnh mãn tính:</label>
                        <textarea
                            id="chronic_conditions"
                            name="chronic_conditions"
                            value={formData.chronic_conditions}
                            onChange={handleInputChange}
                            className={styles.textareaField}
                        />
                    </div>
                    <div className={styles.formActions}>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={styles.saveButton}
                        >
                            {isSubmitting ? 'Đang xử lý...' : patientProfile ? 'Lưu thay đổi' : 'Tạo Hồ Sơ'}
                        </button>
                        {patientProfile && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className={styles.cancelButton}
                            >
                                Hủy
                            </button>
                        )}
                    </div>
                </form>
            ) : (
                <>
                    <div className={styles.profileDetails}>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Họ và tên:</span>
                            <span className={styles.value}>{patientProfile?.full_name}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Email:</span>
                            <span className={styles.value}>{user?.email}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Ngày sinh:</span>
                            <span className={styles.value}>{formatDate(patientProfile?.date_of_birth)}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Giới tính:</span>
                            <span className={styles.value}>{patientProfile?.gender || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Số điện thoại:</span>
                            <span className={styles.value}>{patientProfile?.phone_number || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Địa chỉ:</span>
                            <span className={styles.value}>{patientProfile?.address || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Nhóm máu:</span>
                            <span className={styles.value}>{patientProfile?.blood_type || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Dị ứng:</span>
                            <span className={styles.value}>{patientProfile?.allergies || 'Không có'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Bệnh mãn tính:</span>
                            <span className={styles.value}>{patientProfile?.chronic_conditions || 'Không có'}</span>
                        </div>
                    </div>
                    <div className={styles.formActions}>
                        <button onClick={handleEditClick} className={styles.editButton}>
                            Chỉnh sửa hồ sơ
                        </button>
                        <button
                            onClick={() => navigate('/book-appointment')}
                            className={styles.saveButton}
                        >
                            Tạo Lịch Hẹn Mới
                        </button>
                    </div>
                    <div className={styles.appointmentsSection}>
                        <h3>Lịch Hẹn Của Tôi</h3>
                        {appointmentsLoading ? (
                            <p>Đang tải lịch hẹn...</p>
                        ) : appointmentsError ? (
                            <p className={styles.error}>{appointmentsError}</p>
                        ) : appointments && appointments.length > 0 ? (
                            <ul className={styles.appointmentsList}>
                                {appointments.map(app => (
                                    <li key={app.id} className={styles.appointmentItem}>
                                        <div>
                                            <strong>Bác sĩ:</strong> {app.doctor_name || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Phòng khám:</strong> {app.clinic_name || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Thời gian:</strong> {app.appointment_date ? formatDate(app.appointment_date) : 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Lý do khám:</strong> {app.reason_for_visit || 'Không có'}
                                        </div>
                                        <div>
                                            <strong>Trạng thái:</strong> {app.status || 'N/A'}
                                        </div>
                                    <div className={styles.appointmentActions}>
                                        <button
                                            onClick={() => {
                                                const doctorId = prompt('Nhập ID bác sĩ mới:', app.doctor_id || '');
                                                if (doctorId !== null) {
                                                    const appointmentDate = prompt('Nhập thời gian khám mới (định dạng: YYYY-MM-DD HH:mm):', app.appointment_date || '');
                                                    if (appointmentDate !== null) {
                                                        handleEditAppointment(app.id, doctorId, appointmentDate);
                                                    }
                                                }
                                            }}
                                            className={styles.editButton}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAppointment(app.id)}
                                            className={styles.cancelButton}
                                        >
                                            Xóa
                                        </button>
                                    </div>

                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Hiện tại bạn chưa có lịch hẹn nào. Nhấn "Tạo Lịch Hẹn Mới" để đặt lịch.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default PatientProfile;