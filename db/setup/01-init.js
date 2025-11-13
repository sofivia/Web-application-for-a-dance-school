'use strict';
(() => {
    const testdb = db.getSiblingDB("test");
    testdb.dropDatabase();

    const appPasswd = fs.readFileSync("/run/secrets/db_app_passwd", "utf8");
    db.createUser({
        user: "app",
        pwd: appPasswd,
        roles: [{ role: "readWrite", db: "szkola" }]
    });

    const pingPasswd = fs.readFileSync("/run/secrets/ping_passwd", "utf8");
    db.createUser({
        user: "ping",
        pwd: pingPasswd,
        roles: [{ role: "clusterMonitor", db: "admin" }]
    });
})()