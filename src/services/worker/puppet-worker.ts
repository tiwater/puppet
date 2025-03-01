import { ScanStatus, WechatyBuilder, types } from '@juzi/wechaty';
import { MessageInterface, WechatyInterface } from '@juzi/wechaty/impls';
import { ProcessMessage } from '../../types/process';
import { CustomerSupportService } from '../customer-support';
import { PuppetEvent, PuppetLoginStatus } from '../../types/puppet-event';

const getQrcodeKey = (urlStr: string) => {
  const url = new URL(urlStr);
  return url.searchParams.get('key');
}

class PuppetWorker {

  private puppet: WechatyInterface;
  qrcodeKey: string = '';
  private lastVerifyCodeId: string = '';
  private chatService: CustomerSupportService | undefined;
  private autoLogin: boolean = false;
  private manualLogin: boolean = false;

  constructor(){
    const clientId = process.argv[3];
    const token = process.argv[4];

    // Create puppet for the client
    this.puppet = WechatyBuilder.build({
      name: clientId,
      puppet: '@juzi/wechaty-puppet-service',
      puppetOptions: {
        token,
        tls: {
          disable: true
        }
      }
    });
  }

  // Init puppet
  initPuppet(){

    this.puppet.on('scan', (qrcode, status, data) => {
      // console.log(`
      // ============================================================
      // qrcode : ${qrcode}, status: ${status}, data: ${data}
      // ============================================================
      // `)
      if (status === ScanStatus.Waiting) {
        this.qrcodeKey = getQrcodeKey(qrcode) || '';
      }
      this.manualLogin = true;
      // Send qrCode to the PuppetService and then return to the user
      (process as any)?.send({ type: PuppetEvent.puppetDispatchAuthToken, data: qrcode });
    }).on('verify-code', async (id: string, message: string, scene: types.VerifyCodeScene, status: types.VerifyCodeStatus) => {
      
      // Notify the user to input verify code to complete login
      if (status === types.VerifyCodeStatus.WAITING && scene === types.VerifyCodeScene.LOGIN && id === this.qrcodeKey) {
        // console.log(`receive verify-code event, id: ${id}, message: ${message}, scene: ${types.VerifyCodeScene[scene]} status: ${types.VerifyCodeStatus[status]}`);
        this.lastVerifyCodeId = id;
        (process as any)?.send({ type: PuppetEvent.puppetRequestVerifyCode });
      }
    }).on('login', async (user) => {
      console.log(`
      ============================================
      user: ${JSON.stringify(user)}, friend: ${user.friend()}, ${user.coworker()}
      ============================================
      `);
      if(!this.autoLogin && !this.manualLogin){
        // Not auto login but already logged in without manually scanned the qrCode
        // Logout
        await this.puppet.logout();
      } else {
        this.chatService = new CustomerSupportService();
        (process as any)?.send({ type: PuppetEvent.puppetLoginStatus, data: { status: PuppetLoginStatus.login, user: user } });
      }
    }).on('logout', (user) => {
      console.log(`user ${user} logout`);
      (process as any)?.send({ type: PuppetEvent.puppetLoginStatus, data: { status: PuppetLoginStatus.logout } });
    }).on('message', async (message: MessageInterface)=>{
      console.log(`new message received: ${JSON.stringify(message)}`);
      if(this.chatService){
        if(!message.self()){
          const sender = message.talker();
          let conversationId;
          if(message.room()){
            conversationId = message.room()?.id ?? '';
          } else {
            conversationId = sender.id;
          }
          // Not myself's words
          try{
            await message.say(await this.chatService.say(message.text(), conversationId));
          } catch(error){
            console.error(error);
          }
        }
      }
    }
    ).on('error', err => {
      console.error(err);
      (process as any)?.send({ type: PuppetEvent.puppetError, data: err });
    }).on('room-announce', (...args) => {
      console.log(`room announce: ${JSON.stringify(args)}`)
    }).on('contact-alias', (...args) => {
      console.log(`contact alias: ${JSON.stringify(args)}`)
    }).on('tag', (...args) => {
      console.log(`tag: ${JSON.stringify(args)}`)
    })
  }

  // Init the message listener for child process to receive message from the main process
  initProcess(){
    process.on('message', async (message: ProcessMessage)=>{
      if(message.type === PuppetEvent.clientSubmitVerifyCode){
        // Receive verify code from user
        try {
          // Verify
          await this.puppet.enterVerifyCode(this.lastVerifyCodeId, message.data);
          // No error means success
          (process as any)?.send({ type: PuppetEvent.puppetVerifyResult, data: 'ok' });
        } catch (e) {
          console.log((e as Error).message);
          // Return error
          (process as any)?.send({ type: PuppetEvent.puppetVerifyResult, data: (e as Error).message });
          // 如果抛错，请根据 message 处理，目前发现可以输错3次，超过3次错误需要重新扫码。
          // 错误关键词: 验证码错误输入错误，请重新输入
          // 错误关键词：验证码错误次数超过阈值，请重新扫码'
          // 目前不会推送 EXPIRED 事件，需要根据错误内容判断
        }
      } else if(message.type === PuppetEvent.clientRequestLogout){
        // Logout
        await this.puppet.logout();
      }
    });


    process.once('exit', () => {
      // Notify the main process I'm logout
      (process as any)?.send({ type: PuppetEvent.puppetLoginStatus, data: PuppetLoginStatus.logout });
      this.puppet.stop();
    });
  }

  init(){
    this.initProcess();
    this.initPuppet();
  }

  start(){
    this.puppet.start();
  }
};

// Start puppet service as the worker
const puppetWorker = new PuppetWorker();
puppetWorker.init();
puppetWorker.start();