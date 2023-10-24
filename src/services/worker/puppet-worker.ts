import { ScanStatus, WechatyBuilder, types } from '@juzi/wechaty';
import { WechatyInterface } from '@juzi/wechaty/impls';
import { ProcessMessage } from '../../types/process';

// Token for wechaty
const token = 'puppet_workpro_4a075759562f477aaab5985e0c498978';

const getQrcodeKey = (urlStr: string) => {
  const url = new URL(urlStr);
  return url.searchParams.get('key');
}

class PuppetWorker {

  private puppet: WechatyInterface;
  qrcodeKey: string = '';
  private lastVerifyCodeId: string = '';

  constructor(){
    const clientId = process.argv[3];

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
      // Send qrCode to the PuppetService and then return to the user
      (process as any)?.send({ type: 'authToken', data: qrcode });
    }).on('verify-code', async (id: string, message: string, scene: types.VerifyCodeScene, status: types.VerifyCodeStatus) => {
      
      // Notify the user to input verify code to complete login
      if (status === types.VerifyCodeStatus.WAITING && scene === types.VerifyCodeScene.LOGIN && id === this.qrcodeKey) {
        // console.log(`receive verify-code event, id: ${id}, message: ${message}, scene: ${types.VerifyCodeScene[scene]} status: ${types.VerifyCodeStatus[status]}`);
        this.lastVerifyCodeId = id;
        (process as any)?.send({ type: 'requestVerifyCode' });
      }
    }).on('login', user => {
      console.log(`
      ============================================
      user: ${JSON.stringify(user)}, friend: ${user.friend()}, ${user.coworker()}
      ============================================
      `)
    }).on('message', async message => {
      console.log(`new message received: ${JSON.stringify(message)}`);
      // await message.say(await answerQuestion('bbb', 'aaa'));
    }).on('error', err => {
      console.log(err)
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
      if(message.type === 'verifyCode'){
        // Receive verify code from user
        try {
          // Verify
          await this.puppet.enterVerifyCode(this.lastVerifyCodeId, message.data);
          // No error means success
          (process as any)?.send({ type: 'verifyCodeResult', data: 'ok' });
        } catch (e) {
          console.log((e as Error).message);
          // Return error
          (process as any)?.send({ type: 'verifyCodeResult', data: (e as Error).message });
          // 如果抛错，请根据 message 处理，目前发现可以输错3次，超过3次错误需要重新扫码。
          // 错误关键词: 验证码错误输入错误，请重新输入
          // 错误关键词：验证码错误次数超过阈值，请重新扫码'
          // 目前不会推送 EXPIRED 事件，需要根据错误内容判断
        }
      }
    });


    process.once('exit', () => {
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