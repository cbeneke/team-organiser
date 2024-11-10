#!/usr/bin/env bash

USERNAME=${1}
PASSWORD=${2}
DISPLAY_NAME=${3}
IS_ADMIN=${4-false}
AUTH_TOKEN=${5-$(cat .auth-token)}

mkdir -p data/

curl 'https://pb-api.rootlink.de/auth/register' \
    -X 'POST' \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -H 'Origin: http://localhost:5173' \
    -H 'Referer: http://localhost:5173/' \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    --data-raw "username=${USERNAME}&password=${PASSWORD}" \
    --compressed \
    -o "data/${USERNAME}.json"

USER_ID=$(cat "data/${USERNAME}.json" | jq -r '.id')

curl "https://pb-api.rootlink.de/users/${USER_ID}" \
    -X 'PUT' \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -H 'Origin: http://localhost:5173' \
    -H 'Referer: http://localhost:5173/' \
    -H 'Content-Type: application/json' \
    --data-raw "{\"display_name\": \"${DISPLAY_NAME}\",\"is_admin\": ${IS_ADMIN}}" \
   --compressed \
   -o "data/${USERNAME}.json"