import { WebSocketServer, WebSocket as WebSocketWsType} from 'ws';

const wss = new WebSocketServer({ port: 8080 });

interface Room {
    sockets: WebSocketWsType[];
}

// Each room id maps to the sockets currently subscribed to that room.
const rooms: Record<string, Room> = {


};


// Connection back to the relayer process that coordinates multiple user servers.
const RELAYER_URL = "ws://localhost:3001"
const relayerSocket = new WebSocket(RELAYER_URL);

// When the relayer sends us a payload, broadcast it to the correct room.
relayerSocket.onmessage = ({data}) => {
    const parsedData = JSON.parse(data);
    if (parsedData.type == "chat"){
        const room = parsedData.room;
        if (rooms[room]) {
            rooms[room].sockets.forEach(socket => socket.send(data));
        }
    }
}


wss.on('connection', function connection(ws) {
    // New WebSocket client connected directly to this user server.
  ws.on('error', console.error);

  ws.on('message', function message(data: string) {
    const parsedData = JSON.parse(data.toString());
    
        // Register the sender with a room the first time we see a join message.
    if (parsedData.type == "join-room"){
        const room = parsedData.room;
        if (!rooms[room]){
            rooms[room] = {
                sockets: []
            }
        }
        rooms[room].sockets.push(ws);
    }
    
        // Relay every inbound message up to the relayer so other servers hear it.
        relayerSocket.send(data);
  });
});