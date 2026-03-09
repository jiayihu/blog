---
title: Load testing SignalR + Protobuf with k6
description: How to build a custom SignalR client for k6 to load test real-time WebSocket applications using MessagePack and Protobuf
pubDate: 2026-03-09
---

A colleague and I needed to load test a real-time collaborative application — a digital whiteboard where dozens of users simultaneously create, move, and edit objects on a shared canvas. The real-time layer runs on [SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction), Microsoft's library for adding real-time web functionality, using WebSocket transport with MessagePack serialization and Protobuf-encoded payloads. So every message goes through two serialization layers: Protobuf for the domain payload, MessagePack for the SignalR framing.

We chose [k6](https://k6.io/) as our load testing tool. It's scriptable in JavaScript, handles WebSocket connections natively, and scales well for distributed cloud runs. The catch: k6's JavaScript runtime isn't Node.js and isn't a browser. It's an embedded JS engine running in Go, which means you can't just `npm install @microsoft/signalr` and call it a day — especially when your messages are Protobuf-encoded.

This article walks through the challenges we faced and how we built a custom SignalR client with Protobuf support that runs inside k6.

## Table of Contents

## Why we wrote a custom SignalR client

The [official TypeScript client](https://github.com/dotnet/aspnetcore/tree/main/src/SignalR/clients/ts/signalr) for SignalR (`@microsoft/signalr`) supports passing custom `httpClient` and `WebSocket` implementations through `IHttpConnectionOptions`. In theory, you could plug in k6's WebSocket and be on your way. In practice, there were several reasons to go custom:

**Our SignalR layer uses Protobuf.** Messages aren't plain JSON — they're Protobuf-encoded payloads wrapped in MessagePack frames. The official client knows nothing about Protobuf, so we'd need a custom layer on top regardless.

**The production client is too heavy and complex.** Our application's SignalR client has grown over the years to include resyncing logic, message queues, optimistic updates, and resilience patterns. Extracting it as a standalone library that k6 could consume wasn't practical. For load testing, we don't care about client-side resilience — we care about measuring server performance under concurrent load.

**Custom metrics require access to SignalR internals.** We wanted accurate per-method response times: how long does it take between sending a `PostNewTile` invocation and receiving the server's `Completion` response? That requires hooking into the invocation ID tracking inside the hub connection, which the official client doesn't expose.

## Architecture overview

The solution has three layers:

1. **K6SocketConnection** — a bridge between k6's `WebSocket` and SignalR's `IConnection` interface
2. **SignalRClient** — a minimal reimplementation of SignalR's `HubConnection`, handling handshake, message parsing, and method invocation
3. **Protobuf serialization** — encoding/decoding domain messages before they're wrapped in SignalR's MessagePack protocol

We still use parts of the official library — specifically `@microsoft/signalr-protocol-msgpack` for MessagePack encoding/decoding — but the connection management and message routing is custom.

## Bridging k6 WebSocket to SignalR

SignalR's internal architecture expects an `IConnection` interface with `start()`, `send()`, and `stop()` methods. We implemented a thin adapter around k6's WebSocket:

```typescript
const RecordSeparatorCode = 0x1e;
const RecordSeparator = String.fromCharCode(RecordSeparatorCode);

export class K6SocketConnection implements IConnection {
  readonly features: any;
  readonly connectionId?: string;
  baseUrl = "";

  constructor(private socket: WebSocket) {}

  start(): Promise<void> {
    // Send the SignalR handshake requesting MessagePack protocol
    this.socket.send(
      `${JSON.stringify({ protocol: "messagepack", version: 1 })}${RecordSeparator}`
    );
    return Promise.resolve(undefined);
  }

  send(data: ArrayBuffer): Promise<void> {
    this.socket.send(data);
    return Promise.resolve(undefined);
  }

  stop(): Promise<void> {
    this.socket.close();
    return Promise.resolve(undefined);
  }

  onreceive = null;
  onclose = null;
}
```

The key detail is the **record separator** (`0x1E`). SignalR's text-based protocol uses this byte to delimit messages. The handshake is a JSON text message terminated by `0x1E`, after which the connection switches to binary MessagePack frames.

## The custom SignalR client

The `SignalRClient` class is modeled after [SignalR's HubConnection](https://github.com/dotnet/aspnetcore/blob/main/src/SignalR/clients/ts/signalr/src/HubConnection.ts). It maintains a registry of method handlers (like `on()` / `off()`), creates invocation messages with incrementing IDs, and delegates serialization to the `MessagePackHubProtocol`:

```typescript
export class SignalRClient {
  private _methods: Record<string, Array<(payload: any) => void>> = {};
  private _protocol = new MessagePackHubProtocol();
  private _cachedPingMessage: ArrayBuffer;
  private _invocationId: number;
  private _receivedHandshakeResponse = false;
  private invocationTimings = new Map<string, { method: string; start: number }>();

  constructor(
    private connection: K6SocketConnection,
    config: { deviceUuid: string; projectId: number; user: string },
    private onStart: () => void
  ) {
    this._invocationId = 0;
    this._cachedPingMessage = this._protocol.writeMessage({
      type: MessageType.Ping,
    });
  }

  // ...
}
```

A few things worth noting:

- **Ping messages are cached** — since the ping payload never changes, we serialize it once in the constructor and reuse it.
- **Invocation timings** — each outgoing message gets a unique invocation ID. When the server responds with a `Completion` message for that ID, we compute the round-trip time and report it to k6's metrics.
- **Lazy decoding** — incoming messages are only decoded with Protobuf if there's a registered handler for that message type. This saves CPU when you don't care about certain server notifications.

### Handling the handshake

The first message from the server after connecting is the handshake response — raw bytes `7b 7d 1e` (which is `{}` followed by the record separator). Normally, SignalR's `HandshakeProtocol` class handles this, but we couldn't import it due to build constraints with Webpack and Babel not compiling TypeScript from `node_modules`. So we handle it manually:

```typescript
private _processIncomingData(data: ArrayBuffer) {
  if (!this._receivedHandshakeResponse) {
    const binaryData = new Uint8Array(data);
    const isHandShakeMessage = binaryData.indexOf(RecordSeparatorCode);
    this._receivedHandshakeResponse = true;

    if (isHandShakeMessage) {
      return []; // Skip the handshake, trigger onStart callback
    }
  }

  // After handshake, parse messages using MessagePack
  const messages = this._protocol.parseMessages(data, this._logger);
  // ... handle Invocation, Completion, Ping, Close message types
}
```

### Sending messages with Protobuf

On the sending side, every domain message goes through two serialization layers. First, the payload is serialized with Protobuf using the message's specific codec. Then the Protobuf bytes are wrapped in a SignalR `InvocationMessage` and serialized with MessagePack:

```typescript
invokeMessage(messageType: PostMessageName, message: any): Promise<void> {
  const payload = this.encodeMessageWithProtobuf(messageType, message);
  this.send(messageType, payload); // Wraps in MessagePack InvocationMessage
  signalRMessageCounter.add(1, { Method: messageType });

  return Promise.resolve();
}

private encodeMessageWithProtobuf(messageType: PostMessageName, payload: any): Uint8Array {
  const serialized = serializeOutgoingMessage(
    { name: messageType, message: payload },
    this.getBaseMessage(this.projectId)
  );

  const codec = messageEncoders[messageType];
  const message = codec.create(serialized);

  const error = codec.verify(message);
  if (error) {
    fail(`Invalid message: ${error}`);
  }

  return codec.encode(message).finish();
}
```

The `codec.verify()` step is important — it catches serialization issues before they hit the wire, which is much easier to debug than a cryptic server-side error.

## Wiring it all together in k6

The test script connects the pieces. Each virtual user (VU) opens a WebSocket, wraps it in our connection adapter, creates the SignalR client, and starts performing canvas actions:

```typescript
function runSignalR(data: UserProjectData) {
  const socket = new WebSocket(
    `wss://${API_HOST}${SIGNALR_PATH}?access_token=${data.credentials.AuthorizationToken}`
  );
  socket.binaryType = "arraybuffer";

  const connection = new K6SocketConnection(socket);
  const signalRClient = new SignalRClient(
    connection,
    { deviceUuid: basePayload.UniqueDeviceId, projectId: data.ProjectId, user: data.user },
    () => runCanvasActions(socket, signalRClient, data)
  );

  socket.addEventListener("open", () => {
    connection.start();          // Send handshake
    signalRClient.postLoginProject(); // Join the project room
  });

  socket.addEventListener("message", (message) => {
    signalRClient.processIncomingMessage(message.data);
  });
}
```

The `onStart` callback — the third argument to `SignalRClient` — fires after the handshake completes. This is where canvas actions begin: creating sticky notes, drawing shapes, connecting tiles with lines, grouping and ungrouping, uploading files.

Each VU simulates a real user session: it authenticates, joins a project, performs a sequence of canvas actions with realistic pauses between them, and then either disconnects or loops back to do more actions:

```typescript
// At the end of all canvas tasks
Math.random() <= REJOIN_PROJECT_PROBABILITY
  ? socket.close()   // 5% chance to disconnect and reconnect
  : runCanvasActions(socket, signalRClient, data); // Continue until test ends
```

## Taming Protobuf in k6's runtime

One of the subtler challenges was getting [protobufjs](https://github.com/protobufjs/protobuf.js) to work inside k6. The library tries to detect Node.js modules like `buffer` and `long` at startup using a dynamic `require()` check. k6's runtime sees these and warns:

```
WARN The moduleSpecifier "buffer" has no scheme but we will try to resolve
it as remote module. This will be deprecated in the future.
```

We fixed this with Webpack's `string-replace-loader`, patching the `util.inquire` function that protobufjs uses for module detection:

```javascript
// webpack.config.js
{
  test: /\.js$/,
  loader: "string-replace-loader",
  options: {
    search: /util.inquire = .+/,
    replace: `util.inquire = function() { return null; }`,
    flags: "g",
  },
}
```

This tells protobufjs that neither `buffer` nor `long` are available, which is fine — it falls back to its pure JavaScript implementations.

Another thing to keep in mind: k6 runs each Virtual User in an isolated JavaScript VM. Every VU gets its own copy of all JS code and data. With Protobuf definitions and large test data payloads, this adds up quickly in memory usage. If you're running 100 VUs, you have 100 copies of your Protobuf library in memory. Keeping the bundle lean matters.

## Custom metrics for SignalR

k6 has built-in metrics for HTTP requests, but SignalR messages over WebSocket need custom tracking. We defined three metrics:

```typescript
export const signalRMessageCounter = new Counter("signalr_message");
export const signalRMessageResponseTime = new Trend("signalr_time");
export const serviceErrorCounter = new Counter("service_errors");
```

- **signalr_message** counts every outgoing SignalR invocation, tagged by method name
- **signalr_time** tracks round-trip time from sending an invocation to receiving the server's `Completion` response
- **service_errors** counts application-level errors returned by the server, tagged by error code and method

The response time tracking works by storing the timestamp when an invocation is sent (keyed by invocation ID), then computing the delta when the corresponding `Completion` message arrives:

```typescript
case MessageType.Completion: {
  const timing = this.invocationTimings.get(message.invocationId);
  if (!timing) break;

  const responseTime = Date.now() - timing.start;
  this.invocationTimings.delete(message.invocationId);
  signalRMessageResponseTime.add(responseTime, { Method: timing.method });
  break;
}
```

To see these metrics broken down by method in k6's output, you need to declare thresholds for each tag value — k6's sub-metric support requires it:

```typescript
thresholds: {
  "signalr_time{Method:PostNewTile}": ["avg>=0"],
  "signalr_time{Method:PostTilePropertyUpdated}": ["avg>=0"],
  "signalr_time{Method:PostTileBatchAction}": ["avg>=0"],
  // ...
}
```

The `avg>=0` threshold is a no-op — it always passes. It's only there so k6 reports the sub-metric in the results.

## Token refresh during long-running connections

WebSocket connections in load tests can run for the entire test duration (15+ minutes in our case). Auth tokens expire before that, so we set up a periodic refresh using `setInterval`:

```typescript
const intervalId = setInterval(() => {
  dataWithRefreshedToken.credentials = refreshToken(
    dataWithRefreshedToken.credentials.RefreshToken
  );
}, REFRESH_TOKEN_INTERVAL); // 9 minutes

socket.addEventListener("close", () => {
  clearInterval(intervalId);
});
```

The refreshed token is stored in a mutable clone of the user data, so subsequent API calls (like file uploads, which use HTTP alongside the WebSocket) pick up the new token automatically.

## Conclusions

Writing a custom SignalR client sounds like a lot of work, but the protocol itself is surprisingly straightforward once you look past the official library's abstractions. The text handshake, the `0x1E` record separator, the MessagePack framing — it's all well-documented and predictable. The library adds complexity for features like reconnection, streaming, and long polling fallback that a load test simply doesn't need.

The dual serialization layer (Protobuf inside MessagePack) was the trickiest part. Getting protobufjs to cooperate with k6's runtime required Webpack patching, and the `codec.verify()` step proved invaluable for catching serialization bugs before they turned into cryptic server-side errors. If your SignalR setup also uses Protobuf, invest in validating messages client-side — it saves a lot of debugging time.

One thing to watch out for: k6's VM-per-VU model means every large dependency gets duplicated across virtual users. Protobuf definitions, test data, and the SignalR protocol library all get copied per VU. Profile memory usage early if you're targeting hundreds of concurrent users.

Overall, the custom client gave us exactly what we needed: accurate per-method response times, Protobuf-aware message encoding, and a lean implementation focused purely on measuring server performance rather than handling client-side resilience.
