# Multi-stage Dockerfile for HiddenGems
# Based on node:20-alpine

# 1. Dependencies Stage
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# 2. Builder Stage (also used as target for seed service)
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p /app/public

# Build Next.js with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Development Stage (used in docker-compose.dev.yml)
FROM node:20-alpine AS dev
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN mkdir -p /app/uploads
EXPOSE 3000
CMD ["npm", "run", "dev"]

# 4. Production Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV UPLOAD_DIR=/app/uploads

RUN apk add --no-cache curl

# Create non-root group and user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

# Copy public static files and standalone bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Docker Healthcheck hitting the /api/health endpoint
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
