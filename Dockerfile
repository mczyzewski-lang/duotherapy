# DUO® – obraz produkcyjny (Railway i inne platformy z Dockerem).
# Chromium jest potrzebny do lokalnego generowania PDF „Podsumowania sesji”.
FROM node:22-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1 PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS run
RUN apt-get update \
  && apt-get install -y --no-install-recommends chromium ca-certificates \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production CHROMIUM_PATH=/usr/bin/chromium
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 3000
# npm start: kontrola konfiguracji, migracje i seed (idempotentne), potem serwer.
CMD ["npm", "start"]
