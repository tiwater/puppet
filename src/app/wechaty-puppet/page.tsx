'use client';

import { useEffect, useState } from 'react';
import { io as socketIOClient, Socket } from 'socket.io-client';
import QRCode from 'qrcode.react';

enum WebSocketServiceType {
  ZionSupport = 1
};

const WechatyPuppet = () => {
  const [message, setMessage] = useState('');
  const [qrcode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyLogin, setVerifyLogin] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [clientId, setClientId] = useState('');
  const [allowRefresh, setAllowRefresh] = useState(false);
  
  const initSocket = () => {
    if (socket) {
      socket.disconnect();
    }

    // const url = process.env.NEXT_PUBLIC_TITAN_SERVICE || 'http://localhost:4000';
    const newSocket: Socket = socketIOClient();

    const serviceId = WebSocketServiceType.ZionSupport;

    newSocket.on('connect', () => {
      console.log('Socket.IO connected');
      // TODO: Get userId

      newSocket.emit('request-puppet', serviceId, clientId);
      setTimeout(() => {
        setQrCode('');
        setMessage('二维码失效');
        newSocket.disconnect();
      }, 180000);
    });

    newSocket.on('authToken', (authToken) => {
      setAllowRefresh(true);
      setQrCode(authToken);
    });

    newSocket.on('requestVerifyCode', () => {
      setMessage('');
      setVerifyLogin(true);
    });

    newSocket.on('verifyCodeResult', (result) => {
      if(result == 'ok') {
        setMessage('登录成功');
      } else {
        setMessage(`错误：${result}`);
      }
      newSocket.disconnect();
      setSocket(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  };

  const submitVerificationCode = () => {
    if(socket) {
      socket.emit('verifyCode', verificationCode);
    }
  };

  const refreshQrCode = () => {
    setVerifyLogin(false);
    setVerificationCode('');
    setMessage('');
    setQrCode('');
    if(!clientId || clientId.trim() == ''){
      alert('请输入手机号或微信号！');
      return;
    }
    initSocket();
  };

  return (
    <div className="w-full h-full flex p-2 gap-2">
      <div className="relative flex flex-col items-center w-full bg-gray-800 rounded-md">
        <div className="relative flex items-center rounded-md px-2 py-2 gap-2">
            <span>用户</span>
            <input
              type="text"
              value={clientId}
              placeholder='请输入手机号或微信号'
              onChange={(e) => setClientId(e.target.value)}
              />
            <button onClick={refreshQrCode} className="bg-primary text-white px-2 py-1 rounded">
              确定
            </button>
        </div>
        {qrcode && (
          <div>
              <QRCode value={qrcode} size={256} />
              {message === '二维码失效' && <span className="absolute top-0 left-0">二维码失效</span>}
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
          <button onClick={refreshQrCode} className="bg-primary text-white px-2 py-1 rounded">刷新</button>
        }
      </div>
    </div>
  );
};

export default WechatyPuppet;