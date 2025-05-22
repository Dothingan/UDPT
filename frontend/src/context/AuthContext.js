
// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Thông tin người dùng
    const [token, setToken] = useState(localStorage.getItem('token')); // Lấy token từ localStorage khi tải lại

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
                localStorage.removeItem('user'); // Xóa user bị lỗi
                localStorage.removeItem('token'); // Xóa token luôn cho chắc
                setToken(null);
                setUser(null);
            }
        } else if (token && !storedUser) { // Có token nhưng không có user -> bất thường, logout
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        } else { // Không có token
            setUser(null);
        }
    }, [token]); // Chỉ chạy lại khi token thay đổi

    const loginAction = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
    };

    const logoutAction = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, loginAction, logoutAction, isAuthenticated: !!token && !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook tùy chỉnh để dễ dàng sử dụng AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};