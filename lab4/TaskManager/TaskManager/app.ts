import * as express from 'express';
import { Server } from 'socket.io';
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

import authorize from './middleware/AuthMiddleware';
import taskController from './controllers/TaskController';
import authController from './controllers/AuthController';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', 
        methods: ['GET', 'POST']
    }
});

type AsyncCallback = (data: WsRequest) => Promise<WsResponse>;
io.setMaxListeners(Infinity);
io.on('connection', (socket) => {
    const withAuthorizationSingle = async (endpoint: string, req: any, getWsResponseCallback: AsyncCallback, responseEndpoint: string): Promise<void> => {
        const data: WsRequest = JSON.parse(req);
        data.path = endpoint;

        try {
            if (await authorize(data)) {
                const response = await getWsResponseCallback(data);

                socket.emit(responseEndpoint, JSON.stringify(response));
            } else {
                socket.emit(responseEndpoint, JSON.stringify(new WsResponse(401, null)));
            }
        } catch (err) {
            socket.emit(responseEndpoint, JSON.stringify(new WsResponse(400, err)));
        }
    };

    const withAuthorizationAll = async (endpoint: string, req: any, getWsResponseCallback: AsyncCallback, responseEndpoint: string): Promise<void> => {
        const data: WsRequest = JSON.parse(req);
        data.path = endpoint;
        try {
            if (await authorize(data)) {
                let token = data.accessToken;
                if (!token) {
                    token = data.refreshToken;
                }
                const { uid } = jwt.decode(token) as jwt.JwtPayload;
                const response = await getWsResponseCallback(data);
                const isMember = socket.rooms.has(uid);
                if (!isMember) {
                    socket.join(uid);
                }
                io.to(uid).emit(responseEndpoint, JSON.stringify(response));
            } else {
                socket.emit(responseEndpoint, JSON.stringify(new WsResponse(401, 'failed to authorize')));
            }
        } catch (err) {
            socket.emit(responseEndpoint, JSON.stringify(new WsResponse(400, err)));
        }
    };

    socket.on('message', async (data) => {
        await withAuthorizationAll('message', data, async (req: WsRequest) => {
            console.log('User sent:', req);
            return new WsResponse(200, req.data);
        }, 'messaged');
    });

    socket.on('tasks/create', async (data) => {
        data.path = 'tasks/create';
        const { uid } = jwt.decode(data.accessToken) as jwt.JwtPayload;

        try {
            if (await authorize(data)) {
                const buffer = Buffer.from(data.file.buffer);
                const file = {
                    originalname: data.file.name,
                    mimetype: data.file.type,
                    buffer: buffer,
                };
                const photo = (await taskController.uploadFile(file)).data;
                const task = data.task;
                task.photo = photo;

                await taskController.createTask(task, uid);
                const response = await taskController.filterTasks(uid, 'None', 8, 0);

                const isMember = socket.rooms.has(uid);
                if (!isMember) {
                    socket.join(uid);
                }
                io.to(uid).emit('tasks/filtered', JSON.stringify(response));
            } else {
                socket.emit('tasks/filtered', JSON.stringify(new WsResponse(401, null)));
            }
        } catch (err) {
            socket.emit('tasks/filtered', JSON.stringify(new WsResponse(400, err)));
        }
    });

    socket.on('tasks/update', async (data) => {
        
        await withAuthorizationAll('tasks/filter', data, async (req) => {
            const { uid } = jwt.decode(req.accessToken) as jwt.JwtPayload;
            await taskController.updateTask(req.data.task, uid);

            return await taskController.filterTasks(uid, req.data.status, req.data.limit, req.data.startWith);
        }, 'tasks/filtered')
    });

    socket.on('tasks/delete', async (data) => {
        await withAuthorizationAll('tasks/delete', data, async (req) => {
            const { uid } = jwt.decode(req.accessToken) as jwt.JwtPayload;
            await taskController.deleteTask(req.data.taskId, uid);

            return await taskController.filterTasks(uid, req.data.status, req.data.limit, req.data.startWith);
        }, 'tasks/filtered');
    });

    socket.on('tasks/filter', async (data) => {
        await withAuthorizationAll('tasks/filter', data, async (req) => {
            const { uid } = jwt.decode(req.accessToken) as jwt.JwtPayload;
            return await taskController.filterTasks(uid, req.data.status, req.data.limit, req.data.startWith);
        }, 'tasks/filtered');
    });

    socket.on('tasks', async (data) => {
        await withAuthorizationAll('tasks', data, async (req) => {
            const { uid } = jwt.decode(req.accessToken) as jwt.JwtPayload;
            return await taskController.getTasks(uid, req.data.limit ?? 8, req.data.startWith ?? 0);
        }, 'tasked');
    });

    socket.on('tasks/pages', async (data) => {
        await withAuthorizationAll('tasks/pages', data, async (req) => {
            const { uid } = jwt.decode(req.accessToken) as jwt.JwtPayload;
            return await taskController.getTotalPages(req.data.limit ?? 8, uid);
        }, 'tasks/paged');
    });

    socket.on('tasks/next-page', async (data) => {
        await withAuthorizationAll('tasks/next-page', data, async (req) => {
            const { uid } = jwt.decode(req.accessToken) as jwt.JwtPayload;
            const currentPage = req.data.currentPage;
            const totalPages = await taskController.getTotalPages(req.data.limit ?? 8, uid);
            const pages = currentPage + 1 >= totalPages ? currentPage : currentPage + 1;
            return new WsResponse(200, pages);
        }, 'tasks/paged');
    });

    socket.on('tasks/id', async (data) => {
        await withAuthorizationAll('tasks/id', data, async (req) => {
            const { uid } = jwt.decode(req.accessToken) as jwt.JwtPayload;
            return await taskController.getTaskById(uid, req.data);
        }, 'tasks/id');
    });

    socket.on('users/create', async (data) => {
        await withAuthorizationSingle('users/create', data, async (req) => {
            return await authController.createUser(req.data.email, req.data.password);
        }, 'users/created');
    });

    socket.on('users/access', async (data) => {
        await withAuthorizationSingle('users/access', data, async (req) => {
            return await authController.getAccessToken(req.refreshToken);
        }, 'users/accessed');
    });

    socket.on('users/refresh', async (data) => {
        await withAuthorizationSingle('users/refresh', data, async (req) => {
            return await authController.getRefreshToken(req.data.email, req.data.password);
        }, 'users/refreshed');
    });

    socket.on('users/logout', async (data) => {
        await withAuthorizationAll('users/logout', data, async (req) => {
            const { uid } = jwt.decode(req.refreshToken) as jwt.JwtPayload;
            //socket.leave(uid);
            return await authController.logout(uid);
        }, 'users/logouted');
    });
});

const port = 1337;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
