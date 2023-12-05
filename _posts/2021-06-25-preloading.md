---
title: Preloading
categories: [Programming,Web,Angular]
tags: [Programming,Web,Angular]
---

[https://www.notion.so/Preloading-12f7f43c98504b218fd1ecb307b75272](https://www.notion.so/Preloading-12f7f43c98504b218fd1ecb307b75272)


# Lazy loading for modules


[https://angular.io/guide/lazy-loading-ngmodules#preloading-modules](https://angular.io/guide/lazy-loading-ngmodules#preloading-modules)


```typescript
import { PreloadAllModules } from '@angular/router';
RouterModule.forRoot(
  appRoutes,
  {
    preloadingStrategy: PreloadAllModules
  }
)
```


# Preloading component data


```typescript
import { Resolve } from '@angular/router';

...

/* An interface that represents your data model */
export interface Crisis {
  id: number;
  name: string;
}

export class CrisisDetailResolverService implements Resolve {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable {
    // your logic goes here
  }
}
```


```typescript
import { CrisisDetailResolverService } from './crisis-detail-resolver.service';
{
  path: '/your-path',
  component: YourComponent,
  resolve: {
    crisis: CrisisDetailResolverService
  }
}
```


```typescript
import { ActivatedRoute } from '@angular/router';

@Component({ ... })
class YourComponent {
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data
      .subscribe(data => {
        const crisis: Crisis = data.crisis;
        // ...
      });
  }
}
```


# Preloading Strategies


## **Available Preloading strategies**

- **Build-in preloading strategies** — NoPreloading (default) or PreloadAllModules.
- **Custom preloading strategies** — Preload after some time, preload based on network quality, load required modules first, frequently used second, and others lazy load/last.

## Preloading all the modules (PreloadAllModules)


## Custom preloading strategies


### app-routing.module.ts


```typescript
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CustomPreloadingStrategyService} from './custom-preloading-strategy.service';
const routes: Routes = [
  {path: 'about', data: {preload: true}, loadChildren: () => import('./about/about.module').then(m => m.AboutModule)},
  {path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UsersModule)},
  {path: '', redirectTo: '', pathMatch: 'full'}
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: CustomPreloadingStrategyService})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
```


### custom-preloading-strategy.service.ts


```typescript
import {Injectable} from '@angular/core';
import {PreloadingStrategy, Route} from '@angular/router';
import {Observable, of} from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CustomPreloadingStrategyService implements PreloadingStrategy {
preload(route: Route, fn: () => Observable<any>): Observable<any> {
    if (route.data && route.data.preload) {
	      return fn();  // Proceeds with preloading
    }
    return of(null);  // Proceeds without preloading
  }
}
```

