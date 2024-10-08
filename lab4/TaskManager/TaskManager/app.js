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
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});
io.setMaxListeners(Infinity);
io.on('connection', (socket) => {
    const withAuthorizationSingle = (endpoint, req, getWsResponseCallback, responseEndpoint) => __awaiter(void 0, void 0, void 0, function* () {
        const data = JSON.parse(req);
        data.path = endpoint;
        try {
            if (yield (0, AuthMiddleware_1.default)(data)) {
                const response = yield getWsResponseCallback(data);
                socket.emit(responseEndpoint, JSON.stringify(response));
            }
            else {
                socket.emit(responseEndpoint, JSON.stringify(new WsResponse_1.default(401, null)));
            }
        }
        catch (err) {
            socket.emit(responseEndpoint, JSON.stringify(new WsResponse_1.default(400, err)));
        }
    });
    const withAuthorizationAll = (endpoint, req, getWsResponseCallback, responseEndpoint) => __awaiter(void 0, void 0, void 0, function* () {
        const data = JSON.parse(req);
        data.path = endpoint;
        try {
            if (yield (0, AuthMiddleware_1.default)(data)) {
                let token = data.accessToken;
                if (!token) {
                    token = data.refreshToken;
                }
                const { uid } = jwt.decode(token);
                const response = yield getWsResponseCallback(data);
                const isMember = socket.rooms.has(uid);
                if (!isMember) {
                    socket.join(uid);
                }
                io.to(uid).emit(responseEndpoint, JSON.stringify(response));
            }
            else {
                socket.emit(responseEndpoint, JSON.stringify(new WsResponse_1.default(401, 'failed to authorize')));
            }
        }
        catch (err) {
            socket.emit(responseEndpoint, JSON.stringify(new WsResponse_1.default(400, err)));
        }
    });
    socket.on('message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorizationAll('message', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            console.log('User sent:', req);
            return new WsResponse_1.default(200, req.data);
        }), 'messaged');
    }));
    socket.on('tasks/create', (data) => __awaiter(void 0, void 0, void 0, function* () {
        data.path = 'tasks/create';
        const { uid } = jwt.decode(data.accessToken);
        try {
            if (yield (0, AuthMiddleware_1.default)(data)) {
                const buffer = Buffer.from(data.file.buffer);
                const file = {
                    originalname: data.file.name,
                    mimetype: data.file.type,
                    buffer: buffer,
                };
                const photo = (yield TaskController_1.default.uploadFile(file)).data;
                const task = data.task;
                task.photo = photo;
                yield TaskController_1.default.createTask(task, uid);
                const response = yield TaskController_1.default.filterTasks(uid, 'None', 8, 0);
                const isMember = socket.rooms.has(uid);
                if (!isMember) {
                    socket.join(uid);
                }
                io.to(uid).emit('tasks/filtered', JSON.stringify(response));
            }
            else {
                socket.emit('tasks/filtered', JSON.stringify(new WsResponse_1.default(401, null)));
            }
        }
        catch (err) {
            socket.emit('tasks/filtered', JSON.stringify(new WsResponse_1.default(400, err)));
        }
    }));
    socket.on('tasks/update', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorizationAll('tasks/filter', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            const { uid } = jwt.decode(req.accessToken);
            yield TaskController_1.default.updateTask(req.data.task, uid);
            return yield TaskController_1.default.filterTasks(uid, req.data.status, req.data.limit, req.data.startWith);
        }), 'tasks/filtered');
    }));
    socket.on('tasks/delete', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorizationAll('tasks/delete', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            const { uid } = jwt.decode(req.accessToken);
            yield TaskController_1.default.deleteTask(req.data.taskId, uid);
            return yield TaskController_1.default.filterTasks(uid, req.data.status, req.data.limit, req.data.startWith);
        }), 'tasks/filtered');
    }));
    socket.on('tasks/filter', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorizationAll('tasks/filter', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            const { uid } = jwt.decode(req.accessToken);
            return yield TaskController_1.default.filterTasks(uid, req.data.status, req.data.limit, req.data.startWith);
        }), 'tasks/filtered');
    }));
    socket.on('tasks', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorizationAll('tasks', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const { uid } = jwt.decode(req.accessToken);
            return yield TaskController_1.default.getTasks(uid, (_a = req.data.limit) !== null && _a !== void 0 ? _a : 8, (_b = req.data.startWith) !== null && _b !== void 0 ? _b : 0);
        }), 'tasked');
    }));
    socket.on('tasks/pages', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorizationAll('tasks/pages', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            var _c;
            const { uid } = jwt.decode(req.accessToken);
            return yield TaskController_1.default.getTotalPages((_c = req.data.limit) !== null && _c !== void 0 ? _c : 8, uid);
        }), 'tasks/paged');
    }));
    socket.on('tasks/next-page', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorizationAll('tasks/next-page', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            var _d;
            const { uid } = jwt.decode(req.accessToken);
            const currentPage = req.data.currentPage;
            const totalPages = yield TaskController_1.default.getTotalPages((_d = req.data.limit) !== null && _d !== void 0 ? _d : 8, uid);
            const pages = currentPage + 1 >= totalPages ? currentPage : currentPage + 1;
            return new WsResponse_1.default(200, pages);
        }), 'tasks/paged');
    }));
    socket.on('tasks/id', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorizationAll('tasks/id', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            const { uid } = jwt.decode(req.accessToken);
            return yield TaskController_1.default.getTaskById(uid, req.data);
        }), 'tasks/id');
    }));
    socket.on('users/create', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorizationSingle('users/create', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            return yield AuthController_1.default.createUser(req.data.email, req.data.password);
        }), 'users/created');
    }));
    socket.on('users/access', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorizationSingle('users/access', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            return yield AuthController_1.default.getAccessToken(req.refreshToken);
        }), 'users/accessed');
    }));
    socket.on('users/refresh', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorizationSingle('users/refresh', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            return yield AuthController_1.default.getRefreshToken(req.data.email, req.data.password);
        }), 'users/refreshed');
    }));
    socket.on('users/logout', (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield withAuthorizationAll('users/logout', data, (req) => __awaiter(void 0, void 0, void 0, function* () {
            const { uid } = jwt.decode(req.refreshToken);
            //socket.leave(uid);
            return yield AuthController_1.default.logout(uid);
        }), 'users/logouted');
    }));
});
const port = 1337;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=app.js.map