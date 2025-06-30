---
title: Jest - Issues
categories: [Frontend,Testing]
tags: [Frontend,Testing]
---

[https://www.notion.so/Jest-Issues-831d928ced3b451e9d2c8a264ada0f7e](https://www.notion.so/Jest-Issues-831d928ced3b451e9d2c8a264ada0f7e)


## Configurations for DOM Support


Use `document` object and methods like `document.querySelectorAll`…


**_setup.ts**


```typescript
import "jsdom-global/register";
```


**jest.config.js**


```javascript
module.exports = {
  verbose: true,
  transform: {
    ".(ts|tsx)": "<rootdir>/node_modules/ts-jest/preprocessor.js",
    ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub",
  },
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  setupTestFrameworkScriptFile: "./test/_setup.ts",
  moduleFileExtensions: ["ts", "tsx", "js"],
  coveragePathIgnorePatterns: ["/node_modules/", "/test/", "src/index.ts"],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  collectCoverageFrom: ["src/**/*.{js,ts,tsx}"],
};
```


## UT Example for Promise


```typescript
// ut passed requires `done` called
it("should return a promise with callback and title", done => {
  confirm("Promise confirm").then(() =&gt; {
    done();
  });
  document.querySelectorAll<htmlelement>(".btn")[1].click();
});

// reject promise
it("test reject promise", async () => {
  // do not use `Promise.reject`, because returns Promise immediately
  const mockP = jest.fn(() => Promise.reject("err"));
  await delay(1, mockP()).catch(() => {
    // nothing
  });
  expect(mockP.mock.calls.length).toBe(1);
});
```

