FROM node:22-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM public.ecr.aws/lambda/nodejs:22 AS production

ENV NODE_ENV=production
ENV APP_ENV=prod
ENV S3_ENV=prod

COPY package*.json ${LAMBDA_TASK_ROOT}/
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /usr/src/app/dist ${LAMBDA_TASK_ROOT}/dist
COPY config ${LAMBDA_TASK_ROOT}/config

CMD ["dist/src/lambda.handler"]
