# Stage 1: Build
FROM node:22-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production

# Set working directory
WORKDIR /usr/src/app

# Set environment to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy only the compiled output from the build stage
COPY --from=build /usr/src/app/dist ./dist

# Expose the port the app runs on (default NestJS port 3000)
EXPOSE 3000



# Run seed, then start the application
CMD ["node", "dist/main.js"]
