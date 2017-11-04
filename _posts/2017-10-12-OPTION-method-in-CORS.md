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

The server in the question is responding to the OPTIONS requ

<!--more-->

## Other Post Formats
{: .t60 }
{% include list-posts tag='post format' %}
