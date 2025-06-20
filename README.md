# signal-rest-ts

## About

[**signal-rest-ts**](https://npmjs.com/package/signal-rest-ts) is a TypeScript wrapper around [signal-cli-rest-api](https://github.com/bbernhard/signal-cli-rest-api). It can be used in TypeScript or JavaScript based projects, both as a module and in a browser.

## Installation

```sh
npm install signal-rest-ts
```

## Usage

### Notes

In order to use the Receive service, **signal-cli-rest-api** should be ran in `json-rpc` mode.

### As a module

#### Get all group metadata, for all accounts

```ts
import { SignalClient } from "signal-rest-ts";

const getAllGroups = async () => {
  const signal = new SignalClient("http://localhost:8080");
  const accounts = await signal.account().getAccounts();

  const groups = await Promise.all(
    accounts.map(async (a) => {
      return await signal.group().getGroups(a);
    });
  );

  console.log(groups);
};
```

#### Send a message to a user

```ts
import { SignalClient } from "signal-rest-ts";

const sendMeAMessage = async () => {
  const signal = new SignalClient("http://localhost:8080");
  const accounts = await signal.account().getAccounts();

  const msg = await signal.message().sendMessage({
    number: accounts[0],
    message: "This is an automated message!",
    recipients: ["+1234567890"],
  });
};
```

#### Reply to messages matching a regular expression

```typescript
const signal = new SignalClient("http://localhost:8080");
const accounts = await signal.account().getAccounts();

signal.receive().registerHandler(accounts[0], /^(ha){2,}/, async (context) => {
  console.log(context.sourceUuid + " -> " + context.message);
  context.reply("What's so funny?");
});

signal.receive().startReceiving(accounts[0]);
```

#### Working across all accounts

If your handler should run across all accounts associated to the API, you will want to set a handler for each account. You will also want to "start receiving" for each account. Each account's messages are listened to using a separate WebSocket.

```typescript
accounts.forEach((account) => {
  signal.receive().registerHandler(account, /^\!command/, async (context) => {
    // ...
  });
  signal.receive().startReceiving(account);
}
```

#### Exiting Cleanly

It may be smart to clean up open [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API). Or if your application keeps running it may be because they are open. You can close all sockets using `ReceiveService#stopAllReceiving()`.

For example, in a Node-based application:

```typescript
process.on("SIGINT", () => {
  signal.receive().stopAllReceiving();
});
```

### DOM

#### Target

A version of the library bundled for the DOM is built to `dist/signal-web.js` in the default build script. This can be included using a script tag.

```html
<script type="text/javascript" src="signal-web.js"></script>
```

This will add `window.SignalClient` which exports the SignalClient class and can be instantiated to access the underlying services, as in the examples above.

#### CORS

Note that you will have to properly configure [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), since requests to the endpoint are almost certainly going to be cross-origin.

For example, [nginx](https://nginx.org) can be configured to serve permissive CORS headers. Note this example is **not secure**. Hardening is left as an exercise for the user.

```nginx
location ~/signal-api/(.*)$ {
  proxy_pass http://10.0.0.1:8080/$1$is_args$args;
  add_header 'Access-Control-Allow-Origin' '*';
  add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
  add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
  add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';
}
```

## Contributions

Contributions are welcome.

## License

Released as-is under MIT license with no warranties
