---
title: Service Provided in a Lazy Loaded Module
categories: [Programming,Web,Angular]
tags: [Programming,Web,Angular]
---

[https://www.notion.so/Service-Provided-in-a-Lazy-Loaded-Module-dc374704420544949184666dfef1b65b](https://www.notion.so/Service-Provided-in-a-Lazy-Loaded-Module-dc374704420544949184666dfef1b65b)


[https://angular.io/guide/ngmodule-faq#why-is-a-service-provided-in-a-lazy-loaded-module-visible-only-to-that-module](https://angular.io/guide/ngmodule-faq#why-is-a-service-provided-in-a-lazy-loaded-module-visible-only-to-that-module)


Unlike providers of the modules loaded at launch, providers of lazy-loaded modules are _module-scoped_.


When the Angular router lazy-loads a module, it creates a new execution context. That [context has its own injector](https://angular.io/guide/ngmodule-faq#q-why-child-injector), which is a direct child of the application injector.


The router adds the lazy module's providers and the providers of its imported NgModules to this child injector.


These providers are insulated from changes to application providers with the same lookup token. When the router creates a component within the lazy-loaded context, Angular prefers service instances created from these providers to the service instances of the application root injector.

