# Practice Drill — production image (single stage, Dokploy-compatible)
# Keeps full node_modules + Prisma CLI so `prisma migrate deploy` and the seed
# can run at container start (Dokploy builds the image; we run migrations at boot).

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy the app (source + built output + full node_modules so migrate/seed work).
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.mjs /app/next-env.d.ts /app/tsconfig.json ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/lib ./lib
COPY --from=build /app/fixtures ./fixtures
COPY --from=build /app/scripts ./scripts

# Entrypoint: apply migrations, seed (idempotent), then start the app.
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Storage for uploads/downloads (mount a volume here in production).
RUN mkdir -p /app/storage/starters /app/storage/submissions

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/login >/dev/null 2>&1 || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
