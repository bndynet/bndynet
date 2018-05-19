---
layout: page
title:  "Override AngularJS Filters"
teaser: "How to override angularjs existing fitlers?"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

How to override angularjs existing fitlers?

## Code

```javascript
angular.module('app',[])
  .config(['$provide', function($provide) {
    // For example: dateFilter
    $provide.decorator('filternameFilter', ['$delegate', function($delegate) {
      var srcFilter = $delegate;
      return function() {
        var result = srcFilter.apply(this, arguments);
        // NOTE:
        //  The arguments is an object formatted like {0: key, 1: args, ...}, not array.
        //  So you can get the first parameter by arguments[0] and so on.
        // TODO: here to change the result
        return result
      };
    }]);
  }]);

```

