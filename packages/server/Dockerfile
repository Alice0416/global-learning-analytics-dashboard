# Multi-stage build for Node server
FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --only=production
COPY src ./src
COPY scripts ./scripts
CMD ["node", "src/index.js"]

