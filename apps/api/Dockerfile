FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN npm install -g pnpm@12.15.0
WORKDIR /app

# Stage 1: Build & Prisma Generate
FROM base AS builder
WORKDIR /app

# Monorepo configuration files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Cài đặt toàn bộ dependencies (bao gồm devDependencies để build NestJS)
RUN pnpm install --frozen-lockfile

# Copy Prisma schema và tạo Prisma Client
COPY apps/api/prisma ./apps/api/prisma
RUN pnpm --filter api prisma generate

# Copy toàn bộ mã nguồn backend
COPY apps/api ./apps/api

# Build NestJS mã nguồn TypeScript -> JavaScript
RUN pnpm --filter api build

# Stage 2: Production Runner siêu nhẹ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Tạo người dùng non-root để đảm bảo bảo mật container
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Sao chép các tệp cần thiết từ builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

# Phân quyền cho user nestjs
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

# Tự động đồng bộ Database Migrations khi container khởi động và chạy NestJS
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
