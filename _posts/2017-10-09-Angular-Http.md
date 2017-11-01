---
layout: page
title:  "Angular Http"
teaser: "Call multipal http requests"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

## Call multipal http requests

Need to run a series of HTTP calls, and wait for them all to complete? Use $q.all.

This won’t work:

```
for(var i = 0; i < 5; i++) {
	$http.get('/data' + i);
}
// At this point, all the requests will have fired...
// But probabaly, none of them have finished
```
Do this instead:
```
var promises = [];
for(var i = 0; i < 5; i++) {
	var promise = $http.get('/data' + i);
	promises.push(promise);
}
$q.all(promises).then(doSomethingAfterAllRequests);
```

Run the promsies in order (not in parallel)

When you queue up promises like above, they all start at the same time. But what if you want them to run in the order you called them?

You can build up a chain of promises:
```
var chain = $q.when();
for(var i = 0; i < 5; i++) {
	chain = chain.then(function() {
		return $http.get('/data' + i);
	});
}

// This is the same as:
chain = $q.when();
chain.then(function() {
			return $http.get('/data1');
		}).then(function() {
			return $http.get('/data2');
		}).then(function() {
			return $http.get('/data3');
		}).then(function() {
			return $http.get('/data4');
		}).then(function() {
			return $http.get('/data5');
		});
```
$q.when is used to kick off the chain with a resolved promise.

<!--more-->

## Other Post Formats
{: .t60 }
{% include list-posts tag='post format' %}
