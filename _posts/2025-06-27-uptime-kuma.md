---
title: Uptime Kuma
categories: [DevOps,Monitoring Tools]
tags: [DevOps,Monitoring Tools]
---

[https://www.notion.so/Uptime-Kuma-21f1a3b433fe80b1b3dfcda80e16a2be](https://www.notion.so/Uptime-Kuma-21f1a3b433fe80b1b3dfcda80e16a2be)


## Run in Docker


```shell
docker run -d \
	--name uk \
	--restart=unless-stopped \
	-p 8010:3001 \
	-v ~/uptime-kuma-data:/app/data \
	louislam/uptime-kuma:1
```

