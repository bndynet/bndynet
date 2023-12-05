---
title: Global Error Handling
categories: [Programming,Web,Angular]
tags: [Programming,Web,Angular]
---

[https://www.notion.so/Global-Error-Handling-4d1b704ef32742f69d816df19962e72a](https://www.notion.so/Global-Error-Handling-4d1b704ef32742f69d816df19962e72a)


## global-error-handler.ts


```typescript
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, NgZone } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor() {}

  public handleError(error: any): void {
    // Check if it's an error from an HTTP response
    const isServerError = error instanceof HttpErrorResponse;

    if (!isServerError) {
       // TODO
    }

    console.error('Error from Global Error Handler', error);
  }
}
```


## app.module.ts


```typescript
@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

