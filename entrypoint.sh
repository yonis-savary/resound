#!/bin/sh
if [ "$ENVIRONMENT" = "prod" ];
then
    node /build/server/index.mjs
else
    npm run dev -- --port 80
fi