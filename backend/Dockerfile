# Use Node.js official base image (alpine for smaller size)
FROM node:20.19.1-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching layer)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the backend port
EXPOSE 5000

# Command to run the backend
CMD ["node", "index.js"]
