// frontend/src/App.js
import React from 'react';
import {
    // ... (các import khác của react-router-dom)
    Link,
    Navigate,
    Route,
    Routes,
    useNavigate
} from 'react-router-dom';

// Import components
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import DoctorList from './components/doctor/DoctorList';
import DoctorProfile from './components/doctor/DoctorProfile';
import PatientProfile from './components/patient/PatientProfile'; // << IMPORT MỚI
// import CreatePatientProfileForm from './components/patient/CreatePatientProfileForm'; // Sẽ tạo sau

import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
    const { user, logoutAction, isAuthenticated } = useAuth();
    const navigateHook = useNavigate();

    const handleLogout = () => {
        logoutAction();
        navigateHook('/login');
    };

    return (
        // Giả sử <Router> đã bọc ở index.js
        <div className="appContainer">
            <header className="appHeader">
                <nav className="mainNav">
                    <Link to="/" className="navLink logoLink">Đặt Lịch Khám</Link>
                    <div className="navLinksContainer">
                        <Link to="/" className="navLink">Trang Chủ</Link>
                        {isAuthenticated && <Link to="/doctors" className="navLink">Tìm Bác Sĩ</Link>}

                        {isAuthenticated ? (
                            <>
                                {user && <span className="navUserInfo">Chào, {user.email}!</span>}
                                <Link to="/my-profile" className="navLink">Hồ Sơ Của Tôi</Link> {/* << LINK MỚI >> */}
                                {/* <Link to="/my-appointments" className="navLink">Lịch hẹn</Link> */}
                                <button
                                    onClick={handleLogout}
                                    className="navButton logoutButton"
                                >
                                    Đăng xuất
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="navLink">Đăng nhập</Link>
                                <Link to="/register" className="navLink">Đăng ký</Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main className="mainContent">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
                    <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />

                    {/* Routes cho Doctor */}
                    <Route path="/doctors" element={isAuthenticated ? <DoctorList /> : <Navigate to="/login" replace state={{ from: '/doctors' }} />} />
                    <Route path="/doctors/:doctorId" element={isAuthenticated ? <DoctorProfile /> : <Navigate to="/login" replace state={{ from: window.location.pathname }} />} />

                    {/* Route cho Hồ sơ Bệnh nhân */}
                    <Route
                        path="/my-profile"
                        element={isAuthenticated ? <PatientProfile /> : <Navigate to="/login" replace state={{ from: '/my-profile' }} />}
                    />
                    {/* Route để tạo hồ sơ (sẽ làm sau) */}
                    {/* <Route
              path="/create-patient-profile"
              element={isAuthenticated ? <CreatePatientProfileForm /> : <Navigate to="/login" replace state={{ from: '/create-patient-profile' }} />}
            /> */}
                    {/* Route cho tiền sử bệnh (sẽ làm sau) */}
                    {/* <Route
              path="/my-profile/history"
              element={isAuthenticated ? <MedicalHistoryList /> : <Navigate to="/login" replace state={{ from: '/my-profile/history' }} />}
            /> */}


                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>

            <footer className="appFooter">
                <p>&copy; {new Date().getFullYear()} Hệ Thống Đặt Lịch Khám Bệnh.</p>
            </footer>
        </div>
    );
}

export default App;
