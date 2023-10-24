import { WebSocketService } from './websocket';
import { WebSocketServiceType } from '../types/websocket';
import { PuppetService } from './puppet';

export class WebSocketServiceFactory {

  public static createWebSocketService(serviceId: WebSocketServiceType): WebSocketService {
    return new PuppetService(serviceId);
  }
}