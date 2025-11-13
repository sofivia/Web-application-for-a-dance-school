#!/bin/sh

PING_PASSWD=`cat /run/secrets/ping_passwd`
CMD="db.runCommand('ping').ok"
OPTS="--tls --tlsAllowInvalidCertificates --quiet"
test `mongosh "mongodb://ping:${PING_PASSWD}@localhost/admin" $OPTS --eval "$CMD"` \
    -eq 1
