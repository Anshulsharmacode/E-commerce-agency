# Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Lambda Production
FROM public.ecr.aws/lambda/nodejs:22 AS production

COPY package*.json ${LAMBDA_TASK_ROOT}/
RUN npm ci --omit=dev

COPY --from=build /usr/src/app/dist ${LAMBDA_TASK_ROOT}/dist

CMD ["dist/src/lambda.handler"]
