# Sử dụng một image Node.js chính thức làm base image
# Chọn phiên bản Node.js phù hợp với dự án của bạn (ví dụ: 18-alpine cho nhẹ)
FROM node:18-alpine

# Tạo thư mục làm việc bên trong container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json (hoặc yarn.lock)
# Sử dụng dấu * để bao gồm cả package-lock.json nếu có
COPY package*.json ./

# Cài đặt các dependencies của dự án
# Nếu bạn dùng yarn, thay 'npm install' bằng 'yarn install'
RUN npm install

# Sao chép toàn bộ mã nguồn của service vào thư mục làm việc trong container
COPY . .

# Expose port mà service của bạn đang chạy (ví dụ: 3001 cho Auth Service)
# Giá trị này nên khớp với AUTH_SERVICE_PORT trong file .env của bạn
EXPOSE 3002

# Lệnh để chạy ứng dụng khi container khởi động
# Nếu file chính của bạn là app.js, hãy thay server.js bằng app.js
# Hoặc nếu bạn dùng script "start" trong package.json: CMD [ "npm", "start" ]
CMD [ "node", "server.js" ]