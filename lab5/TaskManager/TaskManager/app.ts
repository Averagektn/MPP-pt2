import express = require('express');
import cors = require('cors');
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import * as admin from 'firebase-admin';

const serviceAccount = require("./config/taskmanager-dedf9-firebase-adminsdk-uia8o-f0091c57e0.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://taskmanager-dedf9-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "taskmanager-dedf9.appspot.com"
});

import { schema } from './gq/schema';

const app = express();

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    credentials: true
}));

const httpServer = app.listen(1337, () => {
    console.log('HTTP server listening on port 1337');
});

const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
});

useServer({ schema }, wsServer);
