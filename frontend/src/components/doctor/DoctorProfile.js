// frontend/src/components/doctor/DoctorProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDoctorById, getAvailableSchedulesByDoctorAndDate } from '../../services/doctorService';
import styles from './DoctorProfile.module.css'; // Tạo file CSS Module này

function DoctorProfile() {
    const { doctorId } = useParams(); // Lấy doctorId từ URL
    const [doctor, setDoctor] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [selectedDate, setSelectedDate] = useState(''); // Ví dụ: "2025-06-15"
    const [loadingDoctor, setLoadingDoctor] = useState(true);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [error, setError] = useState('');
    const [scheduleError, setScheduleError] = useState('');

    useEffect(() => {
        const fetchDoctorDetails = async () => {
            try {
                setLoadingDoctor(true);
                const data = await getDoctorById(doctorId);
                setDoctor(data);
                setError('');
            } catch (err) {
                setError(err.message || `Không thể tải thông tin bác sĩ ID ${doctorId}.`);
            } finally {
                setLoadingDoctor(false);
            }
        };
        if (doctorId) {
            fetchDoctorDetails();
        }
    }, [doctorId]);

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
        setSchedules([]); // Xóa lịch cũ khi chọn ngày mới
        setScheduleError(''); // Xóa lỗi cũ
    };

    const fetchSchedulesForDate = async () => {
        if (!selectedDate) {
            setScheduleError('Vui lòng chọn ngày để xem lịch.');
            return;
        }
        try {
            setLoadingSchedules(true);
            setScheduleError('');
            const data = await getAvailableSchedulesByDoctorAndDate(doctorId, selectedDate);
            setSchedules(data);
            if (data.length === 0) {
                setScheduleError('Không có lịch trống cho ngày đã chọn.');
            }
        } catch (err) {
            setScheduleError(err.message || 'Không thể tải lịch làm việc.');
            setSchedules([]);
        } finally {
            setLoadingSchedules(false);
        }
    };

    // Định dạng lại thời gian HH:MM:SS thành HH:MM
    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.substring(0, 5);
    };


    if (loadingDoctor) {
        return <div className={styles.loading}>Đang tải thông tin bác sĩ...</div>;
    }

    if (error) {
        return <div className={styles.error}>Lỗi: {error} <Link to="/doctors">Quay lại danh sách</Link></div>;
    }

    if (!doctor) {
        return <div className={styles.noDoctor}>Không tìm thấy bác sĩ. <Link to="/doctors">Quay lại danh sách</Link></div>;
    }

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileHeader}>
                <img
                    src={doctor.avatar_url || 'https://via.placeholder.com/200?text=Avatar'}
                    alt={doctor.full_name}
                    className={styles.profileAvatar}
                />
                <div className={styles.profileInfo}>
                    <h1 className={styles.doctorName}>{doctor.full_name}</h1>
                    <p className={styles.infoItem}><strong>Chuyên khoa:</strong> {doctor.speciality_name || 'N/A'}</p>
                    <p className={styles.infoItem}><strong>Phòng khám:</strong> {doctor.clinic_name || 'N/A'}</p>
                    {doctor.clinic_address && <p className={styles.infoItem}><strong>Địa chỉ PK:</strong> {doctor.clinic_address}</p>}
                    <p className={styles.infoItem}><strong>Kinh nghiệm:</strong> {doctor.experience_years || 0} năm</p>
                    {doctor.email && <p className={styles.infoItem}><strong>Email:</strong> {doctor.email}</p>}
                    {doctor.phone_number && <p className={styles.infoItem}><strong>Điện thoại:</strong> {doctor.phone_number}</p>}
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
                    />
                    <button onClick={fetchSchedulesForDate} disabled={loadingSchedules || !selectedDate} className={styles.viewButton}>
                        {loadingSchedules ? 'Đang tải...' : 'Xem Lịch'}
                    </button>
                </div>

                {scheduleError && <p className={styles.scheduleError}>{scheduleError}</p>}

                {schedules.length > 0 && (
                    <div className={styles.slotsContainer}>
                        <h4>Các khung giờ còn trống ngày {selectedDate}:</h4>
                        <ul className={styles.slotList}>
                            {schedules.map(slot => (
                                <li key={slot.id} className={styles.slotItem}>
                                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                    {/* Sau này sẽ thêm nút "Đặt lịch" ở đây */}
                                    <button className={styles.bookButton} onClick={() => alert(`Đặt lịch bác sĩ ${doctor.full_name} vào ${slot.schedule_date} lúc ${formatTime(slot.start_time)}`)}>
                                        Đặt Lịch
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <Link to="/doctors" className={styles.backLink}>&larr; Quay lại danh sách bác sĩ</Link>
        </div>
    );
}

export default DoctorProfile;