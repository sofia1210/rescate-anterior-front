# Stage 1: build with Node
FROM node:18-alpine AS builder
WORKDIR /app

# Install deps
COPY package*.json ./
COPY yarn.lock ./
RUN npm ci --production=false

# Copy sources and build. VITE_* passed as build args
COPY . .
ARG VITE_API_URL
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_BACK
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY} \
    VITE_BACK=${VITE_BACK}

RUN npm run build

# Stage 2: serve with nginx
FROM nginx:stable-alpine AS runner
# Replace default nginx config with our SPA config
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]