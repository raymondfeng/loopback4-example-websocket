// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as io from 'socket.io-client';
const pEvent = require('p-event');
import {WebSocketDemoApplication} from '../..';
import {expect} from '@loopback/testlab';

describe('WebSocketDemoApplication', () => {
  let app: WebSocketDemoApplication;
  before(givenApp);
  after(() => app.stop());

  it('connects to websocket server', async () => {
    const url = app.wsServer.httpServer.url;
    const socket = io(`${url}/chats/1`);
    socket.emit('chat message', 'Test');
    const reply = await pEvent(socket, 'chat message');
    expect(reply).to.match(/\[\/chats\/1\#.+\] Test/);
    socket.close();
  });

  async function givenApp() {
    app = new WebSocketDemoApplication({websocket: {port: 0}});
    await app.start();
  }
});
