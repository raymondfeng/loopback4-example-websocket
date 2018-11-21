import {
  ClassDecoratorFactory,
  Constructor,
  MetadataInspector,
  MetadataAccessor,
} from '@loopback/context';

export interface WebSocketMetadata {
  namespace?: string | RegExp;
}

export const WEBSOCKET_METADATA = MetadataAccessor.create<
  WebSocketMetadata,
  ClassDecorator
>('websocket');

export function ws(spec: WebSocketMetadata = {}) {
  return ClassDecoratorFactory.createDecorator(WEBSOCKET_METADATA, spec);
}

// tslint:disable-next-line:no-any
export function getWebSocketMetadata(controllerClass: Constructor<any>) {
  return MetadataInspector.getClassMetadata(
    WEBSOCKET_METADATA,
    controllerClass,
  );
}
