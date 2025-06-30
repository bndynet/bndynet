---
title: Cache for HttpClient
categories: [Frontend,Angular,Frontend,Angular]
tags: [Frontend,Angular,Frontend,Angular]
---

[https://www.notion.so/Cache-for-HttpClient-0a73c261f9fc45b6b94d85d641a6be89](https://www.notion.so/Cache-for-HttpClient-0a73c261f9fc45b6b94d85d641a6be89)


```typescript
@Injectable()
class CacheInterceptor implements HttpInterceptor {
  private cache: Map<HttpRequest, HttpResponse> = new Map()
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    if(req.method !== "GET") {
        return next.handle(req)
    }
    if(req.headers.get("reset")) {
        this.cache.delete(req)
    }
    const cachedResponse: HttpResponse = this.cache.get(req)
    if(cachedResponse) {
        return of(cachedResponse.clone())
    }else {
        return next.handle(req).pipe(
            do(stateEvent => {
                if(stateEvent instanceof HttpResponse) {
                    this.cache.set(req, stateEvent.clone())
                }
            })
        ).share()
    }
  }    
}
```


According to above code, if you do not want to get the data from cache. you just pass a head parameter as below:


```typescript
public fetchDogs(reset: boolean = false) {
    return this.httpClient.get("api/dogs", new HttpHeaders({reset}))
}
```


And lastly, you must add the interceptor to module.


```typescript
@NgModule({
    ...
    providers: {
        provide: HTTP_INTERCEPTORS,
        useClass: CacheInterceptor,
        multi: true
    }
})
...
```

