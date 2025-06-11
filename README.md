# signal-rest-ts

## About

**signal-rest-ts** is a typescript wrapper around [signal-cli-rest-api](https://github.com/bbernhard/signal-cli-rest-api). It can be used in TypeScript or JavaScript based projects, both as a module and in a browser.

## Installation

```sh
npm install signal-rest-ts
```

## Usage

### Get all group metadata, for all accounts

```ts
import { SignalClient } from "signal-rest-ts";

const getAllGroups = async () => {
  const signal = new SignalClient("http://localhost:8080");
  const accounts = await signal.account().getAccounts();

  const groups = await Promise.all(
    accounts.map(async (a) => {
      return await signal.group().getGroups(a);
    }),
  );

  console.log(groups);
};
```

### Send a message to a user

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

## License

Released under MIT license
