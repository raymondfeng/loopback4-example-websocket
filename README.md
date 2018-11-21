# loopback4-example-websocket

This example is created to explore how to expose Websocket (sock.io) endpoints
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

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)
