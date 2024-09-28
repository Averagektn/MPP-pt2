import * as express from 'express';
import authorize from './middleware/AuthMiddleware';
import { Server } from 'socket.io';
import taskController from './controllers/TaskController';
import authController from './controllers/AuthController';
import * as admin from 'firebase-admin';
import jwt = require('jsonwebtoken');
import WsRequest from './model/WsRequest';
import WsResponse from './model/WsResponse';

const http = require('http');
const serviceAccount = require("./config/taskmanager-dedf9-firebase-adminsdk-uia8o-f0091c57e0.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://taskmanager-dedf9-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "taskmanager-dedf9.appspot.com"
});

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('message', async (data: WsRequest) => {
        console.log('User sent:', data);
        socket.emit('message/feedback', JSON.stringify(data));
    });

    socket.on('tasks/create', async (data: WsRequest) => {
        if (await authorize(data)) {
            const { uid } = jwt.decode(data.accessToken) as jwt.JwtPayload;
            const res = await taskController.createTask(data.data, uid)

            socket.emit('tasks/created', JSON.stringify(res));
        } else {
            socket.emit('tasks/created', JSON.stringify(new WsResponse(400, null)));
        }
    });

    socket.on('tasks/file/upload', async (data: WsRequest) => {
        if (await authorize(data)) {
            const result = await taskController.uploadFile(data.data);

            socket.emit('tasks/file/uploaded', result);
        } else {
            socket.emit('tasks/file/upload', JSON.stringify(new WsResponse(400, null)));
        }
    });

    socket.on('updateTask', async (data: WsRequest) => {
        //const result = await taskController.updateTask(taskId, data);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('taskUpdated', result);
    });

    socket.on('deleteTask', async (data: WsRequest) => {
        //const result = await taskController.deleteTask(taskId);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('taskDeleted', result);
    });

    socket.on('filterTasks', async (data: WsRequest) => {
        //const result = await taskController.filterTasks(filter);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('tasksFiltered', result);
    });

    socket.on('getTasks', async (data: WsRequest) => {
        //const result = await taskController.getTasks();
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('tasksFetched', result);
    });

    socket.on('getTotalPages', async (data: WsRequest) => {
        //const result = await taskController.getTotalPages();
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('totalPagesFetched', result);
    });

    socket.on('getTaskById', async (data: WsRequest) => {
        //const result = await taskController.getTaskById(taskId);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('taskFetched', result);
    });

    socket.on('createUser', async (data: WsRequest) => {
        //const result = await authController.createUser(data);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('userCreated', result);
    });

    socket.on('getAccessToken', async (data: WsRequest) => {
        //const result = await authController.getAccessToken(credentials);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('accessTokenFetched', result);
    });

    socket.on('getRefreshToken', async (data: WsRequest) => {
        //const result = await authController.getRefreshToken(token);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('refreshTokenFetched', result);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 1337;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
