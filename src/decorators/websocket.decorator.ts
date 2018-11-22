import {
  ClassDecoratorFactory,
  Constructor,
  MetadataAccessor,
  MetadataInspector,
  MethodDecoratorFactory,
  inject,
} from '@loopback/context';

export interface WebSocketMetadata {
  namespace?: string | RegExp;
}

export const WEBSOCKET_METADATA = MetadataAccessor.create<
  WebSocketMetadata,
  ClassDecorator
>('websocket');

/**
 * Decorate a websocket controller class to specify the namespace
 * For example,
 * ```ts
 * @ws({namespace: '/chats'})
 * export class WebSocketController {}
 * ```
 * @param spec A namespace or object
 */
export function ws(spec: WebSocketMetadata | string | RegExp = {}) {
  if (typeof spec === 'string' || spec instanceof RegExp) {
    spec = {namespace: spec};
  }
  return ClassDecoratorFactory.createDecorator(WEBSOCKET_METADATA, spec);
}

export function getWebSocketMetadata(controllerClass: Constructor<unknown>) {
  return MetadataInspector.getClassMetadata(
    WEBSOCKET_METADATA,
    controllerClass,
  );
}

export namespace ws {
  export function socket() {
    return inject('ws.socket');
  }

  /**
   * Decorate a method to subscribe to websocket events.
   * For example,
   * ```ts
   * @ws.subscribe('chat message')
   * async function onChat(msg: string) {
   * }
   * ```
   * @param messageTypes
   */
  export function subscribe(...messageTypes: (string | RegExp)[]) {
    return MethodDecoratorFactory.createDecorator(
      'websocket:subscribe',
      messageTypes,
    );
  }

  /**
   * Decorate a controller method for `disconnect`
   */
  export function disconnect() {
    return subscribe('disconnect');
  }

  /**
   * Decorate a controller method for `connect`
   */
  export function connect() {
    return MethodDecoratorFactory.createDecorator('websocket:connect', true);
  }
}
