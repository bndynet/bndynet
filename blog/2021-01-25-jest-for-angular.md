---
title: 'Jest - For Angular'
slug: 'jest-for-angular'
date: 2021-01-25
tags: ['Frontend', 'Testing']
notion_url: 'https://app.notion.com/p/Jest-For-Angular-9c4819ab017847e7b1b8b62376707644'
---

[Open in Notion](https://app.notion.com/p/Jest-For-Angular-9c4819ab017847e7b1b8b62376707644)


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


