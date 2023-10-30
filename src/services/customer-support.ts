import { ChatService } from './chat';
import { callPenlessApi } from '../utils/penless-api';

export class CustomerSupportService extends ChatService {

  constructor() {
    const prompt = `You are a customer service.`;
    super(prompt);
  }

  async say(message: string, conversationId: string): Promise<string> {
    const reply = await callPenlessApi('/users26684/ZionSupport', {
      question: message,
      conversationId: conversationId
    })
    return reply.answer;
  }
}