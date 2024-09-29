"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const socket_io_1 = require("socket.io");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const WsResponse_1 = require("./model/WsResponse");
const http = require('http');
const serviceAccount = require("./config/taskmanager-dedf9-firebase-adminsdk-uia8o-f0091c57e0.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://taskmanager-dedf9-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "taskmanager-dedf9.appspot.com"
});
const AuthMiddleware_1 = require("./middleware/AuthMiddleware");
const TaskController_1 = require("./controllers/TaskController");
const AuthController_1 = require("./controllers/AuthController");
const app = express();
const server = http.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
io.on('connection', (socket) => {
    const withAuthorization = (endpoint, req, getWsResponseCallback) => __awaiter(void 0, void 0, void 0, function* () {
        const data = JSON.parse(req);
        data.path = endpoint;
        try {
            if (yield (0, AuthMiddleware_1.default)(data)) {
                const response = yield getWsResponseCallback(data);
                socket.emit(endpoint, JSON.stringify(response));
            }
            else {
                socket.emit(endpoint, JSON.stringify(new WsResponse_1.default(401, null)));
            }
        }
        catch (err) {
            socket.emit(endpoint, JSON.stringify(new WsResponse_1.default(400, err)));
        }
    });
    socket.on('message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorization('message', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            console.log('User sent:', req);
            return new WsResponse_1.default(200, req.data);
        }));
    }));
    socket.on('tasks/create', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorization('tasks/create', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            const { uid } = jwt.decode(req.accessToken);
            return yield TaskController_1.default.createTask(req.data, uid);
        }));
    }));
    socket.on('tasks/file/upload', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorization('tasks/file/upload', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            return yield TaskController_1.default.uploadFile(req.data);
        }));
    }));
    socket.on('tasks/update', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorization('tasks/update', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            const { uid } = jwt.decode(req.accessToken);
            return yield TaskController_1.default.updateTask(req.data, uid);
        }));
    }));
    socket.on('tasks/delete', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorization('tasks/delete', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            const { uid } = jwt.decode(req.accessToken);
            return yield TaskController_1.default.deleteTask(req.data, uid);
        }));
    }));
    socket.on('tasks/filter', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorization('tasks/filter', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            const { uid } = jwt.decode(req.accessToken);
            return yield TaskController_1.default.filterTasks(uid, req.data.status, req.data.limit, req.data.startWith);
        }));
    }));
    socket.on('tasks', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorization('tasks', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const { uid } = jwt.decode(req.accessToken);
            return yield TaskController_1.default.getTasks(uid, (_a = req.data.limit) !== null && _a !== void 0 ? _a : 8, (_b = req.data.startWith) !== null && _b !== void 0 ? _b : 0);
        }));
    }));
    socket.on('tasks/pages', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorization('tasks/pages', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            var _c;
            const { uid } = jwt.decode(req.accessToken);
            return yield TaskController_1.default.getTotalPages((_c = req.data) !== null && _c !== void 0 ? _c : 8, uid);
        }));
    }));
    socket.on('tasks/id', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorization('tasks/id', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            const { uid } = jwt.decode(req.accessToken);
            return yield TaskController_1.default.getTaskById(uid, req.data);
        }));
    }));
    socket.on('users/create', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorization('users/create', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            return yield AuthController_1.default.createUser(req.data.email, req.data.password);
        }));
    }));
    socket.on('users/access', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorization('users/access', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            return yield AuthController_1.default.getAccessToken(req.refreshToken);
        }));
    }));
    socket.on('users/refresh', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorization('users/refresh', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            return yield AuthController_1.default.getRefreshToken(req.data.email, req.data.password);
        }));
    }));
});
const port = 1337;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=app.js.map