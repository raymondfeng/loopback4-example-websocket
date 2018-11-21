import {Application, ApplicationConfig} from '@loopback/core';
import {HttpServer} from '@loopback/http-server';
import {WebSocketServer} from './websocket.server';
import {Socket} from 'socket.io';
import {WebSocketController} from './controllers';

import * as express from 'express';
import * as path from 'path';

// tslint:disable:no-any

export class WebSocketDemoApplication extends Application {
  readonly httpServer: HttpServer;
  readonly wsServer: WebSocketServer;

  constructor(options: ApplicationConfig = {}) {
    super(options);
    const expressApp = express();
    const root = path.resolve(__dirname, '../../public');
    expressApp.use('/', express.static(root));
    this.httpServer = new HttpServer(expressApp, options.websocket);

    // Create ws server
    const wsServer = new WebSocketServer(this.httpServer);
    this.bind('websocket.server').to(wsServer);
    wsServer.use((socket: Socket, next: (err?: any) => void) => {
      console.log('Global middleware - socket:', socket.id);
      next();
    });
    // Add a route
    const ns = wsServer.route(WebSocketController, /^\/chats\/\d+$/);
    ns.use((socket, next) => {
      console.log(
        'Middleware for namespace %s - socket: %s',
        socket.nsp.name,
        socket.id,
      );
      next();
    });
    this.wsServer = wsServer;
  }

  start() {
    return this.wsServer.start();
  }

  stop() {
    return this.wsServer.stop();
  }
}
