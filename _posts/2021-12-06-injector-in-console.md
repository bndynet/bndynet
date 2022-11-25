---
title: Injector in Console
categories: [Programming,Angular]
tags: [Programming,Angular]
---

[https://www.notion.so/Injector-in-Console-f1cf7162406843329c29f78f035b8714](https://www.notion.so/Injector-in-Console-f1cf7162406843329c29f78f035b8714)


```javascript
// Get the injector
var injector = angular.element($0/*'[data-ng-app], [ng-app]'*/).injector();
// Get the service
var service = injector.get('Service');
```

