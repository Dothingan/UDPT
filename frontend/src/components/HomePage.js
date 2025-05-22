// src/components/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
    const { user } = useAuth();
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>Chào mừng đến với Hệ thống Đặt Lịch Khám Bệnh</h2>
            {user ? (
                <p>Bạn đã đăng nhập với email: {user.email}</p>
            ) : (
                <p>Vui lòng <Link to="/login">đăng nhập</Link> hoặc <Link to="/register">đăng ký</Link> để sử dụng đầy đủ các tính năng.</p>
            )}
            <p>Khám phá <Link to="/doctors">danh sách bác sĩ</Link> của chúng tôi.</p>
        </div>
    );
}
export default HomePage;