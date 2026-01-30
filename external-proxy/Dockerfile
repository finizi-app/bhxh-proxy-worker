FROM node:18-alpine

WORKDIR /app

COPY package.json ./
# No dependencies to install yet, but good practice
# RUN npm install --production

COPY server.js ./

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
