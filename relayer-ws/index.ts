import { WebSocketServer, WebSocket } from 'ws';

// Central relay that other backend servers connect to so they can share messages.
const wss = new WebSocketServer({port:3001});

// Track every backend server that connects so we can rebroadcast messages later.
const servers: WebSocket[] = []

wss.on('connection', function connection(ws){
    ws.on('error',console.error);

    // Remember this connected server so it receives future messages.
    servers.push(ws);

    ws.on('message',function message(data:string){
        // Forward the payload to every connected server (including the sender for now).
        servers.forEach(socket => {
            socket.send(data);
        })
    });
});
