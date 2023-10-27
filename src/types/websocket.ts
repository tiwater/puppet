import { Server, Socket } from 'socket.io';

export enum WebSocketServiceType {
  ZionSupport = "zionSupport",
};

export enum WebSocketServiceStatus {
  Unknown = 0,
  Connected = 1,
  Disconnected = 2
};

export interface IMClient {
  socket: Socket | null;
  clientId: string;
  serviceId: WebSocketServiceType;
}