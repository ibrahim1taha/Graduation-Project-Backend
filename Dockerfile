# Specify the base image with Node.js version 20.17.0
FROM node:20.17-alpine

# Create a working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the API will run on
EXPOSE 8080

# Define the command to start the API
CMD [ "npm", "start" ]
