FROM node:22 AS build
WORKDIR /app

RUN corepack enable

COPY . ./

RUN npm install && \
    npm run build

FROM node:22
WORKDIR /app

COPY --from=build /app/.output/ ./

ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

CMD ["node", "/app/.output/server/index.mjs"]