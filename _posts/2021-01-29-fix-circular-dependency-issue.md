---
title: Fix Circular Dependency issue
categories: [Programming,Web,Angular]
tags: [Programming,Web,Angular]
---

[https://www.notion.so/Fix-Circular-Dependency-issue-bc1a435aa1e043a791a73b044fe5e35d](https://www.notion.so/Fix-Circular-Dependency-issue-bc1a435aa1e043a791a73b044fe5e35d)


```typescript
@Injectable({
  providedIn: 'root',
})
export class AppService {
	
	constructor(
    private injector: Injector,
    // public status: StatusService, // do not do it if this leads to circular dependency issue
  ) { }

  // use below instead
  getStatusSerice() {
    return this.injector.get<StatusSerice>(StatusSerice);
  }
}
```

