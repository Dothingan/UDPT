FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3003 # Port của Booking Service
CMD [ "node", "server.js" ]