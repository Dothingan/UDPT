// frontend/src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // << IMPORT useNavigate >>
import styles from './Register.module.css';

function Register() {
    // ... (các state email, password, confirmPassword, message) ...
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // << KHỞI TẠO useNavigate >>

    const handleSubmit = async (e) => {
        e.preventDefault();
        // ... (logic kiểm tra password và confirmPassword) ...
        if (password !== confirmPassword) {
            setMessage('Mật khẩu và xác nhận mật khẩu không khớp!');
            return;
        }
        if (password.length < 6) {
            setMessage('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/auth/register', {
                email,
                password,
            });
            setMessage(response.data.message + ' Bạn sẽ được chuyển đến trang đăng nhập.');
            setEmail('');
            setPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                navigate('/login'); // << CHUYỂN HƯỚNG ĐẾN TRANG ĐĂNG NHẬP >>
            }, 2000); // Delay 2 giây để đọc message

        } catch (error) {
            // ... (xử lý lỗi) ...
            if (error.response) {
                setMessage(error.response.data.message || 'Đăng ký thất bại.');
            } else if (error.request) {
                setMessage('Không thể kết nối tới máy chủ.');
            } else {
                setMessage('Đã có lỗi xảy ra.');
            }
            console.error('Register error:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Đăng Ký Tài Khoản</h2>
            <form onSubmit={handleSubmit}>
                {/* ... input fields ... */}
                <div className={styles.formGroup}>
                    <label htmlFor="register-email">Email:</label>
                    <input
                        type="email"
                        id="register-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="register-password">Mật khẩu (ít nhất 6 ký tự):</label>
                    <input
                        type="password"
                        id="register-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength="6"
                        autoComplete="new-password"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="register-confirm-password">Xác nhận mật khẩu:</label>
                    <input
                        type="password"
                        id="register-confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength="6"
                        autoComplete="new-password"
                    />
                </div>
                <button type="submit" className={styles.button}>Đăng ký</button>
            </form>
            {message && (
                <p className={`${styles.message} ${
                    message.includes('thất bại') || message.includes('không khớp') || message.includes('ít nhất') || message.includes('Không thể kết nối') || message.includes('Đã có lỗi')
                        ? styles.errorMessage
                        : styles.successMessage
                }`}>
                    {message}
                </p>
            )}
            <div className={styles.navigationLink}>
                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </div>
        </div>
    );
}

export default Register;