"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const ws_2 = require("graphql-ws/lib/use/ws");
const schema_1 = require("./gq/schema");
const server = new ws_1.WebSocketServer({
    port: 1337,
    path: '/graphql',
});
(0, ws_2.useServer)({ schema: schema_1.schema }, server);
console.log('Listening to port 1337');
//# sourceMappingURL=app.js.map