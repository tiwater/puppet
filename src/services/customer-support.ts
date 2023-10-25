import { ChatService } from './chat';

export class CustomerSupportService extends ChatService {

  constructor() {
    const prompt = `You are a customer service.`;
    super(prompt);
  }

  async say(message: string, conversationId: string):Promise<string>{
    return `Are you asking about ${message}`;
  }
}