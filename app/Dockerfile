# Build stage
FROM node:21-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY *.js *.ts *.tsx *.html tsconfig.* ./
COPY .env.* ./
COPY ./src ./src
COPY ./public ./public

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /var/www/

# Copy nginx config
 COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
