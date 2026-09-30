# Multi-stage production Dockerfile for NOVA Productivity Platform
# Base image: Node.js 20 on Alpine Linux

# --------------------------------------------------
# Stage 1: Dependencies (deps)
# --------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# --------------------------------------------------
# Stage 2: Application Builder (builder)
# --------------------------------------------------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV DATABASE_URL="postgresql://nova:nova_dev_password@postgres:5432/nova?schema=public"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate
RUN npm run build

# --------------------------------------------------
# Stage 3: Database Migrator (migrator)
# --------------------------------------------------
FROM node:20-alpine AS migrator
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npx prisma generate

CMD ["npx", "prisma", "migrate", "deploy"]

# --------------------------------------------------
# Stage 4: Production Runtime (runner)
# --------------------------------------------------
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
