FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3004 # Port của Patient Service
CMD [ "node", "server.js" ]