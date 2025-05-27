-- -- 1. TẠO DATABASE (NẾU CHƯA TỒN TẠI)
-- CREATE DATABASE IF NOT EXISTS medical_booking_db
-- CHARACTER SET utf8mb4
-- COLLATE utf8mb4_unicode_ci;

-- -- 2. SỬ DỤNG DATABASE VỪA TẠO (HOẶC ĐÃ CÓ)
-- USE medical_booking_db;

-- -- 3. XÓA CÁC BẢNG THEO THỨ TỰ PHỤ THUỘC ĐỂ TRÁNH LỖI KHÓA NGOẠI
-- -- Xóa các bảng tham chiếu đến bảng khác trước
-- DROP TABLE IF EXISTS appointments;
-- DROP TABLE IF EXISTS doctor_schedules;
-- DROP TABLE IF EXISTS medical_history_entries; -- Giả sử bạn có bảng này, nếu không thì có thể bỏ qua
-- DROP TABLE IF EXISTS patients; -- Bảng patients tham chiếu users, nên xóa trước users nếu có FK
-- DROP TABLE IF EXISTS doctors; -- Bảng doctors tham chiếu specialities và clinics
-- -- Sau đó xóa các bảng được tham chiếu
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS specialities;
-- DROP TABLE IF EXISTS clinics;
-- -- Dòng "drop table if exists appointments;" đã có ở trên, nên bỏ dòng lặp lại ở đây.

-- -- 4. TẠO BẢNG `users` (CHO AUTH SERVICE)
-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     role VARCHAR(50) DEFAULT 'patient' NOT NULL COMMENT 'Vai trò: patient, doctor, admin',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -- 5. TẠO BẢNG `clinics` (CHO DOCTOR SERVICE)
-- CREATE TABLE clinics (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     address VARCHAR(255) NOT NULL,
--     phone_number VARCHAR(20),
--     email VARCHAR(255) UNIQUE COMMENT 'Email liên hệ của phòng khám',
--     website VARCHAR(255) COMMENT 'Website của phòng khám',
--     description TEXT COMMENT 'Mô tả về phòng khám',
--     image_url VARCHAR(255) COMMENT 'Đường dẫn đến ảnh đại diện/logo của phòng khám',
--     operating_hours VARCHAR(255) COMMENT 'Giờ làm việc, ví dụ: "Thứ 2 - Thứ 6: 8AM - 5PM"',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -- 6. TẠO BẢNG `specialities` (CHO DOCTOR SERVICE)
-- CREATE TABLE specialities (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Tên chuyên khoa, ví dụ: Tim Mạch, Da liễu',
--     description TEXT COMMENT 'Mô tả chi tiết về chuyên khoa',
--     image_url VARCHAR(255) COMMENT 'Đường dẫn đến ảnh/icon đại diện cho chuyên khoa (tùy chọn)',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -- 7. TẠO BẢNG `doctors` (CHO DOCTOR SERVICE - PHIÊN BẢN ĐÃ CẬP NHẬT)
-- CREATE TABLE doctors (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     full_name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) UNIQUE COMMENT 'Email liên hệ của bác sĩ, có thể khác email tài khoản',
--     phone_number VARCHAR(20) UNIQUE COMMENT 'Số điện thoại liên hệ của bác sĩ',
--     description TEXT COMMENT 'Mô tả chi tiết, kinh nghiệm làm việc của bác sĩ',
--     avatar_url VARCHAR(255) COMMENT 'Đường dẫn đến ảnh đại diện của bác sĩ',
--     experience_years INT DEFAULT 0 COMMENT 'Số năm kinh nghiệm',
--     speciality_id INT NULL DEFAULT NULL COMMENT 'ID của chuyên khoa mà bác sĩ thuộc về',
--     clinic_id INT NULL DEFAULT NULL COMMENT 'ID của phòng khám mà bác sĩ làm việc',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     CONSTRAINT fk_doctor_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id) ON DELETE SET NULL ON UPDATE CASCADE,
--     CONSTRAINT fk_doctor_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL ON UPDATE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -- 8. TẠO BẢNG `doctor_schedules` (LỊCH LÀM VIỆC CỦA BÁC SĨ)
-- CREATE TABLE doctor_schedules (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     doctor_id INT NOT NULL COMMENT 'ID của bác sĩ mà lịch này thuộc về',
--     schedule_date DATE NOT NULL COMMENT 'Ngày làm việc',
--     start_time TIME NOT NULL COMMENT 'Giờ bắt đầu của ca làm việc/khung giờ',
--     end_time TIME NOT NULL COMMENT 'Giờ kết thúc của ca làm việc/khung giờ',
--     is_booked BOOLEAN DEFAULT FALSE COMMENT 'Trạng thái khung giờ này đã được đặt hay chưa',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     CONSTRAINT fk_schedule_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
--     CONSTRAINT uq_doctor_schedule_slot UNIQUE (doctor_id, schedule_date, start_time)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -- 9. TẠO BẢNG `patients`
-- CREATE TABLE patients (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT UNIQUE COMMENT 'ID của người dùng trong bảng users (nếu bệnh nhân có tài khoản)',
--     full_name VARCHAR(255) NOT NULL COMMENT 'Họ tên đầy đủ của bệnh nhân',
--     date_of_birth DATE,
--     gender ENUM('Male', 'Female', 'Other') COMMENT 'Giới tính',
--     phone_number VARCHAR(20) UNIQUE COMMENT 'Số điện thoại liên hệ của bệnh nhân',
--     address TEXT COMMENT 'Địa chỉ liên hệ',
--     blood_type VARCHAR(5) COMMENT 'Nhóm máu (ví dụ: A+, O-)',
--     allergies TEXT COMMENT 'Thông tin dị ứng (nếu có)',
--     chronic_conditions TEXT COMMENT 'Thông tin về các bệnh mãn tính (nếu có)',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     CONSTRAINT fk_patient_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -- 10. TẠO BẢNG `appointments`
-- CREATE TABLE appointments (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     patient_user_id INT NOT NULL COMMENT 'Sửa lại từ patient_id trong file gốc của bạn, giữ nguyên để khớp với logic sau này, nhưng nên là patient_id tham chiếu đến bảng patients.id',
--     doctor_id INT NOT NULL,
--     doctor_schedule_id INT NOT NULL,
--     status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NOSHOW') DEFAULT 'PENDING' COMMENT 'Thêm các trạng thái có thể có',
--     reason_for_visit TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     CONSTRAINT fk_appointment_patient_user FOREIGN KEY (patient_user_id) REFERENCES users(id) ON DELETE CASCADE, -- Hoặc users(id) nếu patient_user_id là user_id trực tiếp
--     CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
--     CONSTRAINT fk_appointment_schedule FOREIGN KEY (doctor_schedule_id) REFERENCES doctor_schedules(id) ON DELETE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -- THÊM DỮ LIỆU MẪU (OPTIONAL - giữ lại nếu bạn muốn có dữ liệu ban đầu)

-- -- Thêm chuyên khoa mẫu
-- INSERT INTO specialities (name, description) VALUES
-- ('Tim Mạch', 'Chuyên khoa khám và điều trị các bệnh lý về tim và mạch máu.'),
-- ('Nhi Khoa', 'Chuyên khoa chăm sóc sức khỏe cho trẻ em và thanh thiếu niên.'),
-- ('Da liễu', 'Chuyên khoa điều trị các bệnh về da, tóc và móng.'),
-- ('Nội tổng quát', 'Khám và điều trị các bệnh nội khoa thông thường.');

-- -- Thêm phòng khám mẫu
-- INSERT INTO clinics (name, address, phone_number, email, website, description, operating_hours) VALUES
-- ('Phòng khám Đa khoa An Sinh', '100 Đường Sức Khỏe, Quận Hà Đông, TP. HN', '02811112222', 'info@ansinhclinic.com', 'http://ansinhclinic.com', 'Phòng khám đa khoa hiện đại, trang thiết bị tiên tiến.', 'Thứ 2 - Thứ 7: 7:00 AM - 5:00 PM'),
-- ('Phòng khám Chuyên Nhi Hạnh Phúc', '200 Đường Trẻ Thơ, Quận 3, TP. HCM', '02822223333', 'info@hanhphucnhi.com', 'http://hanhphucnhi.com', 'Chăm sóc sức khỏe toàn diện cho bé yêu.', 'Thứ 2 - Chủ Nhật: 8:00 AM - 7:00 PM');

-- -- Thêm bác sĩ mẫu
-- -- ID của specialities và clinics sẽ bắt đầu từ 1 nếu bạn vừa tạo mới chúng.
-- -- Lưu ý: Kiểm tra xem ID speciality và clinic có khớp với dữ liệu đã INSERT ở trên không.
-- INSERT INTO doctors (full_name, email, phone_number, speciality_id, clinic_id, description, experience_years, avatar_url) VALUES
-- ('Bác sĩ Nguyễn Văn Tâm', 'tam.nguyen@clinic.com', '0901234567', 1, 1, 'Bác sĩ chuyên khoa tim mạch với 15 năm kinh nghiệm.', 15, 'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482752rhD/anh-mo-ta.png'),
-- ('Bác sĩ Trần Thị Mai', 'mai.tran@clinic.com', '0909876543', 2, 2, 'Bác sĩ nhi khoa tận tâm, tốt nghiệp Đại học Y Dược.', 8, 'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482752AkI/anh-mo-ta.png'),
-- ('Bác sĩ Lê Văn Hùng', 'hung.le@clinic.com', '0909876542', 3, 1, 'Bác sĩ da liễu nhiều kinh nghiệm.', 10, 'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482752rhD/anh-mo-ta.png'); -- Sửa email và sđt để tránh trùng lặp UNIQUE

-- -- Thêm lịch làm việc mẫu cho bác sĩ (ví dụ cho Bác sĩ Nguyễn Văn Tâm, doctor_id = 1)
-- -- CURDATE() sẽ lấy ngày hiện tại khi script chạy.
-- INSERT INTO doctor_schedules (doctor_id, schedule_date, start_time, end_time) VALUES
-- (1, CURDATE() + INTERVAL 1 DAY, '09:00:00', '09:30:00'),
-- (1, CURDATE() + INTERVAL 1 DAY, '09:30:00', '10:00:00'),
-- (1, CURDATE() + INTERVAL 1 DAY, '10:00:00', '10:30:00'),
-- (2, CURDATE() + INTERVAL 1 DAY, '14:00:00', '14:30:00'),
-- (2, CURDATE() + INTERVAL 1 DAY, '14:30:00', '15:00:00');

-- -- Dữ liệu mẫu cho bảng patients (nếu cần, liên kết với users đã tạo nếu có)
-- -- Giả sử bạn tạo user trước rồi mới tạo patient tương ứng
-- -- INSERT INTO users (email, password_hash, role) VALUES ('patient1@example.com', 'hashed_password1', 'patient');
-- -- INSERT INTO users (email, password_hash, role) VALUES ('patient2@example.com', 'hashed_password2', 'patient');

-- -- Lấy ID của user vừa tạo để insert vào patients (cách này không chạy trực tiếp trong script init, chỉ để minh họa)
-- -- SET @user1_id = LAST_INSERT_ID(); -- Hoặc bạn biết ID của user từ trước

-- -- INSERT INTO patients (user_id, full_name, date_of_birth, gender, phone_number, address) VALUES
-- -- (@user1_id, 'Nguyễn Văn Bệnh Nhân A', '1990-01-01', 'Male', '0912345000', '123 Đường Sức Khỏe, TP. HCM'),
-- -- ((SELECT id FROM users WHERE email = 'patient2@example.com'), 'Trần Thị Bệnh Nhân B', '1992-05-15', 'Female', '0912345001', '456 Đường An Bình, TP. HN');