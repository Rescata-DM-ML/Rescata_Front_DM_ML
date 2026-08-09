# 1. Etapa de Construcción (Build)
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# 2. Etapa de Producción (Runner con Nginx)
FROM nginx:1.25-alpine AS runner

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Configuración personalizada de Nginx para SPA (Single Page Application routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
