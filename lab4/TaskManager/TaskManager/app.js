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
const http = require('http');
/*const serviceAccount = require("./config/taskmanager-dedf9-firebase-adminsdk-uia8o-f0091c57e0.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://taskmanager-dedf9-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "taskmanager-dedf9.appspot.com"
});*/
const app = express();
const server = http.createServer(app);
const io = new socket_io_1.Server(server);
/*io.use((socket, next) => {
    const token = socket.handshake.query.token;

    //authorize();

    if (token === 'valid_token') {
        next();
    } else {
        const err: any = new Error('Unauthorized');
        err.data = { content: "Please retry later" };
        next(err);
    }
});*/
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('A user sent:', data);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('taskCreated', JSON.stringify(result));
    }));
    socket.on('createTask', (data) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await taskController.createTask(data);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('createTask', JSON.stringify(result));
    }));
    socket.on('uploadFile', (file) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await taskController.uploadFile(file);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('fileUploaded', result);
    }));
    socket.on('updateTask', (taskId, data) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await taskController.updateTask(taskId, data);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('taskUpdated', result);
    }));
    socket.on('deleteTask', (taskId) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await taskController.deleteTask(taskId);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('taskDeleted', result);
    }));
    socket.on('filterTasks', (filter) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await taskController.filterTasks(filter);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('tasksFiltered', result);
    }));
    socket.on('getTasks', () => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await taskController.getTasks();
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('tasksFetched', result);
    }));
    socket.on('getTotalPages', () => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await taskController.getTotalPages();
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('totalPagesFetched', result);
    }));
    socket.on('getTaskById', (taskId) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await taskController.getTaskById(taskId);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('taskFetched', result);
    }));
    socket.on('createUser', (data) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await authController.createUser(data);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('userCreated', result);
    }));
    socket.on('getAccessToken', (credentials) => __awaiter(void 0, void 0, void 0, function* () {
        //const result = await authController.getAccessToken(credentials);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('accessTokenFetched', result);
    }));
    socket.on('getRefreshToken', (token) => __awaiter(void 0, void 0, void 0, function* () {
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