---
layout: page
title:  "Manually start angularjs"
teaser: "```"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

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

<!--more-->

## Other Post Formats
{: .t60 }
{% include list-posts tag='post format' %}
