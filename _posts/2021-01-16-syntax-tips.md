---
title: Syntax Tips
categories: [Frontend,JavaScript]
tags: [Frontend,JavaScript]
---

[https://www.notion.so/Syntax-Tips-17687191d3c04a8baa7136d0a2dec309](https://www.notion.so/Syntax-Tips-17687191d3c04a8baa7136d0a2dec309)


## ?? and ||


```shell
a || b    // equals: a ? a : b
a ?? b    // equals: a != undefined && a != null ? a : b
!''       // output: true
0 ?? 'a'  // output: 0
0 || 'a'  // output: "a"
'' ?? 'a' // output: ""
'' || 'a' // output: "a"
```


## **call**, **apply, bind**


These methods can change the **this** point.


```shell
function test(arg1, arg2) {};

test.call(null, a1, a2);
test.apply(null, [a1, a2]);

var t = test.bind(null);
t();
```

