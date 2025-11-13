'use strict';
(() => {
    const szkola = db.getSiblingDB("szkola");

    szkola.getCollection("students").insertMany([
        { "name": "kij", age: 12 },
        { "name": "piłka", age: 21 }]);

    szkola.getCollection("ping_data").insertOne({"status": "ok"});
})()
