// frontend/src/components/patient/PatientProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Để kiểm tra đăng nhập và lấy thông tin user
import { getMyPatientProfile } from '../../services/patientService'; // Service vừa tạo
import styles from './PatientProfile.module.css'; // Tạo file CSS Module này

function PatientProfile() {
    const { user, isAuthenticated, token } = useAuth(); // Lấy user, token và trạng thái xác thực
    const [patientProfile, setPatientProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !token) {
            // Nếu chưa đăng nhập, chuyển về trang login và lưu lại trang muốn vào
            navigate('/login', { state: { from: '/my-profile' } });
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await getMyPatientProfile(); // Gọi API lấy hồ sơ
                setPatientProfile(data);
                setError('');
            } catch (err) {
                if (err.status === 404) {
                    // Backend trả về 404 nếu chưa có hồ sơ, có thể cho phép tạo mới
                    setError('Bạn chưa có hồ sơ bệnh nhân. Bạn có muốn tạo hồ sơ mới không?');
                    // setPatientProfile(null); // Đảm bảo profile là null
                } else if (err.requiresLogin) {
                    navigate('/login', { state: { from: '/my-profile' } });
                }
                else {
                    setError(err.message || 'Không thể tải hồ sơ bệnh nhân.');
                }
                console.error("Error in fetchProfile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthenticated, token, navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN'); // Định dạng ngày tháng theo kiểu Việt Nam
    };

    if (loading) {
        return <div className={styles.loading}>Đang tải hồ sơ của bạn...</div>;
    }

    if (error && !patientProfile) { // Chỉ hiển thị lỗi nếu không có profile và có lỗi
        return (
            <div className={styles.container}>
                <p className={styles.error}>{error}</p>
                {error.includes("tạo hồ sơ mới") && (
                    <button onClick={() => navigate('/create-patient-profile')} className={styles.actionButton}>
                        Tạo Hồ Sơ Mới
                    </button>
                )}
            </div>
        );
    }

    if (!patientProfile) {
        // Trường hợp này có thể xảy ra nếu API trả về null/undefined mà không lỗi, hoặc chưa kịp set lỗi
        return (
            <div className={styles.container}>
                <p className={styles.noProfile}>Không tìm thấy thông tin hồ sơ bệnh nhân.</p>
                <button onClick={() => navigate('/create-patient-profile')} className={styles.actionButton}>
                    Tạo Hồ Sơ Mới
                </button>
            </div>
        );
    }

    // Hiển thị thông tin hồ sơ
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Hồ Sơ Bệnh Nhân</h2>
            <div className={styles.profileDetails}>
                <div className={styles.detailItem}>
                    <span className={styles.label}>Họ và tên:</span>
                    <span className={styles.value}>{patientProfile.full_name}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.label}>Email (tài khoản):</span>
                    <span className={styles.value}>{user?.email}</span> {/* Email từ AuthContext */}
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.label}>Ngày sinh:</span>
                    <span className={styles.value}>{formatDate(patientProfile.date_of_birth)}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.label}>Giới tính:</span>
                    <span className={styles.value}>{patientProfile.gender || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.label}>Số điện thoại:</span>
                    <span className={styles.value}>{patientProfile.phone_number || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.label}>Địa chỉ:</span>
                    <span className={styles.value}>{patientProfile.address || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.label}>Nhóm máu:</span>
                    <span className={styles.value}>{patientProfile.blood_type || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.label}>Dị ứng:</span>
                    <span className={styles.value}>{patientProfile.allergies || 'Không có'}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.label}>Bệnh mãn tính:</span>
                    <span className={styles.value}>{patientProfile.chronic_conditions || 'Không có'}</span>
                </div>
            </div>
            <div className={styles.actions}>
                <button
                    onClick={() => navigate(`/my-profile/edit`)} // Sẽ tạo trang này sau
                    className={styles.actionButton}
                >
                    Chỉnh Sửa Hồ Sơ
                </button>
                <Link to="/my-profile/history" className={styles.actionLink}>Xem Tiền Sử Bệnh</Link>
            </div>
        </div>
    );
}

export default PatientProfile;
