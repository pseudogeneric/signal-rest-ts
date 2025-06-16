# signal-rest-ts

## About

**signal-rest-ts** is a typescript wrapper around [signal-cli-rest-api](https://github.com/bbernhard/signal-cli-rest-api). It can be used in TypeScript or JavaScript based projects, both as a module and in a browser.

## Installation

```sh
npm install signal-rest-ts
```

## Usage

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

signal.receive().registerHandler(accounts[0], /^haha/, async (context) => {
  console.log(context.sourceUuid + " -> " + context.message);
  context.reply("What's so funny?");
});

signal.receive().startReceiving(accounts[0]);
```

### DOM

#### Target

A version of the library bundled for the DOM is built to `dist/signal-web.js` in the default build script. This can be included using a script tag.

```html
<script type="text/javascript" src="signal-web.js"></script>
```

This will add `window.SignalClient` which exports the SignalClient class and can be instantiated to access the underlying services, as in the examples above.

#### CORS

Note that you will have to properly configure CORS, since requests to the endpoint are almost certainly going to be cross-origin. This is left as an exercise for the user.

## Notes

In order to use the Receive service, **signal-cli-rest-api** should be ran in `json-rpc` mode.

## Contributions

Contributions are welcome.

## License

Released as-is under MIT license with no warranties
