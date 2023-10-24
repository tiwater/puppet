import { io as socketIOClient, Socket } from 'socket.io-client';
import { WebSocketServiceStatus, WebSocketServiceType } from '../types/websocket';

export class WebSocketService {

  socket: Socket;
  serviceId: WebSocketServiceType;

  constructor(serviceId: WebSocketServiceType) {

    // Setup WebSocket connection to server
    const url = process.env.NEXT_PUBLIC_TITAN_SERVICE || 'http://localhost:4000';
    this.socket = socketIOClient(url);
    this.serviceId = serviceId;

    this.socket.on('disconnect', () => {
      console.log(`Socket disconnected.`);
    });
  }
}