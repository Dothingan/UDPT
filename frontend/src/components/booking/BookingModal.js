// // frontend/src/components/booking/BookingModal.js
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import styles from './BookingModal.module.css';

// // Thêm prop 'statusMessage' để nhận thông báo từ DoctorProfile
// function BookingModal({ show, onClose, doctor, slot, patientProfile, onSubmitBooking, isSubmitting, statusMessage }) {
//     const { user } = useAuth();
//     const [reasonForVisit, setReasonForVisit] = useState('');
//     const [patientFullName, setPatientFullName] = useState('');
//     const [patientPhoneNumber, setPatientPhoneNumber] = useState('');

//     useEffect(() => {
//         if (show && user) {
//             setPatientFullName(patientProfile?.full_name || user?.displayName || user?.email?.split('@')[0] || '');
//             setPatientPhoneNumber(patientProfile?.phone_number || '');
//         }
//         // Reset reason for visit khi modal mở hoặc khi slot/doctor thay đổi (nếu cần)
//         if (show) {
//             setReasonForVisit('');
//         }
//     }, [show, user, patientProfile, slot]); // Thêm slot để reset reasonForVisit khi slot thay đổi

//     if (!show) {
//         return null;
//     }

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         onSubmitBooking({
//             patient_full_name: patientFullName,
//             patient_phone_number: patientPhoneNumber,
//             reason_for_visit: reasonForVisit,
//         });
//     };

//     const formatTime = (timeString) => {
//         if (!timeString) return '';
//         return timeString.substring(0, 5);
//     };

//     const formatDate = (dateString) => {
//         if (!dateString) return 'N/A';
//         // Đảm bảo dateString là YYYY-MM-DD hoặc có thể parse được bởi new Date()
//         try {
//             const date = new Date(dateString + (dateString.includes('T') ? '' : 'T00:00:00')); // Thêm giờ nếu chỉ có ngày
//             return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
//         } catch (e) {
//             return dateString; // Trả về nguyên bản nếu không parse được
//         }
//     };

//     return (
//         <div className={styles.modalOverlay}>
//             <div className={styles.modalContent}>
//                 <button onClick={onClose} className={styles.closeButtonTop} disabled={isSubmitting}>&times;</button>
//                 <h2 className={styles.modalTitle}>Xác Nhận Đặt Lịch Khám</h2>

//                 <div className={styles.appointmentInfo}>
//                     <p><strong>Bác sĩ:</strong> {doctor?.full_name}</p>
//                     <p><strong>Chuyên khoa:</strong> {doctor?.speciality_name || 'N/A'}</p>
//                     {/* <p><strong>Phòng khám:</strong> {doctor?.clinic_name || 'N/A'}</p> */}
//                     <p><strong>Ngày khám:</strong> {formatDate(slot?.schedule_date)}</p>
//                     <p><strong>Giờ khám:</strong> {formatTime(slot?.start_time)} - {formatTime(slot?.end_time)}</p>
//                 </div>

//                 <hr className={styles.divider} />

//                 <form onSubmit={handleSubmit}>
//                     <h3 className={styles.sectionTitle}>Thông Tin Người Đặt Lịch</h3>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="patientName">Họ và tên:</label>
//                         <input
//                             type="text"
//                             id="patientName"
//                             value={patientFullName}
//                             onChange={(e) => setPatientFullName(e.target.value)}
//                             className={styles.inputField}
//                             required
//                         />
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="patientEmail">Email (tài khoản):</label>
//                         <input
//                             type="email"
//                             id="patientEmail"
//                             value={user?.email || ''}
//                             readOnly
//                             className={styles.inputField}
//                         />
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="patientPhone">Số điện thoại:</label>
//                         <input
//                             type="tel"
//                             id="patientPhone"
//                             value={patientPhoneNumber}
//                             onChange={(e) => setPatientPhoneNumber(e.target.value)}
//                             className={styles.inputField}
//                             required
//                         />
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="reasonForVisit">Lý do khám (tùy chọn):</label>
//                         <textarea
//                             id="reasonForVisit"
//                             value={reasonForVisit}
//                             onChange={(e) => setReasonForVisit(e.target.value)}
//                             rows="3"
//                             className={styles.textareaField}
//                         ></textarea>
//                     </div>

//                     {/* Hiển thị statusMessage bên trong modal */}
//                     {statusMessage && (
//                         <p className={`${styles.modalMessage} ${
//                             statusMessage.includes('thất bại') || statusMessage.includes('Lỗi:')
//                                 ? styles.errorMessageModal
//                                 : styles.successMessageModal
//                         }`}>
//                             {statusMessage}
//                         </p>
//                     )}

//                     <div className={styles.modalActions}>
//                         <button type="button" onClick={onClose} className={styles.cancelButton} disabled={isSubmitting}>
//                             Hủy
//                         </button>
//                         <button type="submit" className={styles.confirmButton} disabled={isSubmitting}>
//                             {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Lịch'}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }

// export default BookingModal;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './BookingModal.module.css';

function BookingModal({ show, onClose, doctor, slot, patientProfile, onSubmitBooking, isSubmitting, statusMessage }) {
    const { user } = useAuth();
    const [reasonForVisit, setReasonForVisit] = useState('');
    const [patientFullName, setPatientFullName] = useState('');
    const [patientPhoneNumber, setPatientPhoneNumber] = useState('');

    useEffect(() => {
        if (show && user) {
            setPatientFullName(patientProfile?.full_name || user?.displayName || user?.email?.split('@')[0] || '');
            setPatientPhoneNumber(patientProfile?.phone_number || '');
            setReasonForVisit(''); // Reset reason for visit when modal opens
        }
    }, [show, user, patientProfile]); // Removed slot from dependencies

    if (!show) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmitBooking({
            patient_full_name: patientFullName,
            patient_phone_number: patientPhoneNumber,
            reason_for_visit: reasonForVisit,
        });
    };

    const formatTime = (timeString) => {
        return timeString ? timeString.substring(0, 5) : '';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString + (dateString.includes('T') ? '' : 'T00:00:00'));
            return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
        } catch {
            return dateString; // Return original if parsing fails
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.closeButtonTop} disabled={isSubmitting}>&times;</button>
                <h2 className={styles.modalTitle}>Xác Nhận Đặt Lịch Khám</h2>

                <div className={styles.appointmentInfo}>
                    <p><strong>Bác sĩ:</strong> {doctor?.full_name}</p>
                    <p><strong>Chuyên khoa:</strong> {doctor?.speciality_name || 'N/A'}</p>
                    <p><strong>Ngày khám:</strong> {formatDate(slot?.schedule_date)}</p>
                    <p><strong>Giờ khám:</strong> {formatTime(slot?.start_time)} - {formatTime(slot?.end_time)}</p>
                </div>

                <hr className={styles.divider} />

                <form onSubmit={handleSubmit}>
                    <h3 className={styles.sectionTitle}>Thông Tin Người Đặt Lịch</h3>
                    <div className={styles.formGroup}>
                        <label htmlFor="patientName">Họ và tên:</label>
                        <input
                            type="text"
                            id="patientName"
                            value={patientFullName}
                            onChange={(e) => setPatientFullName(e.target.value)}
                            className={styles.inputField}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="patientEmail">Email (tài khoản):</label>
                        <input
                            type="email"
                            id="patientEmail"
                            value={user?.email || ''}
                            readOnly
                            className={styles.inputField}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="patientPhone">Số điện thoại:</label>
                        <input
                            type="tel"
                            id="patientPhone"
                            value={patientPhoneNumber}
                            onChange={(e) => setPatientPhoneNumber(e.target.value)}
                            className={styles.inputField}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reasonForVisit">Lý do khám (tùy chọn):</label>
                        <textarea
                            id="reasonForVisit"
                            value={reasonForVisit}
                            onChange={(e) => setReasonForVisit(e.target.value)}
                            rows="3"
                            className={styles.textareaField}
                        ></textarea>
                    </div>

                    {statusMessage && (
                        <p className={`${styles.modalMessage} ${
                            statusMessage.includes('thất bại') || statusMessage.includes('Lỗi:')
                                ? styles.errorMessageModal
                                : styles.successMessageModal
                        }`}>
                            {statusMessage}
                        </p>
                    )}

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton} disabled={isSubmitting}>
                            Hủy
                        </button>
                        <button type="submit" className={styles.confirmButton} disabled={isSubmitting}>
                            {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Lịch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BookingModal;
