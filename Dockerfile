# Step 1: Build the React app
FROM node:18 AS build

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock) into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . ./

# Build the React app using TypeScript and Vite
RUN npm run build

# Step 2: Serve the React app with a lightweight web server (e.g., serve)
FROM nginx:alpine

# Copy the built React app from the previous step to the nginx server directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the port the app will run on
EXPOSE 80

# Start nginx to serve the app
CMD ["nginx", "-g", "daemon off;"]
