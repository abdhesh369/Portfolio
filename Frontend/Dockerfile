# Build stage
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy configuration files
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.cjs ./
COPY components.json ./
COPY index.html ./

# Copy source, public, scripts, and shared folders
COPY src/ ./src/
COPY public/ ./public/
COPY scripts/ ./scripts/
COPY packages/shared/ ./packages/shared/

# Build the application
RUN npm run build

# Production stage - Serve with Nginx
FROM nginx:stable-alpine

# Copy built assets to nginx default html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (80 is default for standard nginx image)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
