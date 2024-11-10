#!/usr/bin/env bash

USERNAME=${1}
AUTH_TOKEN=${2-$(cat .auth-token)}

# TODO: This only handles users which were script-created
USER_ID=$(cat "data/${USERNAME}.json" | jq -r '.id')

curl "https://pb-api.rootlink.de/users/${USER_ID}" \
    -X 'DELETE' \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -H 'Origin: http://localhost:5173' \
    -H 'Referer: http://localhost:5173/' \
   --compressed