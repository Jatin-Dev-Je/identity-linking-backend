# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Install OpenSSL 1.1 compatibility
RUN apk add --no-cache openssl1.1-compat

COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client and build the application
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app

# Install OpenSSL 1.1 compatibility
RUN apk add --no-cache openssl1.1-compat

COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production

# Copy built code and necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/healthcheck.js ./healthcheck.js

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["npm", "start"]
