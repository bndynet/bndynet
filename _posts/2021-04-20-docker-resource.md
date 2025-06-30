---
title: Docker Resource
categories: [DevOps,CI and CD]
tags: [DevOps,CI and CD]
---

[https://www.notion.so/Docker-Resource-1c78fd7b5d8f411a8526bca6a6b67e39](https://www.notion.so/Docker-Resource-1c78fd7b5d8f411a8526bca6a6b67e39)


# Node.js


```shell
docker pull node:14
docker pull node:<version>-alpine
docker pull node:<version>-slim

docker run --rm -v "$PWD":/home/node/app -w /home/node/app -it node:14-slim /bin/bash -c "npm build"
```

