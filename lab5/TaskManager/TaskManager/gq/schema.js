"use strict";
/*import { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull,
    GraphQLSchema,
} from 'graphql';
import taskController from '../controllers/TaskController';
import authController from '../controllers/AuthController';
import Task from '../model/Task';

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

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        password: { type: GraphQLString },
        email: { type: GraphQLString },
    },
});

const TokenType = new GraphQLObjectType({
    name: 'Token',
    fields: {
        refresh: { type: GraphQLString },
        access: { type: GraphQLString },
    },
});

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        tasks: {
            type: new GraphQLList(TaskType),
            args: {
                limit: { type: GraphQLString },
                startWith: { type: GraphQLString },
            },
            resolve: async (_, { limit, startWith }, context) => {
                //const { uid } = context;
                //return await taskController.getTasks(uid, limit, startWith);
                return [new Task('name', 'desc')];
            },
        },
        taskById: {
            type: TaskType,
            args: {
                id: { type: GraphQLString },
            },
            resolve: async (_, { id }, context) => {
                const { uid } = context;
                return new Task('name', 'desc');
            },
        }
    }
});

*/ /*const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createUser: {
            type: ResponseType,
            args: {
                email: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: async (_, { email, password }) => {
                return await authController.createUser(email, password);
            },
        },
        createTask: {
            type: ResponseType,
            args: {
                task: { type: GraphQLNonNull(TaskType) },
                file: { type: GraphQLString }, // ���� ���� � ���� ������
            },
            resolve: async (_, { task, file }, context) => {
                const { uid } = context;
                // ������ ��� �������� ������
                return await taskController.createTask(task, uid);
            },
        },
        updateTask: {
            type: ResponseType,
            args: {
                task: { type: GraphQLNonNull(TaskType) },
            },
            resolve: async (_, { task }, context) => {
                const { uid } = context;
                await taskController.updateTask(task, uid);
                return { status: 'success', data: 'Task updated' };
            },
        },
        deleteTask: {
            type: ResponseType,
            args: {
                taskId: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: async (_, { taskId }, context) => {
                const { uid } = context;
                await taskController.deleteTask(taskId, uid);
                return { status: 'success', data: 'Task deleted' };
            },
        },
    },
});

const Subscription = new GraphQLObjectType({
    name: 'Subscription',
    fields: {
        taskCreated: {
            type: TaskType,
            subscribe: () => {
                // ������ �������� �� �������� ������
            },
        },
        taskUpdated: {
            type: TaskType,
            subscribe: () => {
                // ������ �������� �� ���������� ������
            },
        },
    },
});*/ /*

export const schema = new GraphQLSchema({
    query: Query,
    //mutation: Mutation,
    //subscription: Subscription,
});*/
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
/**
 * Construct a GraphQL schema and define the necessary resolvers.
 *
 * type Query {
 *   hello: String
 * }
 * type Subscription {
 *   greetings: String
 * }
 */
exports.schema = new graphql_1.GraphQLSchema({
    query: new graphql_1.GraphQLObjectType({
        name: 'Query',
        fields: {
            hello: {
                type: graphql_1.GraphQLString,
                resolve: () => 'world',
            },
        },
    }),
    subscription: new graphql_1.GraphQLObjectType({
        name: 'Subscription',
        fields: {
            greetings: {
                type: graphql_1.GraphQLString,
                subscribe: function () {
                    return __asyncGenerator(this, arguments, function* () {
                        for (const hi of ['Hi', 'Bonjour', 'Hola', 'Ciao', 'Zdravo']) {
                            yield yield __await({ greetings: hi });
                        }
                    });
                },
            },
        },
    }),
});
//# sourceMappingURL=schema.js.map