# Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production (Lambda)
FROM public.ecr.aws/lambda/nodejs:22 AS production

# Set environment to production
ENV NODE_ENV=production

# Copy production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled output from build stage
COPY --from=build /usr/src/app/dist ./dist

# Lambda handler entry point
CMD ["dist/lambda.handler"]