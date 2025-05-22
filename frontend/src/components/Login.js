// frontend/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
// Sửa dòng import này để bao gồm cả useLocation
import { Link, useNavigate, useLocation } from 'react-router-dom'; // << THÊM useLocation VÀO ĐÂY
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { loginAction } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // Bây giờ useLocation đã được import

    const from = location.state?.from || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await axios.post('http://localhost:3001/auth/login', {
                email,
                password,
            });
            loginAction(response.data);
            setMessage('Đăng nhập thành công! Đang chuyển hướng...');
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 1000);
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.message || 'Đăng nhập thất bại.');
            } else if (error.request) {
                setMessage('Không thể kết nối tới máy chủ.');
            } else {
                setMessage('Đã có lỗi xảy ra.');
            }
            console.error('Login error:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Đăng Nhập</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="login-email">Email:</label>
                    <input
                        type="email"
                        id="login-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="login-password">Mật khẩu:</label>
                    <input
                        type="password"
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </div>
                <button type="submit" className={styles.button}>Đăng nhập</button>
            </form>
            {message && (
                <p className={`${styles.message} ${
                    message.includes('thất bại') || message.includes('Không thể kết nối') || message.includes('Đã có lỗi')
                        ? styles.errorMessage
                        : styles.successMessage
                }`}>
                    {message}
                </p>
            )}
            <div className={styles.navigationLink}>
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </div>
        </div>
    );
}

export default Login;