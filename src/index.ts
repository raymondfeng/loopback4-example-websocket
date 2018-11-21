import {WebSocketDemoApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export {WebSocketDemoApplication};
export * from './websocket.server';
export * from './decorators/websocket.decorator';
export * from './websocket-controller-factory';

export async function main(options: ApplicationConfig = {}) {
  const app = new WebSocketDemoApplication(options);
  await app.start();

  console.log('listening on %s', app.httpServer.url);

  return app;
}
