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
        origin: '*', 
        methods: ['GET', 'POST']
    }
});

type AsyncCallback = (data: WsRequest) => Promise<WsResponse>;

io.on('connection', (socket) => {
    const withAuthorization = async (endpoint: string, req: any, getWsResponseCallback: AsyncCallback): Promise<void> => {
        const data: WsRequest = JSON.parse(req);
        data.path = endpoint;

        try {
            if (await authorize(data)) {
                const response = await getWsResponseCallback(data);

                socket.emit(endpoint, JSON.stringify(response));
            } else {
                socket.emit(endpoint, JSON.stringify(new WsResponse(401, null)));
            }
        } catch (err) {
            socket.emit(endpoint, JSON.stringify(new WsResponse(400, err)));
        }
    };

    socket.on('message', async (data) => {
        await withAuthorization('message', data, async (req: WsRequest) => {
            console.log('User sent:', req);
            return new WsResponse(200, req.data);
        });
    });

    socket.on('tasks/create', async (data) => {
        await withAuthorization('tasks/create', data, async (req) => {
            const { uid } = jwt.decode(req.accessToken) as jwt.JwtPayload;
            return await taskController.createTask(req.data, uid)
        });
    });

    socket.on('tasks/file/upload', async (data) => {
        await withAuthorization('tasks/file/upload', data, async (req) => {
            return await taskController.uploadFile(req.data);
        });
    });

    socket.on('tasks/update', async (data) => {
        await withAuthorization('tasks/update', data, async (req) => {
            const { uid } = jwt.decode(req.accessToken) as jwt.JwtPayload;
            return await taskController.updateTask(req.data, uid);
        })
    });

    socket.on('tasks/delete', async (data) => {
        await withAuthorization('tasks/delete', data, async (req) => {
            const { uid } = jwt.decode(req.accessToken) as jwt.JwtPayload;
            return await taskController.deleteTask(req.data, uid);
        });
    });

    socket.on('tasks/filter', async (data) => {
        await withAuthorization('tasks/filter', data, async (req) => {
            const { uid } = jwt.decode(req.accessToken) as jwt.JwtPayload;
            return await taskController.filterTasks(uid, req.data.status, req.data.limit, req.data.startWith);
        });
    });

    socket.on('tasks', async (data) => {
        await withAuthorization('tasks', data, async (req) => {
            const { uid } = jwt.decode(req.accessToken) as jwt.JwtPayload;
            return await taskController.getTasks(uid, req.data.limit ?? 8, req.data.startWith ?? 0);
        });
    });

    socket.on('tasks/pages', async (data) => {
        await withAuthorization('tasks/pages', data, async (req) => {
            const { uid } = jwt.decode(req.accessToken) as jwt.JwtPayload;
            return await taskController.getTotalPages(req.data ?? 8, uid);
        });
    });

    socket.on('tasks/id', async (data) => {
        await withAuthorization('tasks/id', data, async (req) => {
            const { uid } = jwt.decode(req.accessToken) as jwt.JwtPayload;
            return await taskController.getTaskById(uid, req.data);
        });
    });

    socket.on('users/create', async (data) => {
        await withAuthorization('users/create', data, async (req) => {
            return await authController.createUser(req.data.email, req.data.password);
        });
    });

    socket.on('users/access', async (data) => {
        await withAuthorization('users/access', data, async (req) => {
            return await authController.getAccessToken(req.refreshToken)
        });
    });

    socket.on('users/refresh', async (data) => {
        await withAuthorization('users/refresh', data, async (req) => {
            return await authController.getRefreshToken(req.data.email, req.data.password);
        });
    });
});

const port = 1337;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
