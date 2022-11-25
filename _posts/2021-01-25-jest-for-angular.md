---
title: Jest - For Angular
categories: [Programming,Testing]
tags: [Programming,Testing]
---

[https://www.notion.so/Jest-For-Angular-9c4819ab017847e7b1b8b62376707644](https://www.notion.so/Jest-For-Angular-9c4819ab017847e7b1b8b62376707644)


```shell
npm i --dev jest jest-preset-angular @types/jest
```


You need to add this entry to package.json


```json
"jest": {
  "preset": "jest-preset-angular",
  "setupFilesAfterEnv": ["<rootDir>/src/setupJest.ts"]
}
```


You’re now ready to add this to your npm scripts:


```json
"test": "jest",
"test:watch": "jest --watch",
```


Oh, one more thing. Forget about installing PhantomJS on your CI:


```json
"test:ci": "jest --runInBand",
```

