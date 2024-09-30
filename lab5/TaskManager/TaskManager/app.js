"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const ws_1 = require("ws");
const ws_2 = require("graphql-ws/lib/use/ws");
const admin = require("firebase-admin");
const serviceAccount = require("./config/taskmanager-dedf9-firebase-adminsdk-uia8o-f0091c57e0.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://taskmanager-dedf9-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "taskmanager-dedf9.appspot.com"
});
const schema_1 = require("./gq/schema");
const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
const httpServer = app.listen(1337, () => {
    console.log('HTTP server listening on port 1337');
});
const wsServer = new ws_1.WebSocketServer({
    server: httpServer,
    path: '/graphql',
});
(0, ws_2.useServer)({ schema: schema_1.schema }, wsServer);
//# sourceMappingURL=app.js.map