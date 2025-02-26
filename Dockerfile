# Etapa de construcción
FROM node:22.13.1 AS builder

# Directorio de trabajo
WORKDIR /app

# Instalar pnpm globalmente usando npm
RUN npm install -g pnpm

# Instalar Prisma globalmente usando npm
RUN npm install -g prisma

# Copiar package.json y el lockfile de pnpm (si existe)
COPY package.json pnpm-lock.yaml* ./

# Instalar las dependencias del proyecto con pnpm
RUN pnpm install

# Copiar el resto del código fuente
COPY . .

# Generar el cliente de Prisma (si aún no se ha generado)
RUN pnpm exec prisma generate

# Construir la aplicación Next.js
RUN pnpm run build

# Etapa de producción
FROM node:22.13.1 AS runner

WORKDIR /app

# Configurar entorno de producción
ENV NODE_ENV=production

# Copiar archivos construidos desde la etapa builder
COPY --from=builder /app ./

# Exponer el puerto (ajusta si es necesario)
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["pnpm", "start"]
