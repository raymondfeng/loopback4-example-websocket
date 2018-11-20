const express = require('express');
const app = express();
const http = require('http').Server(app);
const SocketIOServer = require('socket.io');
const port = process.env.PORT || 3000;
const path = require('path');
const util = require('util');
const ctx = require('@loopback/context');
const Context = ctx.Context;
const debug = require('debug')('loopback:websocket');

app.get('/', express.static(path.join(__dirname, 'public')));

class WebSocketServer extends Context {
  constructor(httpServer, options = {}) {
    super();
    this.httpServer = httpServer;
    this.io = new SocketIOServer(httpServer, options);
  }

  use(fn) {
    this.io.use(fn);
  }

  route(ControllerClass, namespace) {
    const nsp = namespace ? this.io.of(namespace) : this.io;
    nsp.on('connection', async socket => {
      debug(
        'Websocket connected: id=%s namespace=%s',
        socket.id,
        socket.nsp.name,
      );
      // Create a request context
      const reqCtx = new ctx.Context(this);
      // Bind websocket
      reqCtx.bind('ws.socket').to(socket);
      // Instantiate the controller instance
      await ctx.instantiateClass(ControllerClass, reqCtx);
    });
    return nsp;
  }

  async start() {
    const server = this.httpServer.listen(3000, () => {
      console.log('listening on *:' + port);
    });
    return new Promise((resolve, reject) => {
      server.on('listening', resolve);
      server.on('error', reject);
    });
  }

  async stop() {
    const close = util.promisify(fn => this.io.close(fn));
    return await close();
  }
}

// @websocket({namespace: '/chats'})
class WebSocketController {
  constructor(
    // @inject('ws.socket')
    socket,
  ) {
    this.init(socket);
  }

  // @ws.connect({rooms: ['room 1']})
  init(socket) {
    this.socket = socket;
    this.socket.join('room 1');
    this.socket.on('chat message', msg => {
      this.handleChatMessage(msg);
    });
    this.socket.on('disconnect', () => {
      this.disconnect();
    });
  }

  // @ws.subscribe('chat message')
  // @ws.emit('namespace' | 'requestor' | 'broadcast')
  handleChatMessage(msg) {
    console.log('Message: %s', msg);
    this.socket.nsp.emit('chat message', `[${this.socket.id}] ${msg}`);
  }

  // @ws.disconnect()
  disconnect() {
    console.log('User disconnected: %s', this.socket.id);
  }
}

async function main() {
  // Create ws server
  const wsServer = new WebSocketServer(http);
  wsServer.bind('websocket.server').to(wsServer);
  wsServer.use((socket, next) => {
    console.log('Global middleware - socket:', socket.id);
    next();
  });

  // Decorate the constructor with `@inject('ws.socket')`
  ctx.inject('ws.socket')(WebSocketController, '', 0);

  // Add a route
  const ns = wsServer.route(WebSocketController, /^\/chats\/\d+$/);
  ns.use((socket, next) => {
    console.log('Middleware for namespace %s - socket: %s', socket.nsp.name, socket.id);
    next();
  });
  await wsServer.start();
}

main();
