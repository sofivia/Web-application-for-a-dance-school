#!/bin/sh

PING_PASSWD=`cat /run/secrets/ping_passwd`
CMD="db.runCommand('ping').ok"
test `mongosh "mongodb://ping:${PING_PASSWD}@localhost/admin" --eval "$CMD" --quiet` \
    -eq 1
