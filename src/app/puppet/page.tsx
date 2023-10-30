'use client';

import { useEffect, useState } from 'react';
import { io as socketIOClient, Socket } from 'socket.io-client';
import { PUPPET_SOCKET_PATH, PuppetEvent, PuppetLoginStatus } from '@/types/puppet-event';
import QRCode from 'qrcode.react';
import PuppetList from './components/puppetList';
import { WebSocketServiceType } from '@/types/websocket';

const PuppetLogin = () => {
  const [message, setMessage] = useState('');
  const [qrcode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyLogin, setVerifyLogin] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [clientId, setClientId] = useState('');
  const [allowRefresh, setAllowRefresh] = useState(true);
  let timoutTracker: any;

  const initTimeoutTracker = (socket: Socket)=>{

    const tracker = setTimeout(() => {
      setQrCode('');
      setMessage('二维码失效');
      socket.disconnect();
    }, 180000);
    timoutTracker = tracker;

  }

  const clearTimeoutTracker = ()=>{

    if(timoutTracker){
      clearTimeout(timoutTracker);
      timoutTracker = null;
    }
  }

  const clearStatus = ()=>{
    socket?.disconnect();
    setSocket(null);
    setQrCode('');
    setVerifyLogin(false);
    clearTimeoutTracker();
  }
  
  const initSocket = () => {
    if (socket) {
      socket.disconnect();
    }

    const url = process.env.NEXT_PUBLIC_TITAN_SERVICE || 'http://localhost:7000';
    const newSocket: Socket = socketIOClient(url, {
      path: PUPPET_SOCKET_PATH
    });

    const serviceId = WebSocketServiceType.ZionSupport;

    newSocket.on('connect', () => {
      console.log('Socket.IO connected');
      // TODO: Get userId

      newSocket.emit(PuppetEvent.clientRequestPuppet, serviceId);
      initTimeoutTracker(newSocket);
    });

    newSocket.on(PuppetEvent.puppetDispatchAuthToken, (authToken) => {
      setAllowRefresh(true);
      setQrCode(authToken);
      setMessage('');
    });

    newSocket.on(PuppetEvent.puppetRequestVerifyCode, () => {
      setMessage('');
      setVerifyLogin(true);
    });

    newSocket.on(PuppetEvent.puppetVerifyResult, (result) => {
      if(result == 'ok') {
        setMessage('验证通过');
      } else {
        setMessage(`错误：${result}`);
        newSocket.disconnect();
        setSocket(null);
      }
    });

    newSocket.on(PuppetEvent.puppetLoginStatus, (result) => {
      if(result == PuppetLoginStatus.login) {
        setMessage('已成功登录');
        clearStatus();
        setAllowRefresh(false);
      } else if(result == PuppetLoginStatus.logout){
        setMessage(`已退出登录`);
        setAllowRefresh(true);
      }
    });

    newSocket.on(PuppetEvent.puppetError, (err) => {
      if(err == 'No available headcount'){
        setMessage('超出连接限额，请购买更多额度或退出当前连接');
      } else {
        setMessage('出错了，请重试');
      }
      clearStatus();
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setQrCode('');
      clearTimeoutTracker();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  };

  useEffect(() => {
    return initSocket();
  }, []);

  const submitVerificationCode = () => {
    if(socket) {
      socket.emit(PuppetEvent.clientSubmitVerifyCode, verificationCode);
    }
  };

  const refreshQrCode = () => {
    setVerifyLogin(false);
    setVerificationCode('');
    setMessage('');
    setQrCode('');
    initSocket();
  };

  return (
    <div className="w-full h-full flex flex-col p-2 gap-2">
      <div className="relative flex flex-col items-center w-full bg-gray-800 rounded-md">
        <div className="relative flex items-center rounded-md px-2 py-2 gap-2">
            <span>扫描二维码以登录</span>
        </div>
        {qrcode && (
          <div>
              <QRCode value={qrcode} size={256} />
          </div>
        )}
        <span>{message}</span>
        {verifyLogin && (
          <div className="relative flex items-center rounded-md px-2 py-2 gap-2">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button onClick={submitVerificationCode} className="bg-primary text-white px-2 py-1 rounded">提交验证码</button>
          </div>
        )}
        {allowRefresh &&
          <button onClick={refreshQrCode} className="bg-primary text-white px-2 py-1 rounded">刷新二维码</button>
        }
      </div>
      <PuppetList/>
    </div>
  );
};

export default PuppetLogin;