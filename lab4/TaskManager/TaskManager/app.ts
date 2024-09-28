import * as express from 'express';
import authorize from './middleware/AuthMiddleware';
import { Server } from 'socket.io';
import taskController from './controllers/TaskController';
import authController from './controllers/AuthController';
import * as admin from 'firebase-admin';

const http = require('http');

/*const serviceAccount = require("./config/taskmanager-dedf9-firebase-adminsdk-uia8o-f0091c57e0.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://taskmanager-dedf9-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "taskmanager-dedf9.appspot.com"
});*/

const app = express();
const server = http.createServer(app);
const io = new Server(server);

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

    socket.on('createTask', async (data) => {
        //const result = await taskController.createTask(data);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('taskCreated', result);
    });

    socket.on('uploadFile', async (file) => {
        //const result = await taskController.uploadFile(file);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('fileUploaded', result);
    });

    socket.on('updateTask', async (taskId, data) => {
        //const result = await taskController.updateTask(taskId, data);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('taskUpdated', result);
    });

    socket.on('deleteTask', async (taskId) => {
        //const result = await taskController.deleteTask(taskId);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('taskDeleted', result);
    });

    socket.on('filterTasks', async (filter) => {
        //const result = await taskController.filterTasks(filter);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('tasksFiltered', result);
    });

    socket.on('getTasks', async () => {
        //const result = await taskController.getTasks();
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('tasksFetched', result);
    });

    socket.on('getTotalPages', async () => {
        //const result = await taskController.getTotalPages();
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('totalPagesFetched', result);
    });

    socket.on('getTaskById', async (taskId) => {
        //const result = await taskController.getTaskById(taskId);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('taskFetched', result);
    });

    socket.on('createUser', async (data) => {
        //const result = await authController.createUser(data);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('userCreated', result);
    });

    socket.on('getAccessToken', async (credentials) => {
        //const result = await authController.getAccessToken(credentials);
        const result = { name: 'a', description: 'b', photo: 'c' };
        socket.emit('accessTokenFetched', result);
    });

    socket.on('getRefreshToken', async (token) => {
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