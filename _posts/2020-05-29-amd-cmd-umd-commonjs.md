---
title: AMD、CMD、UMD、CommonJS
categories: [Programming,Web,JavaScript]
tags: [Programming,Web,JavaScript]
---

[https://www.notion.so/AMD-CMD-UMD-CommonJS-69d826713a6748608fc35f9a692e2d12](https://www.notion.so/AMD-CMD-UMD-CommonJS-69d826713a6748608fc35f9a692e2d12)


# AMD（Asynchromous Module Definition)


Asynchronous Module Definition (AMD) has gained traction on the frontend, with RequireJS being the most popular implementation.


Here’s module `foo` with a single dependency on `jquery`:


```javascript
// filename: foo.js
define(['jquery'], function ($) {
  // methods
  function myFunc(){};

  // exposed public methods
  return myFunc;
});

```


And a little more complicated example with multiple dependencies and multiple exposed methods:


```javascript
// filename: foo.js
define(['jquery', 'underscore'], function ($, _) {
  // methods
  function a(){};    //    private because it's not returned (see below)
  function b(){};    //    public because it's returned
  function c(){};    //    public because it's returned

  // exposed public methods
  return {
    b: b,
    c: c
  }
});
```


# CMD（Common Module Definition)


Standard locates at https://github.com/seajs/seajs/issues/242. It keeps more compatibilities with **CommonJS** and **Node.js** Modules.

- Published by Chinese people who is developing SeaJS.
- It is like **AMD**.

```javascript
define((require, exports, module) => {
  module.exports = {
    fun1: () => {
      var $ = require('jquery');
      return $('#test');
    }
  };
});

```


# CommonJS


CommonJS is a style you may be familiar with if you’re written anything in **Node** (which uses a slight variant). It’s also been gaining traction on the frontend with Browserify.


Using the same format as before, here’s what our `foo` module looks like in CommonJS:


```javascript
// filename: foo.js

// dependencies
var $ = require('jquery');

// methods
function myFunc(){};

// exposed public method (single)
module.exports = myFunc;
```


And our more complicate example, with multiple dependencies and multiple exposed methods:


```javascript
// filename: foo.js
var $ = require('jquery');
var _ = require('underscore');

// methods
function a(){};    //    private because it's omitted from module.exports (see below)
function b(){};    //    public because it's defined in module.exports
function c(){};    //    public because it's defined in module.exports

// exposed public methods
module.exports = {
  b: b,
  c: c
};
```


# UMD（Universal Module Definition)


Since CommonJS and AMD styles have both been equally popular, it seems there’s yet no consensus. This has brought about the push for a “universal” pattern that supports both styles, which brings us to none other than the Universal Module Definition.


The pattern is admittedly ugly, but is both AMD and CommonJS compatible, as well as supporting the old-style “global” variable definition:


```javascript
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node, CommonJS-like
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals (root is window)
    root.returnExports = factory(root.jQuery);
  }
}(this, function ($) {
    // methods
    function myFunc(){};

    // exposed public method
    return myFunc;
}));
```


And keeping in the same pattern as the above examples, the more complicated case with multiple dependencies and multiple exposed methods:


```javascript
(function (root, factory) {
  if (typeof define === 'function' &amp;&amp; define.amd) {
    // AMD
    define(['jquery', 'underscore'], factory);
  } else if (typeof exports === 'object') {
    // Node, CommonJS-like
    module.exports = factory(require('jquery'), require('underscore'));
  } else {
    // Browser globals (root is window)
    root.returnExports = factory(root.jQuery, root._);
  }
}(this, function ($, _) {
  // methods
  function a(){};    //    private because it's not returned (see below)
  function b(){};    //    public because it's returned
  function c(){};    //    public because it's returned

  // exposed public methods
  return {
    b: b,
    c: c
  }
}));
```

