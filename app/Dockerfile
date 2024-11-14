# Build stage
FROM node:21-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY *.js *.ts *.tsx *.html tsconfig.* ./
COPY ./src ./src
COPY ./public ./public

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
