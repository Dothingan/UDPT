// frontend/src/components/doctor/DoctorList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllDoctors } from '../../services/doctorService'; // Đường dẫn tới service
import styles from './DoctorList.module.css'; // Tạo file CSS Module này

function DoctorList() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                const data = await getAllDoctors();
                setDoctors(data);
                setError('');
            } catch (err) {
                setError(err.message || 'Không thể tải danh sách bác sĩ.');
                setDoctors([]); // Xóa danh sách cũ nếu có lỗi
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    if (loading) {
        return <div className={styles.loading}>Đang tải danh sách bác sĩ...</div>;
    }

    if (error) {
        return <div className={styles.error}>Lỗi: {error}</div>;
    }

    if (doctors.length === 0) {
        return <div className={styles.noDoctors}>Hiện chưa có bác sĩ nào trong hệ thống.</div>;
    }

    return (
        <div className={styles.doctorListContainer}>
            <h2 className={styles.title}>Danh Sách Bác Sĩ</h2>
            <div className={styles.doctorGrid}>
                {doctors.map(doctor => (
                    <div key={doctor.id} className={styles.doctorCard}>
                        <img
                            src={doctor.avatar_url || 'https://via.placeholder.com/150?text=Avatar'}
                            alt={doctor.full_name}
                            className={styles.doctorAvatar}
                        />
                        <h3 className={styles.doctorName}>{doctor.full_name}</h3>
                        <p className={styles.doctorSpeciality}>
                            Chuyên khoa: {doctor.speciality_name || 'Chưa cập nhật'}
                        </p>
                        <p className={styles.doctorClinic}>
                            Phòng khám: {doctor.clinic_name || 'Chưa cập nhật'}
                        </p>
                        <Link to={`/doctors/${doctor.id}`} className={styles.detailLink}>
                            Xem Chi Tiết & Đặt Lịch
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DoctorList;