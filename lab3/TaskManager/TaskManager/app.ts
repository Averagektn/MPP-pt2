import * as express from 'express';
import { AddressInfo } from "net";
import * as path from 'path';

import * as admin from 'firebase-admin';

const cors = require('cors')

const serviceAccount = require("./config/taskmanager-dedf9-firebase-adminsdk-uia8o-f0091c57e0.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://taskmanager-dedf9-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "taskmanager-dedf9.appspot.com"
});

import routes from './routes/index';

const debug = require('debug')('my express app');
const app = express();


app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: '*', 
    methods: '*',
    credentials: true,
    allowedHeaders: '*'
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', routes);

app.options('*', cors());

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), function () {
    debug(`Express server listening on port ${(server.address() as AddressInfo).port}`);
});