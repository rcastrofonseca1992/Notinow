FROM node:lts-alpine
WORKDIR /app

# Copy package files and install ALL dependencies
COPY package*.json ./
RUN npm install

# Copy all your source code (including /server and /src)
COPY . .

# Build the frontend (this creates the /build folder)
RUN npm run build

# Expose the port your backend runs on (8787 based on your logs)
EXPOSE 8787

# Command to run your production server. 
# Note: Check your package.json. If your start script is different, change this!
CMD ["npm", "run", "start"]
