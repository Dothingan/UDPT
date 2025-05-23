// frontend/src/components/doctor/DoctorProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDoctorById, getAvailableSchedulesByDoctorAndDate } from '../../services/doctorService';
import { createAppointment } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import styles from './DoctorProfile.module.css'; // Đảm bảo bạn có file CSS này
import BookingModal from '../booking/BookingModal'; // Đảm bảo đường dẫn này đúng
import { getMyPatientProfile } from '../../services/patientService';

function DoctorProfile() {
    const { doctorId } = useParams(); // Lấy doctorId từ URL
    const { isAuthenticated } = useAuth(); // Lấy trạng thái xác thực
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null); // Khởi tạo doctor là null
    const [schedules, setSchedules] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [loadingDoctor, setLoadingDoctor] = useState(true);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [error, setError] = useState(''); // Lỗi khi tải thông tin bác sĩ
    const [scheduleError, setScheduleError] = useState(''); // Lỗi khi tải lịch làm việc
    const [bookingMessage, setBookingMessage] = useState(''); // Thông báo cho việc đặt lịch

    const [patientProfile, setPatientProfile] = useState(null); // State lưu hồ sơ bệnh nhân

    // Effect để lấy thông tin chi tiết bác sĩ
    useEffect(() => {
        if (!doctorId) {
            setError('Không có ID bác sĩ được cung cấp.');
            setLoadingDoctor(false);
            setDoctor(null);
            return;
        }

        const fetchDoctorDetails = async () => {
            console.log(`[DoctorProfile] Fetching details for doctor ID: ${doctorId}`);
            try {
                setLoadingDoctor(true);
                setError(''); // Reset lỗi cũ
                const data = await getDoctorById(doctorId);
                if (data && data.id) { // Kiểm tra data có hợp lệ không
                    setDoctor(data);
                    console.log('[DoctorProfile] Doctor data fetched:', data);
                } else {
                    setError(`Không tìm thấy thông tin cho bác sĩ ID ${doctorId} hoặc dữ liệu không hợp lệ.`);
                    setDoctor(null);
                    console.warn(`[DoctorProfile] No valid data for doctor ID ${doctorId}`);
                }
            } catch (err) {
                console.error(`[DoctorProfile] Error fetching doctor ID ${doctorId}:`, err);
                setError(err.message || `Không thể tải thông tin bác sĩ ID ${doctorId}.`);
                setDoctor(null); // Đảm bảo doctor là null khi có lỗi
            } finally {
                setLoadingDoctor(false);
            }
        };

        fetchDoctorDetails();
    }, [doctorId]); // Chỉ chạy lại khi doctorId thay đổi

    // Effect để lấy thông tin hồ sơ bệnh nhân (nếu đã đăng nhập)
    useEffect(() => {
        const fetchPatientProfile = async () => {
            if (isAuthenticated) {
                try {
                    console.log('[DoctorProfile] Fetching patient profile for current user.');
                    const profileData = await getMyPatientProfile();
                    setPatientProfile(profileData);
                    console.log('[DoctorProfile] Patient profile fetched:', profileData);
                } catch (err) {
                    console.warn("[DoctorProfile] Could not fetch patient profile:", err.message);
                    // Không set lỗi ở đây để không ghi đè lỗi fetch doctor (nếu có)
                    setPatientProfile(null); // Nếu lỗi thì patientProfile là null
                }
            } else {
                setPatientProfile(null); // Xóa profile nếu không đăng nhập
            }
        };
        fetchPatientProfile();
    }, [isAuthenticated]); // Chạy lại khi trạng thái đăng nhập thay đổi


    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
        setSchedules([]); // Xóa lịch cũ
        setScheduleError(''); // Xóa lỗi lịch cũ
        setBookingMessage(''); // Xóa thông báo đặt lịch cũ
    };

    const fetchSchedulesForDate = async () => {
        if (!selectedDate) {
            setScheduleError('Vui lòng chọn ngày để xem lịch.');
            return;
        }
        if (!doctorId) { // Thêm kiểm tra này
            setScheduleError('Không có thông tin bác sĩ để tải lịch.');
            return;
        }
        try {
            setLoadingSchedules(true);
            setScheduleError('');
            setBookingMessage('');
            console.log(`[DoctorProfile] Fetching available schedules for doctor ${doctorId} on ${selectedDate}`);
            const data = await getAvailableSchedulesByDoctorAndDate(doctorId, selectedDate);
            setSchedules(data);
            if (data.length === 0) {
                setScheduleError('Không có lịch trống cho ngày đã chọn.');
            }
            console.log(`[DoctorProfile] Available schedules for ${selectedDate}:`, data);
        } catch (err) {
            console.error(`[DoctorProfile] Error fetching available schedules for doctor ${doctorId} on ${selectedDate}:`, err);
            setScheduleError(err.message || 'Không thể tải lịch làm việc.');
            setSchedules([]);
        } finally {
            setLoadingSchedules(false);
        }
    };

    // State cho Booking Modal
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedSlotForBooking, setSelectedSlotForBooking] = useState(null);
    const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

    const openBookingModal = (slot) => {
        if (!isAuthenticated) {
            setBookingMessage('Vui lòng đăng nhập để đặt lịch.');
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }
        setSelectedSlotForBooking(slot);
        setShowBookingModal(true);
        setBookingMessage('');
    };

    const handleCloseBookingModal = () => {
        setShowBookingModal(false);
        setSelectedSlotForBooking(null);
    };

    const handleSubmitBooking = async (bookingDetailsFromModal) => {
        if (!selectedSlotForBooking || !doctor) {
            console.error("[DoctorProfile] handleSubmitBooking called with no selected slot or doctor info.");
            return;
        }

        setIsSubmittingBooking(true);
        setBookingMessage('Đang xử lý đặt lịch...');
        try {
            console.log("[DoctorProfile] Submitting booking with details:", bookingDetailsFromModal);
            const appointmentData = {
                doctor_id: parseInt(doctor.id),
                doctor_schedule_id: selectedSlotForBooking.id,
                reason_for_visit: bookingDetailsFromModal.reason_for_visit
            };
            const result = await createAppointment(appointmentData);
            setBookingMessage(result.message || 'Đặt lịch thành công!');
            handleCloseBookingModal();
            fetchSchedulesForDate(); // Tải lại lịch trống cho ngày đã chọn
        } catch (err) {
            setBookingMessage(err.message || 'Đặt lịch thất bại. Vui lòng thử lại.');
            console.error("[DoctorProfile] Booking error:", err);
        } finally {
            setIsSubmittingBooking(false);
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.substring(0, 5); // Lấy HH:MM
    };

    // Các điều kiện render sớm
    if (loadingDoctor) {
        return <div className={styles.loading}>Đang tải thông tin bác sĩ...</div>;
    }

    if (error) { // Nếu có lỗi khi tải thông tin bác sĩ
        return <div className={styles.error}>Lỗi: {error} <Link to="/doctors">Quay lại danh sách</Link></div>;
    }

    if (!doctor) { // Nếu không loading, không error, mà doctor vẫn là null (ví dụ API trả về không có bác sĩ)
        return (
            <div className={styles.noDoctor}>
                Không tìm thấy thông tin bác sĩ hoặc bác sĩ không tồn tại.
                <Link to="/doctors" className={styles.backLink}>Quay lại danh sách</Link>
            </div>
        );
    }

    // Nếu đến đây, doctor phải là một object.
    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileHeader}>
                <img
                    src={doctor.avatar_url || `https://via.placeholder.com/200?text=${doctor.full_name ? doctor.full_name.charAt(0).toUpperCase() : 'D'}`}
                    alt={doctor.full_name || 'Bác sĩ'}
                    className={styles.profileAvatar}
                />
                <div className={styles.profileInfo}>
                    <h1 className={styles.doctorName}>{doctor.full_name || 'Không có tên'}</h1>
                    <p className={styles.infoItem}><strong>Chuyên khoa:</strong> {doctor.speciality_name || 'Chưa cập nhật'}</p>
                    <p className={styles.infoItem}><strong>Phòng khám:</strong> {doctor.clinic_name || 'Chưa cập nhật'}</p>
                    {doctor.clinic_address && <p className={styles.infoItem}><strong>Địa chỉ PK:</strong> {doctor.clinic_address}</p>}
                    <p className={styles.infoItem}><strong>Kinh nghiệm:</strong> {doctor.experience_years !== null && doctor.experience_years !== undefined ? doctor.experience_years : 0} năm</p>
                </div>
            </div>

            {doctor.description && (
                <div className={styles.descriptionSection}>
                    <h3>Mô tả</h3>
                    <p>{doctor.description}</p>
                </div>
            )}

            <div className={styles.scheduleSection}>
                <h3>Xem Lịch Khám Còn Trống</h3>
                <div className={styles.datePickerContainer}>
                    <label htmlFor="schedule-date">Chọn ngày: </label>
                    <input
                        type="date"
                        id="schedule-date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className={styles.dateInput}
                        min={new Date().toISOString().split("T")[0]} // Không cho chọn ngày quá khứ
                    />
                    <button onClick={fetchSchedulesForDate} disabled={loadingSchedules || !selectedDate} className={styles.viewButton}>
                        {loadingSchedules ? 'Đang tải...' : 'Xem Lịch'}
                    </button>
                </div>

                {/* Hiển thị thông báo đặt lịch (nếu có và modal không hiển thị) */}
                {bookingMessage && !showBookingModal && (
                    <p className={`${styles.bookingMessage} ${bookingMessage.includes('thất bại') ? styles.errorMessage : styles.successMessage}`}>
                        {bookingMessage}
                    </p>
                )}
                {scheduleError && <p className={styles.scheduleError}>{scheduleError}</p>}

                {schedules.length > 0 && !scheduleError && (
                    <div className={styles.slotsContainer}>
                        <h4>Các khung giờ còn trống ngày {selectedDate}:</h4>
                        <ul className={styles.slotList}>
                            {schedules.map(slot => (
                                <li key={slot.id} className={styles.slotItem}>
                                    <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                                    <button
                                        className={styles.bookButton}
                                        onClick={() => openBookingModal(slot)}
                                    >
                                        Đặt Lịch
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <Link to="/doctors" className={styles.backLink}>&larr; Quay lại danh sách bác sĩ</Link>

            {/* Render Booking Modal */}
            {/* Đảm bảo doctor và selectedSlotForBooking có giá trị trước khi render modal */}
            {showBookingModal && selectedSlotForBooking && doctor && (
                <BookingModal
                    show={showBookingModal}
                    onClose={handleCloseBookingModal}
                    doctor={doctor}
                    slot={selectedSlotForBooking}
                    patientProfile={patientProfile}
                    onSubmitBooking={handleSubmitBooking}
                    isSubmitting={isSubmittingBooking}
                />
            )}
        </div>
    );
}

export default DoctorProfile;