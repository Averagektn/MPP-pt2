"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const AuthMiddleware_1 = require("./middleware/AuthMiddleware");
const admin = require("firebase-admin");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const serviceAccount = require("./config/taskmanager-dedf9-firebase-adminsdk-uia8o-f0091c57e0.json");
const authApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://taskmanager-dedf9-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "taskmanager-dedf9.appspot.com"
});
const index_1 = require("./routes/index");
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
app.use(cookieParser());
app.use(express.json());
app.use(AuthMiddleware_1.default);
app.use('/', index_1.default);
app.options('*', cors());
app.set('port', process.env.PORT || 3000);
const server = app.listen(app.get('port'), function () {
    debug(`Express server listening on port ${server.address().port}`);
});
//# sourceMappingURL=app.js.map