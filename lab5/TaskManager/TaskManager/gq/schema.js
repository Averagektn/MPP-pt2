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
exports.schema = void 0;
const graphql_1 = require("graphql");
const jwt = require("jsonwebtoken");
const TaskController_1 = require("../controllers/TaskController");
const AuthController_1 = require("../controllers/AuthController");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const TaskType = new graphql_1.GraphQLObjectType({
    name: 'Task',
    fields: {
        id: { type: graphql_1.GraphQLString },
        name: { type: graphql_1.GraphQLString },
        description: { type: graphql_1.GraphQLString },
        date: { type: graphql_1.GraphQLString },
        status: { type: graphql_1.GraphQLString },
        photo: { type: graphql_1.GraphQLString },
    },
});
const TaskInputType = new graphql_1.GraphQLInputObjectType({
    name: 'TaskInput',
    fields: {
        id: { type: graphql_1.GraphQLString },
        name: { type: graphql_1.GraphQLString },
        description: { type: graphql_1.GraphQLString },
        date: { type: graphql_1.GraphQLString },
        status: { type: graphql_1.GraphQLString },
        photo: { type: graphql_1.GraphQLString },
    },
});
const TasksWithPageType = new graphql_1.GraphQLObjectType({
    name: 'TaskWithPage',
    fields: {
        tasks: { type: new graphql_1.GraphQLList(TaskType) },
        page: { type: graphql_1.GraphQLInt }
    },
});
const TokenResponseType = new graphql_1.GraphQLObjectType({
    name: 'TokenResponse',
    fields: {
        accessToken: { type: graphql_1.GraphQLString },
        refreshToken: { type: graphql_1.GraphQLString }
    }
});
const FileType = new graphql_1.GraphQLInputObjectType({
    name: 'File',
    fields: {
        name: { type: graphql_1.GraphQLString },
        type: { type: graphql_1.GraphQLString },
        data: { type: graphql_1.GraphQLString }
    }
});
const Query = new graphql_1.GraphQLObjectType({
    name: 'Query',
    fields: {
        tasksFilter: {
            type: TasksWithPageType,
            args: {
                limit: { type: graphql_1.GraphQLInt },
                startWith: { type: graphql_1.GraphQLInt },
                status: { type: graphql_1.GraphQLString },
                accessToken: { type: graphql_1.GraphQLString }
            },
            resolve: (src, { limit, startWith, status, accessToken }, context) => __awaiter(void 0, void 0, void 0, function* () {
                if (yield (0, AuthMiddleware_1.default)(accessToken, 'tasks')) {
                    const { uid } = jwt.decode(accessToken);
                    return yield TaskController_1.default.filterTasks(uid, status, limit, startWith);
                }
                else {
                    throw new Error('401');
                }
            })
        },
        getAccessToken: {
            type: TokenResponseType,
            args: {
                refreshToken: { type: graphql_1.GraphQLString }
            },
            resolve: (src, { refreshToken }, context) => __awaiter(void 0, void 0, void 0, function* () {
                if (yield (0, AuthMiddleware_1.default)(refreshToken, 'auth')) {
                    const accessToken = yield AuthController_1.default.getAccessToken(refreshToken);
                    return { accessToken };
                }
                else {
                    throw new Error('401');
                }
            })
        },
        getRefreshToken: {
            type: TokenResponseType,
            args: {
                email: { type: graphql_1.GraphQLString },
                password: { type: graphql_1.GraphQLString }
            },
            resolve: (src, { email, password }, context) => __awaiter(void 0, void 0, void 0, function* () {
                return yield AuthController_1.default.getRefreshToken(email, password);
            })
        },
        getPageCount: {
            type: graphql_1.GraphQLInt,
            args: {
                limit: { type: graphql_1.GraphQLInt },
                accessToken: { type: graphql_1.GraphQLInt }
            },
            resolve: (src, { limit, accessToken }, context) => __awaiter(void 0, void 0, void 0, function* () {
                const { uid } = jwt.decode(accessToken);
                return yield TaskController_1.default.getTotalPages(limit, uid);
            })
        }
    }
});
const Mutation = new graphql_1.GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createUser: {
            type: TokenResponseType,
            args: {
                email: { type: graphql_1.GraphQLString },
                password: { type: graphql_1.GraphQLString }
            },
            resolve: (src, { email, password }, context) => __awaiter(void 0, void 0, void 0, function* () {
                return yield AuthController_1.default.createUser(email, password);
            })
        },
        removeTask: {
            type: graphql_1.GraphQLBoolean,
            args: {
                taskId: { type: graphql_1.GraphQLString },
                accessToken: { type: graphql_1.GraphQLString }
            },
            resolve: (src, { taskId, accessToken }, context) => __awaiter(void 0, void 0, void 0, function* () {
                if (yield (0, AuthMiddleware_1.default)(accessToken, 'tasks')) {
                    const { uid } = jwt.decode(accessToken);
                    yield TaskController_1.default.deleteTask(taskId, uid);
                    return true;
                }
                else {
                    throw new Error('401');
                }
            })
        },
        updateTask: {
            type: TaskType,
            args: {
                task: { type: TaskInputType },
                accessToken: { type: graphql_1.GraphQLString }
            },
            resolve: (src, { task, accessToken }, context) => __awaiter(void 0, void 0, void 0, function* () {
                if (yield (0, AuthMiddleware_1.default)(accessToken, 'tasks')) {
                    const { uid } = jwt.decode(accessToken);
                    return yield TaskController_1.default.updateTask(task, uid);
                }
                else {
                    throw new Error('401');
                }
            })
        },
        createTask: {
            type: TaskType,
            args: {
                file: { type: FileType },
                task: { type: TaskInputType },
                accessToken: { type: graphql_1.GraphQLString }
            },
            resolve: (src, { file, task, accessToken }, context) => __awaiter(void 0, void 0, void 0, function* () {
                if (yield (0, AuthMiddleware_1.default)(accessToken, 'tasks')) {
                    const { uid } = jwt.decode(accessToken);
                    const buffer = Buffer.from(file.data, 'base64');
                    const newFile = {
                        originalname: file.name,
                        mimetype: file.type,
                        buffer: buffer
                    };
                    const photo = yield TaskController_1.default.uploadFile(newFile);
                    task.photo = photo;
                    return TaskController_1.default.createTask(task, uid);
                }
                else {
                    throw new Error('401');
                }
            })
        }
    }
});
exports.schema = new graphql_1.GraphQLSchema({
    query: Query,
    mutation: Mutation
});
//# sourceMappingURL=schema.js.map