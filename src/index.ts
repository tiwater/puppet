import { WebSocketServiceType } from './types/websocket';
import { WebSocketServiceFactory } from './services/websocket-service-factory';


// Entry
(async () => {
  // Create websocket based service for Zion customer service
  WebSocketServiceFactory.createWebSocketService(WebSocketServiceType.ZionSupport);
})();
