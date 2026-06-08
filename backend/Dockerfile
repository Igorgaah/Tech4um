FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init postgresql-client

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Final stage
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chmod +x docker-entrypoint.sh && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeapp && \
    chown -R nodeapp:nodejs /app
USER nodeapp

EXPOSE 3001
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "docker-entrypoint.sh"]
