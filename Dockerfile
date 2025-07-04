# Stage 1: Build
FROM node:22 AS build
WORKDIR /build

RUN corepack enable

COPY . ./

RUN npm install && npm run build

# Stage 2: Run
FROM node:22
WORKDIR /app

COPY --from=build /build/.output/ /build

#RUN chown -R node:node /app
#USER "node"

ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

RUN test -f /build/server/index.mjs || (echo "❌ Fichier index.mjs manquant !" && exit 1)

CMD ["./entrypoint.sh"]

# DEBUG 
#CMD ["tail", "-f", "/dev/null"]