import { WebSocketServer } from 'ws'; 
import { useServer } from 'graphql-ws/lib/use/ws';
import { schema } from './gq/schema';

const server = new WebSocketServer({
    port: 1337,
    path: '/graphql',
});

useServer({ schema }, server);

console.log('Listening to port 1337');
