#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

SERVER_PORT=$(gadmin config get Nginx.Port)
DATA_ROOT=$(gadmin config get System.DataRoot)
GUI_DATA=$(gadmin config get GUI.DataDirRelativePath)
ICON_PATH="$DATA_ROOT/$GUI_DATA/user_icons"
DATA_PATH="$DATA_ROOT/$GUI_DATA/loading_data"

AUTH_TOKEN=$(gadmin config get System.AuthToken)

####################################### COMMONLY USED UTILS #######################################
yell() { echo "$0: $*" >&2; }
die() { yell "$*"; exit 111; }
try () { eval "$@" || die "cannot $*"; }

# Retry a command a configurable number of times with exponential backoff.
# The retry count is given by ATTEMPTS (default 5), the initial backoff
# timeout is given by TIMEOUT in seconds (default 1).
# Successive backoffs double the timeout.
backoff() {
  local max_attempts=${ATTEMPTS-5}
  local timeout=${TIMEOUT-1}
  local attempt=1

  while ! "$@"; do
    if (( attempt < max_attempts )); then
      yell "$attempt failure(s), retrying in $timeout second(s)..."
      sleep "$timeout"
      attempt=$(( attempt + 1 ))
      timeout=$(( timeout * 2 ))
    else
      die "cannot $* after $max_attempts attempts"
    fi
  done
}

run_inside_docker() {
  docker run --rm --net host --shm-size 2g -v "$DIR/..:/home/gst" \
    -w /home/gst -u "$(id -u)":"$(id -g)" --name gst 192.168.11.23:5000/node:14 bash -c "$1"
}

####################################### TEST SPECIFIC UTILS #######################################
clean_up() {
  try sudo rm -rf "$DIR"/../reports
  try sudo rm -rf "$DIR"/../coverage
  try sudo rm -rf "$DIR"/../node_modules
  echo "Done."
}

clear_system() {
  try gsql 'DROP ALL'
  try gadmin start all
  curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
    -X DELETE "http://localhost:$SERVER_PORT/api/system/gui-store"
  try gadmin stop kafkaconn kafkastrm-ll -y
  try gadmin start all
}

# Clear data folder and move files to the folder.
setup_data() {
  try rm -rf "${DATA_PATH:?}/"*
  try mkdir -p "$DATA_PATH"
  try cp "$1/"* "$DATA_PATH/"
}

# Clear icons folder and move files to the folder.
setup_icons() {
  try rm -rf "${ICON_PATH:?}/"*
  try mkdir -p "$ICON_PATH"
  try cp "$1/"* "$ICON_PATH/"
}

run_e2e_test_suite() {
  run_inside_docker "SERVER_PORT=$SERVER_PORT \
    yarn e2e --protractor-config=e2e/protractor-ci.conf.js --dev-server-target=\"\" --suite $1"
}
