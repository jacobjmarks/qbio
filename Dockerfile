FROM node:carbon-slim
COPY . /app/
WORKDIR /app/
RUN npm install
CMD npm start