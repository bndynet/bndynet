---
title: Events of Component
categories: [Frontend,Angular,Frontend,Angular]
tags: [Frontend,Angular,Frontend,Angular]
---

[https://www.notion.so/Events-of-Component-6f325676e5404b5fa600213ceef23d3e](https://www.notion.so/Events-of-Component-6f325676e5404b5fa600213ceef23d3e)


## Outside Click


```javascript
import { Directive, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
})
export class ClickOutsideDirective {

  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event.target'])
  public onClick(target) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
```


```html
<div (clickOutside)="someHandler()"></div>
```


## Keydown of Component


```javascript
  @HostListener('document: keydown', ['$event'])
  public onEnter(event: KeyboardEvent): void {
    if (this.elementRef.nativeElement.contains(event.target)) {
      if (event.code === 'Enter') {
        // TODO:
      }
    }
  }
```


## ‼️Tips


If the element contains ***ngIf**, **this.overlay.nativeElement.contains(event.target);**  always return false. Because of the angular directive *ngIf


```html
<div #overlay>
	<div *ngIf="show" class="item">
		Click here
  </div>
</div>
```


```javascript
@ViewChild('overlay', { static: false }) overlay: ElementRef;

//...
this.overlay.nativeElement.contains(event.target);  // always return false
```


How to solve it?  


You can check the **event.target**


```javascript
Object.keys(event.target.classList).includes('item');
```


Or use  **[hidden]** instead.


```javascript
	<div [hidden]="!show" class="item">
		Click here
  </div>
```

