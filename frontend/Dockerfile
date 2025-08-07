FROM node:latest AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./

# Build with empty API base URL (since nginx will proxy)
ENV VITE_API_BASE_URL=""
RUN npm run build

FROM nginx:latest

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]