#!/bin/bash

GREEN='\033[0;32m'
NC='\033[0m'
AUTH_TOKEN=$(gadmin config get System.AuthToken)
SERVER_PORT=$(gadmin config get Nginx.Port)
DIR="$( cd "$( dirname "$0" )" && pwd )"

gsql 'DROP JOB load_social'
gsql 'DROP GRAPH social'

gadmin start all
curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
  -X DELETE "http://localhost:$SERVER_PORT/api/system/gui-store"
gadmin stop kafkaconn kafkastrm-ll -y
gadmin start all

cd "${DIR}/tigergraph-db/gsql/schema" && gsql setup-social-schema.gsql

cd "${DIR}/tigergraph-db/gsql/loading-jobs" && gsql social-data-loading-job.gsql

