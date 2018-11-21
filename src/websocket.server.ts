import {Context, instantiateClass} from '@loopback/context';
import {HttpServer} from '@loopback/http-server';
import {Server, ServerOptions} from 'socket.io';
import SocketIOServer = require('socket.io');
import {Constructor} from '@loopback/context';

const debug = require('debug')('loopback:websocket');

// tslint:disable:no-any
export class WebSocketServer extends Context {
  private io: Server;

  constructor(
    private httpServer: HttpServer,
    private options: ServerOptions = {},
  ) {
    super();
    this.io = SocketIOServer(options);
  }

  use(fn: (socket: SocketIOServer.Socket, next: (err?: any) => void) => void) {
    this.io.use(fn);
  }

  route(ControllerClass: Constructor<any>, namespace: string | RegExp) {
    const nsp = namespace ? this.io.of(namespace) : this.io;
    nsp.on('connection', async socket => {
      debug(
        'Websocket connected: id=%s namespace=%s',
        socket.id,
        socket.nsp.name,
      );
      // Create a request context
      const reqCtx = new Context(this);
      // Bind websocket
      reqCtx.bind('ws.socket').to(socket);
      // Instantiate the controller instance
      await instantiateClass(ControllerClass, reqCtx);
    });
    return nsp;
  }

  async start() {
    await this.httpServer.start();
    // FIXME: Access HttpServer.server
    const server = (this.httpServer as any).server;
    this.io.attach(server, this.options);
  }

  async stop() {
    const close = new Promise<void>((resolve, reject) => {
      this.io.close(() => {
        resolve();
      });
    });
    await close;
    await this.httpServer.stop();
  }
}
