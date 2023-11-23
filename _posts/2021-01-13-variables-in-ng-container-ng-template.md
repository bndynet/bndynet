---
title: Variables in ng-container/ng-template
categories: [Programming,Web,Angular,Programming,Web,Programming,Web,Angular]
tags: [Programming,Web,Angular,Programming,Web,Programming,Web,Angular]
---

[https://www.notion.so/Variables-in-ng-container-ng-template-fab1314c12924d5aa22de15db7844efd](https://www.notion.so/Variables-in-ng-container-ng-template-fab1314c12924d5aa22de15db7844efd)


```html
<div>
  <ng-container *ngTemplateOutlet="viewTemplate; content: {$implicit: {name: 'Bing'}}"></ng-container>
</div>
```


```typescript
@Component({
	selector: 'sub',
})
export class SubComponent {
	@Input() viewTemplate: TemplateRef<any>;
}
```


[bookmark](https://github.com/bndynet/admin-template-for-angular/commit/09011c75c8dea32587da7b9ec165be09464366dd#diff-22cfe42d7a06213fc0744e4e5e8fa39cc35dd79d1f47d918177ae3cbd3200c1d)


## How to use:


```html
<sub [viewTemplate]="view"></sub>

<ng-template #view let-data>
   Your name {{data.name}}
</ng-template>
```


[bookmark](https://github.com/bndynet/admin-template-for-angular/commit/09011c75c8dea32587da7b9ec165be09464366dd#diff-99612febf80a60dd4efdb8a276ca6f6e450f7848794ccaf6d88dc846ba086bcd)

