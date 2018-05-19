---
layout: page
title:  "OPTION method in CORS"
teaser: "SOURCE: [https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe](https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe)"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

SOURCE: [https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe](https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe)

### How to avoid the CORS preflight

The code in the question triggers a CORS preflight—since it sends an Authorization header.

https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Preflighted_requests

Even without that, the Content-Type: application/json header would also trigger the preflight.

What “preflight” means: before the browser tries the POST in the code in the question, it’ll first send an OPTIONS request to server, in order to determine if the server is opting-in to receiving a cross-origin POST that includes the Authorization and Content-Type: application/json headers.

It works pretty well with a small curl script - I get my data.
To properly test with curl, you need to emulate the preflight OPTIONS request the browser sends:

curl -i -X OPTIONS -H "Origin: http://127.0.0.1:3000" \
    -H 'Access-Control-Request-Method: POST' \
    -H 'Access-Control-Request-Headers: Content-Type, Authorization' \
    "https://the.sign_in.url"
…with https://the.sign_in.url replaced by whatever your actual sign_in URL is.

The response the browser needs to see from that OPTIONS request must include headers like this:

Access-Control-Allow-Origin:  http://127.0.0.1:3000
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Content-Type, Authorization
If the OPTIONS response doesn’t include those headers, then the browser will stop right there and never even attempt to send the POST request. Also, the HTTP status code for the response must be a 2xx—typically 200 or 204. If it’s any other status code, the browser will stop right there.

The server in the question is responding to the OPTIONS request with a 501 status code, which apparently means it’s trying to indicate it doesn’t implement support for OPTIONS requests. Other servers typically respond with a 405 “Method not allowed” status code in this case.

So you’re never going to be able to make POST requests directly to that server from your frontend JavaScript code if the server responds to that OPTIONS request with a 405 or 501 or anything other than a 200 or 204 or if doesn’t respond with those necessary response headers.

#### The way to avoid triggering a preflight for the case in the question would be:

- if the server didn’t require an Authorization request header but instead (for example) relied on authentication data embedded in the body of the POST request or as a query parameter
- if the server didn’t require the POST body to have a Content-Type: application/json media type but instead accepted the POST body as application/x-www-form-urlencoded with a parameter named json (or whatever) whose value is the JSON data

