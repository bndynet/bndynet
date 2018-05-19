---
layout: page
title:  "Manually start angularjs"
teaser: "How to start angularjs App manually?"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

How to start angularjs App manually?

```
(function() {
	// Get Angular's $http module.
	var initInjector = angular.injector(['ng']);
	var $http = initInjector.get('$http');

	// Get user info.
	$http.get('/user-info').then(
		function(success) {

			// Define a 'userInfo' module.
			angular.module('userInfo', []).constant('userInfo', success.data);

			// Start myAngularApp manually.
			angular.element(document).ready(function() {
				angular.bootstrap(document, ['myApp']);
			});
		});
})();
```

