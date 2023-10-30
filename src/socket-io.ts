// socket-io.ts
import { Server, Socket } from 'socket.io';
import { WebSocketServiceType } from './types/websocket';
import { PuppetService } from './services/puppet';
import { PUPPET_SOCKET_PATH, PuppetEvent } from './types/puppet-event';
import { parseCookies } from './utils/cookie';

const io = new Server({
  path: PUPPET_SOCKET_PATH,  // Distinguish the websocket services
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
  socket.on(PuppetEvent.clientRequestPuppet, async (serviceId: WebSocketServiceType) => {
    // Extract the pb_auth cookie from the websocket request
    const rawCookies = socket.handshake.headers['cookie'];

    if (rawCookies) {

      // Cannot call pocketbase in the websocket server, have to parse the cookies to get the user info
      const cookies = await parseCookies(rawCookies);
      const authInfo = cookies['pb_auth'];
      if (authInfo) {
        const authEntity = JSON.parse(authInfo);
        const userId = authEntity.model.id;
        if(userId && userId.trim() != ''){
          console.log(`Setup puppet request for client ${userId}`);
          if (serviceId === WebSocketServiceType.ZionSupport) {
            PuppetService.getInstance(serviceId).createPuppet(serviceId, userId, socket);
            return;
          } else {
            socket.emit(PuppetEvent.puppetError, 'No puppet for this service');
            return;
          }
        }
      }
    }
    socket.emit(PuppetEvent.puppetError, 'No authentication information');
  });

  PuppetService.handleServiceRequest(socket);

  socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected');
  });
});

export default io;
