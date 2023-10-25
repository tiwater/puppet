// server.ts
import next from 'next';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import socketIO from './src/socket-io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    handle(req, res);
  });

  socketIO.attach(server);

  const port = process.env.PORT || 3000;

  server.listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
