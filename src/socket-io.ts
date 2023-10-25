// socket-io.ts
import { Server, Socket } from 'socket.io';
import { WebSocketServiceType } from './types/websocket';
import { PuppetService } from './services/puppet';

const io = new Server({
  serveClient: false,
  cors: {
    origin: ['http://localhost:666', 'https://demo.penless.ai'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});

io.on('connection', (socket: Socket) => {
  console.log('Socket.IO client connected');
  // Handle im client connection
  socket.on('request-puppet', (serviceId: WebSocketServiceType, clientId: string) => {
    if (serviceId === WebSocketServiceType.ZionSupport) {
      PuppetService.getInstance().createPuppet(serviceId, clientId, socket);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected');
  });
});

export default io;
