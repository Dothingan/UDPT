#!/bin/bash
set -e # Thoát ngay nếu có lệnh nào lỗi

echo "Starting custom SQL initialization script (init_db.sh)..."

# Biến môi trường MYSQL_ROOT_PASSWORD và MYSQL_DATABASE
# sẽ được Docker entrypoint cung cấp tự động cho script này.
# Chúng ta dùng root để thực thi các lệnh khởi tạo.

mysql -u root --password="$MYSQL_ROOT_PASSWORD" --default-character-set=utf8mb4 "$MYSQL_DATABASE" <<-EOSQL
# BẮT ĐẦU DÁN TOÀN BỘ NỘI DUNG TỪ TỆP init.sql CỦA BẠN VÀO ĐÂY

# Ví dụ: Nếu tệp init.sql của bạn bắt đầu bằng DROP TABLE, hãy dán từ đó:
# (Lưu ý: CREATE DATABASE và USE DATABASE có thể không cần thiết nếu MYSQL_DATABASE đã được đặt,
# vì entrypoint của MySQL thường đã xử lý việc này. Nhưng để cho chắc chắn, bạn có thể giữ lại
# các lệnh USE medical_booking_db; nếu database đã được tạo.)

USE medical_booking_db; # Đảm bảo đúng database được chọn

DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctor_schedules;
DROP TABLE IF EXISTS medical_history_entries; -- Giả sử bạn có bảng này
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS specialities;
DROP TABLE IF EXISTS clinics;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'patient' NOT NULL COMMENT 'Vai trò: patient, doctor, admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE clinics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(255) UNIQUE COMMENT 'Email liên hệ của phòng khám',
    website VARCHAR(255) COMMENT 'Website của phòng khám',
    description TEXT COMMENT 'Mô tả về phòng khám',
    image_url VARCHAR(255) COMMENT 'Đường dẫn đến ảnh đại diện/logo của phòng khám',
    operating_hours VARCHAR(255) COMMENT 'Giờ làm việc, ví dụ: "Thứ 2 - Thứ 6: 8AM - 5PM"',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE specialities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Tên chuyên khoa, ví dụ: Tim Mạch, Da liễu',
    description TEXT COMMENT 'Mô tả chi tiết về chuyên khoa',
    image_url VARCHAR(255) COMMENT 'Đường dẫn đến ảnh/icon đại diện cho chuyên khoa (tùy chọn)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE COMMENT 'Email liên hệ của bác sĩ, có thể khác email tài khoản',
    phone_number VARCHAR(20) UNIQUE COMMENT 'Số điện thoại liên hệ của bác sĩ',
    description TEXT COMMENT 'Mô tả chi tiết, kinh nghiệm làm việc của bác sĩ',
    avatar_url VARCHAR(255) COMMENT 'Đường dẫn đến ảnh đại diện của bác sĩ',
    experience_years INT DEFAULT 0 COMMENT 'Số năm kinh nghiệm',
    speciality_id INT NULL DEFAULT NULL COMMENT 'ID của chuyên khoa mà bác sĩ thuộc về',
    clinic_id INT NULL DEFAULT NULL COMMENT 'ID của phòng khám mà bác sĩ làm việc',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctor_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_doctor_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE doctor_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL COMMENT 'ID của bác sĩ mà lịch này thuộc về',
    schedule_date DATE NOT NULL COMMENT 'Ngày làm việc',
    start_time TIME NOT NULL COMMENT 'Giờ bắt đầu của ca làm việc/khung giờ',
    end_time TIME NOT NULL COMMENT 'Giờ kết thúc của ca làm việc/khung giờ',
    is_booked BOOLEAN DEFAULT FALSE COMMENT 'Trạng thái khung giờ này đã được đặt hay chưa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedule_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT uq_doctor_schedule_slot UNIQUE (doctor_id, schedule_date, start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE COMMENT 'ID của người dùng trong bảng users (nếu bệnh nhân có tài khoản)',
    full_name VARCHAR(255) NOT NULL COMMENT 'Họ tên đầy đủ của bệnh nhân',
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other') COMMENT 'Giới tính',
    phone_number VARCHAR(20) UNIQUE COMMENT 'Số điện thoại liên hệ của bệnh nhân',
    address TEXT COMMENT 'Địa chỉ liên hệ',
    blood_type VARCHAR(5) COMMENT 'Nhóm máu (ví dụ: A+, O-)',
    allergies TEXT COMMENT 'Thông tin dị ứng (nếu có)',
    chronic_conditions TEXT COMMENT 'Thông tin về các bệnh mãn tính (nếu có)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_user_id INT NOT NULL COMMENT 'ID của người dùng trong bảng users',
    doctor_id INT NOT NULL,
    doctor_schedule_id INT NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NOSHOW') DEFAULT 'PENDING',
    reason_for_visit TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointment_patient_user FOREIGN KEY (patient_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointment_schedule FOREIGN KEY (doctor_schedule_id) REFERENCES doctor_schedules(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO specialities (name, description) VALUES
('Tim Mạch', 'Chuyên khoa khám và điều trị các bệnh lý về tim và mạch máu.'),
('Nhi Khoa', 'Chuyên khoa chăm sóc sức khỏe cho trẻ em và thanh thiếu niên.'),
('Da liễu', 'Chuyên khoa điều trị các bệnh về da, tóc và móng.'),
('Nội tổng quát', 'Khám và điều trị các bệnh nội khoa thông thường.');

INSERT INTO clinics (name, address, phone_number, email, website, description, operating_hours) VALUES
('Phòng khám Đa khoa An Sinh', '100 Đường Sức Khỏe, Quận Hà Đông, TP. HN', '02811112222', 'info@ansinhclinic.com', 'http://ansinhclinic.com', 'Phòng khám đa khoa hiện đại, trang thiết bị tiên tiến.', 'Thứ 2 - Thứ 7: 7:00 AM - 5:00 PM'),
('Phòng khám Chuyên Nhi Hạnh Phúc', '200 Đường Trẻ Thơ, Quận 3, TP. HCM', '02822223333', 'info@hanhphucnhi.com', 'http://hanhphucnhi.com', 'Chăm sóc sức khỏe toàn diện cho bé yêu.', 'Thứ 2 - Chủ Nhật: 8:00 AM - 7:00 PM');

INSERT INTO doctors (full_name, email, phone_number, speciality_id, clinic_id, description, experience_years, avatar_url) VALUES
('Bác sĩ Nguyễn Văn Tâm', 'tam.nguyen@clinic.com', '0901234567', 1, 1, 'Bác sĩ chuyên khoa tim mạch với 15 năm kinh nghiệm.', 15, 'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482752rhD/anh-mo-ta.png'),
('Bác sĩ Trần Thị Mai', 'mai.tran@clinic.com', '0909876543', 2, 2, 'Bác sĩ nhi khoa tận tâm, tốt nghiệp Đại học Y Dược.', 8, 'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482752AkI/anh-mo-ta.png'),
('Bác sĩ Lê Văn Hùng', 'hung.le@clinic.com', '0909876542', 3, 1, 'Bác sĩ da liễu nhiều kinh nghiệm.', 10, 'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482752rhD/anh-mo-ta.png');

INSERT INTO doctor_schedules (doctor_id, schedule_date, start_time, end_time) VALUES
(1, CURDATE() + INTERVAL 1 DAY, '09:00:00', '09:30:00'),
(1, CURDATE() + INTERVAL 2 DAY, '09:00:00', '09:30:00'),
(1, CURDATE() + INTERVAL 3 DAY, '09:00:00', '09:30:00'),
(1, CURDATE() + INTERVAL 1 DAY, '09:30:00', '10:00:00'),
(1, CURDATE() + INTERVAL 2 DAY, '09:30:00', '10:00:00'),
(1, CURDATE() + INTERVAL 1 DAY, '10:00:00', '10:30:00'),
(2, CURDATE() + INTERVAL 1 DAY, '09:00:00', '09:30:00'),
(2, CURDATE() + INTERVAL 2 DAY, '09:00:00', '09:30:00'),
(2, CURDATE() + INTERVAL 3 DAY, '09:00:00', '09:30:00'),
(2, CURDATE() + INTERVAL 1 DAY, '09:30:00', '10:00:00'),
(2, CURDATE() + INTERVAL 2 DAY, '09:30:00', '10:00:00'),
(2, CURDATE() + INTERVAL 1 DAY, '10:00:00', '10:30:00'),
(3, CURDATE() + INTERVAL 1 DAY, '09:00:00', '09:30:00'),
(3, CURDATE() + INTERVAL 2 DAY, '09:00:00', '09:30:00'),
(3, CURDATE() + INTERVAL 3 DAY, '09:00:00', '09:30:00'),
(3, CURDATE() + INTERVAL 1 DAY, '09:30:00', '10:00:00'),
(3, CURDATE() + INTERVAL 2 DAY, '09:30:00', '10:00:00'),
(3, CURDATE() + INTERVAL 1 DAY, '10:00:00', '10:30:00');


EOSQL

echo "Finished custom SQL initialization script (init_db.sh)."