import {Socket} from 'socket.io';
import {inject} from '@loopback/context';

// tslint:disable:no-any
export class WebSocketController {
  constructor(
    @inject('ws.socket')
    private readonly socket: Socket,
  ) {
    this.init(socket);
  }

  // @ws.connect({rooms: ['room 1']})
  init(socket: Socket) {
    socket.join('room 1');
    socket.on('chat message', msg => {
      this.handleChatMessage(msg);
    });
    socket.on('disconnect', () => {
      this.disconnect();
    });
  }

  // @ws.subscribe('chat message')
  // @ws.emit('namespace' | 'requestor' | 'broadcast')
  handleChatMessage(msg: any) {
    console.log('Message: %s', msg);
    this.socket.nsp.emit('chat message', `[${this.socket.id}] ${msg}`);
  }

  // @ws.disconnect()
  disconnect() {
    console.log('User disconnected: %s', this.socket.id);
  }
}
