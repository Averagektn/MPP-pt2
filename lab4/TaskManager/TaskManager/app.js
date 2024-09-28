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
const AuthMiddleware_1 = require("./middleware/AuthMiddleware");
const socket_io_1 = require("socket.io");
const TaskController_1 = require("./controllers/TaskController");
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
const app = express();
const server = http.createServer(app);
const io = new socket_io_1.Server(server);
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('User sent:', data);
        socket.emit('message/feedback', JSON.stringify(data));
    }));
    socket.on('tasks/create', (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (yield (0, AuthMiddleware_1.default)(data)) {
            const { uid } = jwt.decode(data.accessToken);
            const res = yield TaskController_1.default.createTask(data.data, uid);
            socket.emit('tasks/created', JSON.stringify(res));
        }
        else {
            socket.emit('tasks/created', JSON.stringify(new WsResponse_1.default(400, null)));
        }
    }));
    socket.on('tasks/file/upload', (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (yield (0, AuthMiddleware_1.default)(data)) {
            const result = yield TaskController_1.default.uploadFile(data.data);
            socket.emit('tasks/file/uploaded', result);
        }
        else {
            socket.emit('tasks/file/upload', JSON.stringify(new WsResponse_1.default(400, null)));
        }
    }));
    socket.on('updateTask', (data) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await taskController.updateTask(taskId, data);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('taskUpdated', result);
    }));
    socket.on('deleteTask', (data) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await taskController.deleteTask(taskId);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('taskDeleted', result);
    }));
    socket.on('filterTasks', (data) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await taskController.filterTasks(filter);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('tasksFiltered', result);
    }));
    socket.on('getTasks', (data) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await taskController.getTasks();
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('tasksFetched', result);
    }));
    socket.on('getTotalPages', (data) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await taskController.getTotalPages();
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('totalPagesFetched', result);
    }));
    socket.on('getTaskById', (data) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await taskController.getTaskById(taskId);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('taskFetched', result);
    }));
    socket.on('createUser', (data) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await authController.createUser(data);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('userCreated', result);
    }));
    socket.on('getAccessToken', (data) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await authController.getAccessToken(credentials);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('accessTokenFetched', result);
    }));
    socket.on('getRefreshToken', (data) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await authController.getRefreshToken(token);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('refreshTokenFetched', result);
    }));
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
const PORT = 1337;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=app.js.map