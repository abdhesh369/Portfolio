# Build stage
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy tsconfig and source files
COPY tsconfig.json ./
COPY src/ ./src/
COPY packages/shared/ ./packages/shared/

# Build the application
RUN npm run build

# Production stage
FROM node:22-slim

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Copy built assets
COPY --from=builder /app/dist ./dist

# Copy migrations and scripts
COPY drizzle/ ./drizzle/
COPY scripts/ ./scripts/
COPY start.sh ./
RUN chmod +x start.sh

# Expose port
EXPOSE 5000

# Start command
CMD ["./start.sh"]
