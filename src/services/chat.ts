import { callPenlessApi } from '../utils/penless-api';

export class ChatService {

  prompt: string = '';

  constructor(prompt: string){
    this.prompt = prompt;
  }

  async say(message: string, conversationId: string): Promise<string> {
    throw new Error('Not implemented');
  }
}