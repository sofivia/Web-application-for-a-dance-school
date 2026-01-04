FROM docker.io/library/node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm rebuild esbuild
RUN npm run build
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist ./
COPY nginx-default.conf /etc/nginx/conf.d/default.conf
COPY ssl/ /etc/nginx/ssl/
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
