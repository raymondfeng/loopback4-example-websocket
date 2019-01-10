# loopback4-example-websocket

This example is created to explore how to expose Websocket [(socket.io)](https://socket.io) endpoints
in conjunction with LoopBack controllers.

Similarly as @loopback/rest, each websocket server is attached to an http/https
server. WebSocket controllers are mapped to different routes (namespaces), for
example:

/admins -> AdminController
/chats -> ChatController

When a client connects to the endpoint, a controller is instantiated upon the
`connection` event of the namespace with the `socket` object. Controller methods
can subscribe to one or more message types and send messages to one or more clients.

Each `socket` can join/leave rooms. Rooms are used to group/tag clients for messaging purposes.

Middleware can be registered at global and namespace level.

## Basic use

```
npm start
Open your browser to http://localhost:3000
```

## Websocket controllers

```ts
import {Socket} from 'socket.io';
import {ws} from '../decorators/websocket.decorator';

/**
 * A demo controller for websocket
 */
@ws('/chats')
export class WebSocketController {
  constructor(
    @ws.socket() // Equivalent to `@inject('ws.socket')`
    private socket: Socket,
  ) {}

  /**
   * The method is invoked when a client connects to the server
   * @param socket
   */
  @ws.connect()
  connect(socket: Socket) {
    console.log('Client connected: %s', this.socket.id);
    socket.join('room 1');
  }

  /**
   * Register a handler for 'chat message' events
   * @param msg
   */
  @ws.subscribe('chat message')
  // @ws.emit('namespace' | 'requestor' | 'broadcast')
  handleChatMessage(msg: unknown) {
    console.log('Message: %s', msg);
    this.socket.nsp.emit('chat message', `[${this.socket.id}] ${msg}`);
  }

  /**
   * The method is invoked when a client disconnects from the server
   * @param socket
   */
  @ws.disconnect()
  disconnect() {
    console.log('Client disconnected: %s', this.socket.id);
  }
}
```

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)
