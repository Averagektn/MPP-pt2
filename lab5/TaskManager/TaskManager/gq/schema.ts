import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLBoolean, GraphQLInputObjectType } from 'graphql';
import jwt = require('jsonwebtoken');
import taskController from '../controllers/TaskController';
import authController from '../controllers/AuthController';
import authorize from '../middleware/AuthMiddleware';

const TaskType = new GraphQLObjectType({
    name: 'Task',
    fields: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        date: { type: GraphQLString },
        status: { type: GraphQLString },
        photo: { type: GraphQLString },
    },
});

const TaskInputType = new GraphQLInputObjectType({
    name: 'TaskInput',
    fields: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        date: { type: GraphQLString },
        status: { type: GraphQLString },
        photo: { type: GraphQLString },
    },
});

const TasksWithPageType = new GraphQLObjectType({
    name: 'TaskWithPage',
    fields: {
        tasks: { type: new GraphQLList(TaskType) },
        page: { type: GraphQLInt }
    },
});

const TokenResponseType = new GraphQLObjectType({
    name: 'TokenResponse',
    fields: {
        accessToken: { type: GraphQLString },
        refreshToken: { type: GraphQLString }
    }
});

const FileType = new GraphQLInputObjectType({
    name: 'File',
    fields: {
        name: { type: GraphQLString },
        type: { type: GraphQLString },
        data: { type: GraphQLString }
    }
});

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        tasksFilter: {
            type: TasksWithPageType,
            args: {
                limit: { type: GraphQLInt },
                startWith: { type: GraphQLInt },
                status: { type: GraphQLString },
                accessToken: { type: GraphQLString }
            },
            resolve: async (src, { limit, startWith, status, accessToken }, context) => {
                if (await authorize(accessToken, 'tasks')) {
                    const { uid } = jwt.decode(accessToken) as jwt.JwtPayload;
                    return await taskController.filterTasks(uid, status, limit, startWith);
                } else {
                    throw new Error('401');
                }
            }
        },
        getAccessToken: {
            type: TokenResponseType,
            args: {
                refreshToken: { type: GraphQLString }
            },
            resolve: async (src, { refreshToken }, context) => {
                if (await authorize(refreshToken, 'auth')) {
                    const accessToken = await authController.getAccessToken(refreshToken);
                    return { accessToken };
                } else {
                    throw new Error('401');
                }
            }
        },
        getRefreshToken: {
            type: TokenResponseType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            resolve: async (src, { email, password }, context) => {
                return await authController.getRefreshToken(email, password);
            }
        },
        getPageCount: {
            type: GraphQLInt,
            args: {
                limit: { type: GraphQLInt },
                accessToken: { type: GraphQLInt }
            },
            resolve: async (src, { limit, accessToken }, context) => {
                const { uid } = jwt.decode(accessToken) as jwt.JwtPayload;
                return await taskController.getTotalPages(limit, uid)
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createUser: {
            type: TokenResponseType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            resolve: async (src, { email, password }, context) => {
                return await authController.createUser(email, password);
            }
        },
        removeTask: {
            type: GraphQLBoolean,
            args: {
                taskId: { type: GraphQLString },
                accessToken: { type: GraphQLString }
            },
            resolve: async (src, { taskId, accessToken }, context) => {
                if (await authorize(accessToken, 'tasks')) {
                    const { uid } = jwt.decode(accessToken) as jwt.JwtPayload;
                    await taskController.deleteTask(taskId, uid);
                    return true;
                } else {
                    throw new Error('401');
                }
            }
        },
        updateTask: {
            type: TaskType,
            args: {
                task: { type: TaskInputType },
                accessToken: { type: GraphQLString }
            },
            resolve: async (src, { task, accessToken }, context) => {
                if (await authorize(accessToken, 'tasks')) {
                    const { uid } = jwt.decode(accessToken) as jwt.JwtPayload;
                    return await taskController.updateTask(task, uid);
                } else {
                    throw new Error('401');
                }
            }
        },
        createTask: {
            type: TaskType,
            args: {
                file: { type: FileType },
                task: { type: TaskInputType },
                accessToken: { type: GraphQLString }
            },
            resolve: async (src, { file, task, accessToken }, context) => {
                if (await authorize(accessToken, 'tasks')) {
                    const { uid } = jwt.decode(accessToken) as jwt.JwtPayload;

                    const buffer = Buffer.from(file.data, 'base64');
                    const newFile = {
                        originalname: file.name,
                        mimetype: file.type,
                        buffer: buffer
                    };

                    const photo = await taskController.uploadFile(newFile);
                    task.photo = photo;

                    return taskController.createTask(task, uid);
                } else {
                    throw new Error('401');
                }
            }
        }
    }
});

export const schema = new GraphQLSchema({
    query: Query,
    mutation: Mutation
})