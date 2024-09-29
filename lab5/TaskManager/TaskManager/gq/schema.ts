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

*//*const Mutation = new GraphQLObjectType({
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
                file: { type: GraphQLString }, // Если файл в виде строки
            },
            resolve: async (_, { task, file }, context) => {
                const { uid } = context;
                // Логика для создания задачи
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
                // Логика подписки на создание задачи
            },
        },
        taskUpdated: {
            type: TaskType,
            subscribe: () => {
                // Логика подписки на обновление задачи
            },
        },
    },
});*//*

export const schema = new GraphQLSchema({
    query: Query,
    //mutation: Mutation,
    //subscription: Subscription,
});*/

import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

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
export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: {
            hello: {
                type: GraphQLString,
                resolve: () => 'world',
            },
        },
    }),
    subscription: new GraphQLObjectType({
        name: 'Subscription',
        fields: {
            greetings: {
                type: GraphQLString,
                subscribe: async function* () {
                    for (const hi of ['Hi', 'Bonjour', 'Hola', 'Ciao', 'Zdravo']) {
                        yield { greetings: hi };
                    }
                },
            },
        },
    }),
});