FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=http://localhost:3001/api
ARG VITE_SOCKET_URL=http://localhost:3001

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# Production stage: nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
