import {
  Context,
  Constructor,
  BindingScope,
  MetadataInspector,
  invokeMethod,
} from '@loopback/context';
import {Socket} from 'socket.io';

export class WebSocketControllerFactory {
  private controller: {[method: string]: Function};

  constructor(
    private ctx: Context,
    private controllerClass: Constructor<{[method: string]: Function}>,
  ) {
    this.ctx
      .bind('ws.controller')
      .toClass(this.controllerClass)
      .inScope(BindingScope.CONTEXT);
  }

  async create(socket: Socket) {
    // Instantiate the controller instance
    this.controller = await this.ctx.get<{[method: string]: Function}>(
      'ws.controller',
    );
    await this.setup(socket);
    return this.controller;
  }

  async connect(socket: Socket) {
    const connectMethods =
      MetadataInspector.getAllMethodMetadata(
        'websocket:connect',
        this.controllerClass.prototype,
      ) || {};
    for (const m in connectMethods) {
      await invokeMethod(this.controller, m, this.ctx, [socket]);
    }
  }

  registerDisconnectMethods(socket: Socket) {
    socket.on('disconnect', async () => {
      const disconnectMethods =
        MetadataInspector.getAllMethodMetadata(
          'websocket:disconnect',
          this.controllerClass.prototype,
        ) || {};
      for (const m in disconnectMethods) {
        await invokeMethod(this.controller, m, this.ctx, [socket]);
      }
    });
  }

  registerSubscribeMethods(socket: Socket) {
    const subscribeMethods =
      MetadataInspector.getAllMethodMetadata<string[]>(
        'websocket:subscribe',
        this.controllerClass.prototype,
      ) || {};
    for (const m in subscribeMethods) {
      for (const t of subscribeMethods[m]) {
        socket.on(t, async (...args: unknown[]) => {
          await invokeMethod(this.controller, m, this.ctx, args);
        });
      }
    }
  }

  async setup(socket: Socket) {
    await this.connect(socket);
    this.registerDisconnectMethods(socket);
    this.registerSubscribeMethods(socket);
  }
}
