import * as express from 'express';
import { AddressInfo } from "net";
import * as path from 'path';
import authorize from './middleware/AuthMiddleware';

import * as admin from 'firebase-admin';

const cookieParser = require('cookie-parser');
const cors = require('cors')

const serviceAccount = require("./config/taskmanager-dedf9-firebase-adminsdk-uia8o-f0091c57e0.json");
const authApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://taskmanager-dedf9-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "taskmanager-dedf9.appspot.com"
});

import routes from './routes/index';

const debug = require('debug')('my express app');
const app = express();
const corsOptions = cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], 
    credentials: true, 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    exposedHeaders: ['Authorization']
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(corsOptions);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());
app.use(authorize);

app.use('/', routes);

app.options('*', corsOptions);

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), function () {
    debug(`Express server listening on port ${(server.address() as AddressInfo).port}`);
});