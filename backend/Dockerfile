FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies separately for layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
