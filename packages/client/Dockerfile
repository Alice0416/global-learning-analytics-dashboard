# Build static assets
FROM node:18-alpine AS build
WORKDIR /app
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

