# Build stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package configuration
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose API port
EXPOSE 5000

# Start Express server
CMD ["node", "index.js"]
