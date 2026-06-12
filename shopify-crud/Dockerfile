# Etapa 1: instalar dependencias
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

# Etapa 2: build de la app
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Etapa 3: imagen final (solo lo necesario para correr)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/data && \
    echo '[]' > /app/data/users.json && \
    echo '[]' > /app/data/pending.json && \
    chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
