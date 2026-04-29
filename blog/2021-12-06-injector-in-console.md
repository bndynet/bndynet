---
title: 'Injector in Console'
slug: 'injector-in-console'
date: 2021-12-06
tags: ['Frontend', 'Angular']
notion_url: 'https://app.notion.com/p/Injector-in-Console-f1cf7162406843329c29f78f035b8714'
---

[Open in Notion](https://app.notion.com/p/Injector-in-Console-f1cf7162406843329c29f78f035b8714)


```javascript
// Get the injector
var injector = angular.element($0/*'[data-ng-app], [ng-app]'*/).injector();
// Get the service
var service = injector.get('Service');
```


