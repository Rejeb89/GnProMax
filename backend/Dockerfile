FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src
COPY prisma ./prisma
COPY scripts ./scripts

# Build application
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Install dumb-init utility (for proper signal handling)
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./.prisma
COPY --from=builder /app/scripts ./scripts

# Generate Prisma client
RUN npm run prisma:generate

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application (run seed script then start)
CMD ["sh", "-c", "if [ \"${RUN_SEED_ON_STARTUP:-false}\" = \"true\" ]; then node scripts/create-admin.js || true; fi; npm run start:prod"]
