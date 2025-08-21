# Build stage
FROM node:20.9.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Production stage
FROM node:20.9.0-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/jsconfig.json ./jsconfig.json

# Create upload directories
RUN mkdir -p public/uploads/admin \
    && mkdir -p public/uploads/setting \
    && mkdir -p public/download/invoice \
    && mkdir -p public/download/quote \
    && mkdir -p public/download/payment

# Copy static files if they exist
COPY --from=builder /app/public ./public

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 8888

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8888/api/health || exit 1

# Start the application
CMD ["node", "src/server.js"]
