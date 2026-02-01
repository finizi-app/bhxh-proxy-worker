# Stage 1: Builder - Install dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runtime - Production image
FROM node:20-alpine
WORKDIR /app

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY . .

# Generate tsoa routes before starting
RUN npm run routes

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Health check on port 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 4000
ENV PORT=4000 HOST=0.0.0.0 NODE_ENV=production

# Start server using tsx (TypeScript runtime)
CMD ["npx", "tsx", "src/local-server.ts"]
