// src/service/tests/setup.ts
declare global {
  namespace NodeJS {
    interface Global {
      fetch: any;
    }
  }
}

global.fetch = jest.fn();
