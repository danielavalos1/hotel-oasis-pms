# Etapa de construcción
FROM node:22.13.1 AS builder

# Definir el directorio de trabajo
WORKDIR /app

# Instalar pnpm globalmente (se utiliza npm que viene con la imagen base)
RUN npm install -g pnpm

# Instalar dependencias globales necesarias, por ejemplo Prisma
RUN pnpm add -g prisma

# Copiar el package.json y el lockfile (si existe)
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias del proyecto con pnpm
RUN pnpm install

# Copiar el resto del código fuente
COPY . .

# Generar el cliente de Prisma (opcional si aún no se ha generado)
RUN pnpm exec prisma generate

# Construir la aplicación Next.js
RUN pnpm run build

# Etapa de producción
FROM node:22.13.1 AS runner

WORKDIR /app

# Establecer variable de entorno para producción
ENV NODE_ENV=production

# Copiar archivos construidos desde la etapa builder
COPY --from=builder /app ./

# Exponer el puerto (ajústalo si tu aplicación usa otro)
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["pnpm", "start"]
