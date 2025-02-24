FROM node:20-alpine AS builder

WORKDIR /app

# Update packages and add dependencies
RUN apk update && apk add --no-cache \
    libc6-compat \
    openssl \
    && rm -rf /var/cache/apk/*

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN pnpm prisma generate

COPY . .
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Add production dependencies
RUN apk add --no-cache \
    openssl \
    libc6-compat

# Install production dependencies
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Copy generated prisma files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["node", "server.js"]

