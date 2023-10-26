// socket-io.ts
import { Server, Socket } from 'socket.io';
import { WebSocketServiceType } from './types/websocket';
import { PuppetService } from './services/puppet';
import { PUPPET_SERVICE_PATH, PuppetEvent } from './types/puppet-event';

const io = new Server({
  path: PUPPET_SERVICE_PATH,  // Distinguish the websocket services
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
  socket.on(PuppetEvent.clientRequestPuppet, (serviceId: WebSocketServiceType, clientId: string) => {
    if (serviceId === WebSocketServiceType.ZionSupport) {
      PuppetService.getInstance().createPuppet(serviceId, clientId, socket);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected');
  });
});

export default io;
