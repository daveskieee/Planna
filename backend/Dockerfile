FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production

COPY . .
RUN mkdir -p db

EXPOSE 3000

CMD ["npm", "start"]
