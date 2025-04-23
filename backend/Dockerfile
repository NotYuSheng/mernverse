# Use Node.js official base image
FROM node:20.19.1

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching layer)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the backend port
EXPOSE 5000

# Command to run the backend
CMD ["npm", "start"]
