# Use official Node.js 20 Alpine image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Install build dependencies for compiling native packages like bcrypt
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the backend files
COPY . .

# Expose backend port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
