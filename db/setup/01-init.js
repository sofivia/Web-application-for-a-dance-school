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

    const szkola = db.getSiblingDB("szkola");

    szkola.getCollection("students").insertMany([
        { "name": "kij", age: 12 },
        { "name": "piłka", age: 21 }]);
})()