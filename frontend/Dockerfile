# Stage 1: Build React assets
FROM node:20-alpine AS build

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Compile code
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy custom configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start server
CMD ["nginx", "-g", "daemon off;"]
