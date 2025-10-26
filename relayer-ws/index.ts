import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({port:8080});

const servers: WebSocket[] = []

wss.on('connection', function connection(ws){
    ws.on('error',console.error);

    //Whenever there is a message
    servers.push(ws);

    ws.on('message',function message(data:string){
        //We make sure to send received message to all server except the one who sent it
        servers.filter(socket => socket != ws).map(socket => {
            socket.send(data);
        })
    });
});
