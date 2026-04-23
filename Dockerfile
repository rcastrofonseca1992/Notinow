# Step 1: Build stage
FROM node:lts-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Run build and then list files to debug if it fails again
RUN npm run build && ls -la

# Step 2: Serve stage
FROM nginx:alpine
# Check if your output is 'dist' or 'build'. Change below if needed.
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
