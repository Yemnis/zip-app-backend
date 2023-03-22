# Use the official Node.js LTS (Long Term Support) image as the base image
FROM node:lts

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app will run on
EXPOSE 6060

# Start the application
CMD ["npm", "start"]
