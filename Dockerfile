FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.ts ./
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Chromium para generar los PDF de homologación (src/lib/pdf) — --with-deps
# instala también las librerías de sistema que necesita en Debian bookworm.
RUN npx playwright install --with-deps chromium

# Volumen persistente donde se guardan los PDF ya generados (GeneratedDocument.filePath).
RUN mkdir -p /data/documents
ENV DOCUMENTS_DIR=/data/documents

EXPOSE 3000
CMD ["./start.sh"]
