---
title: AngularJS with TypeScript
categories: [Programming,Web,Angular,Programming,Web,Programming,Web,Angular]
tags: [Programming,Web,Angular,Programming,Web,Programming,Web,Angular]
---

[https://www.notion.so/AngularJS-with-TypeScript-80e90b81b7114807aac19e569982e7ca](https://www.notion.so/AngularJS-with-TypeScript-80e90b81b7114807aac19e569982e7ca)


## Components


```typescript
class HerosComponentController implements ng.IComponentController {
  public static $inject = ['$log', '$scope', '$document', '$element'];
  public title: string;
  public heros: IHero[];
  public onItemSelect: any;

  constructor(
    private $log: ng.ILogService,
    private $scope: ng.IScope,
    private $document: ng.IDocumentService,
    private $element: ng.IRootElementService,
  ) { }

  public $onInit () { }
  
  public $onChanges(changes: angular.IOnChangesObject): void { }
  
  public selectItem(item: IHero, event: any) {
    if (this.onItemSelect && typeof this.onItemSelect === 'function') {
      this.onItemSelect({
        data: item,
      });
    }
  }
}

class HerosComponent implements ng.IComponentOptions {

  public controller: ng.Injectable<ng.IControllerConstructor>;
  public controllerAs: string;
  public template: string;
  public bindings: any;

  constructor() {
    this.controller = HerosComponentController;
    this.controllerAs = "$ctrl";
    this.template = `
      <ul>
        <li>{{$ctrl.title}}</li>
        <li ng-click="$ctrl.selectItem(hero, $event)" ng-repeat="hero in $ctrl.heros">{{ hero.name }}</li>
      </ul>
    `;
    this.bindins = {
      title: '@',
      heros: '<',
      onItemSelect: '&',
    };
  }
}

angular
  .module("mySuperAwesomeApp", [])
  .component("heros", new HerosComponent());

angular.element(document).ready(function() {
  angular.bootstrap(document, ["mySuperAwesomeApp"]);
});
```


```html
<heros title="Title" heros="$ctrl.heros" on-item-select="$ctrl.select(data)"></heros>
```

