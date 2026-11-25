# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────
# LUKWOLFLY — imagem de produção (Next.js standalone + SQLite)
# ─────────────────────────────────────────────────────────────
ARG NODE_VERSION=22

# 1. dependências
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# 2. build
FROM node:${NODE_VERSION}-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--disable-warning=ExperimentalWarning \
    DATA_DIR=/tmp/build-data
ARG SITE_URL=http://localhost:3000
ENV SITE_URL=${SITE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. runtime mínimo
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--disable-warning=ExperimentalWarning \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/data

RUN groupadd --system --gid 1001 luk && useradd --system --uid 1001 --gid luk luk \
  && mkdir -p /data/uploads && chown -R luk:luk /data

COPY --from=builder --chown=luk:luk /app/public ./public
COPY --from=builder --chown=luk:luk /app/.next/standalone ./
COPY --from=builder --chown=luk:luk /app/.next/static ./.next/static

USER luk
VOLUME ["/data"]
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
