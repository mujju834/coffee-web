FROM node:14-alpine

WORKDIR /app/shared

COPY shared/package*.json .

RUN npm install

COPY shared/ .

WORKDIR /app/menu-service

COPY menu-service/package*.json .

RUN npm install --only=prod

COPY menu-service/src ./src

EXPOSE 5051

CMD ["node", "src/server.js"]