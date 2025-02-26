# Etapa de construcción
FROM node:22.13.1-alpine AS builder
WORKDIR /app

# Forzamos la compilación de módulos nativos desde el código fuente
ENV npm_config_build_from_source=true

# Instalar dependencias de compilación y librerías adicionales (libc6-compat ayuda en Alpine)
RUN apk update && apk add --no-cache python3 build-base libc6-compat

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar archivos esenciales y el esquema de Prisma
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Instalar dependencias (se compilan los módulos nativos)
RUN pnpm install --frozen-lockfile

# Reconstruir explícitamente bcrypt para asegurarnos de que se compile correctamente
RUN pnpm rebuild bcrypt

# Copiar el resto del código fuente
COPY . .

# Ejecutar el build (prisma generate && next build)
RUN pnpm run build

# Eliminar las dependencias de desarrollo (dejando solo las de producción)
RUN pnpm prune --prod

# Etapa de ejecución
FROM node:22.13.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Instalar dependencias del sistema necesarias en producción
RUN apk update && apk add --no-cache openssl libc6-compat

# Copiar el build standalone generado por Next.js y otros archivos necesarios
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Copiar archivos de configuración y la carpeta node_modules ya compilada
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "server.js"]
