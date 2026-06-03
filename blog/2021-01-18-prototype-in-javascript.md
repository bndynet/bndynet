---
title: 'Prototype in JavaScript'
slug: 'prototype-in-javascript'
date: 2021-01-18
tags: ['Frontend', 'JavaScript']
notion_url: 'https://app.notion.com/p/Prototype-in-JavaScript-f11c3f72963b480f8bf8822bbb134650'
---

[Open in Notion](https://app.notion.com/p/Prototype-in-JavaScript-f11c3f72963b480f8bf8822bbb134650)


All JavaScript objects inherit properties and methods from a prototype.

- `Date` objects inherit from `Date.prototype`
- `Array` objects inherit from `Array.prototype`
- `Person` objects inherit from `Person.prototype`

The `Object.prototype` is on the top of the prototype inheritance chain:


`Date` objects, `Array` objects, and `Person` objects inherit from `Object.prototype`


## Example


```javascript
function Person(first, last, age, eyecolor) {
  this.firstName = first;
  this.lastName = last;
  this.age = age;
  this.eyeColor = eyecolor;
}

Person.prototype.nationality = "English";

Person.prototype.name = function() {
  return this.firstName + " " + this.lastName;
};

var myFather = new Person("John", "Doe", 50, "blue");
var myMother = new Person("Sally", "Rally", 48, "green");
```


❗Please do not add a new property to an existing object constructor as below. That is a wrong way.


 


```javascript
Person.nationality = "English";
```


