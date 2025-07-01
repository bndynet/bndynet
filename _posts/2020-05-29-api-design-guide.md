---
title: API Design Guide
categories: [Standard]
tags: [Standard]
---

[https://www.notion.so/API-Design-Guide-5e2fb00ada4e4878ad6a45212f8425cd](https://www.notion.so/API-Design-Guide-5e2fb00ada4e4878ad6a45212f8425cd)


## Use RESTful service URLs


Under REST principles, a URL identifies a resource. The following URL design patterns are considered REST best practices:

- URLs should include nouns, not verbs.
- Use plural nouns only for consistency (no singular nouns).
- Use HTTP methods (HTTP/1.1) to operate on these resources:
- Use HTTP response status codes to represent the outcome of operations on resources.

## Response Http Status Code

- 200 OK
- 400 Bad Request
- 500 Internal Server Error

Other commonly seen codes include:

- 201 Created
- 204 No Content
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

## jQuery Ajax Request

- type: ‘GET’ —- dataType: ‘xml|json|script|text|html’ -> response http status code: 200 / 404
- type: ‘POST’ —– dataType: ‘xml|json’ -> response http status code: 201 (created) / 405 (Method Not Allowed)
- type: ‘PUT’ —— dataType: ‘xml|json’ -> response http status code: 200 / 404
- type: ‘DELETE’ —— if return 204, dataType should not be ‘json’ -> response http status code: 200 / 404

## Good RESTful URL examples


List of magazines:


```text
GET /api/v1/magazines.json HTTP/1.1
Host: www.example.gov.au
Accept: application/json, text/javascript

```


Filtering and sorting are server-side operations on resources:


```text
GET /api/v1/magazines.json?year=2011&amp;sort=desc HTTP/1.1
Host: www.example.gov.au
Accept: application/json, text/javascript

```


A single magazine in JSON format:


```text
GET /api/v1/magazines/1234.json HTTP/1.1
Host: www.example.gov.au
Accept: application/json, text/javascript

```


All articles in (or belonging to) this magazine:


```text
GET /api/v1/magazines/1234/articles.json HTTP/1.1
Host: www.example.gov.au
Accept: application/json, text/javascript

```


All articles in this magazine in XML format:


```text
GET /api/v1/magazines/1234/articles.xml HTTP/1.1
Host: www.example.gov.au
Accept: application/json, text/javascript

```


Specify query parameters in a comma separated list:


```text
GET /api/v1/magazines/1234.json?fields=title,subtitle,date HTTP/1.1
Host: www.example.gov.au
Accept: application/json, text/javascript

```


Add a new article to a particular magazine:


```text
POST /api/v1/magazines/1234/articles.json HTTP/1.1
Host: www.example.gov.au
Accept: application/json, text/javascript

```

