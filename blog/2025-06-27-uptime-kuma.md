---
title: 'Uptime Kuma'
slug: 'uptime-kuma'
date: 2025-06-27
tags: ['DevOps', 'Monitoring Tools']
notion_url: 'https://app.notion.com/p/Uptime-Kuma-21f1a3b433fe80b1b3dfcda80e16a2be'
---

[Open in Notion](https://app.notion.com/p/Uptime-Kuma-21f1a3b433fe80b1b3dfcda80e16a2be)


## Run in Docker


```shell
docker run -d \
	--name uk \
	--restart=unless-stopped \
	-p 8010:3001 \
	-v ~/uptime-kuma-data:/app/data \
	louislam/uptime-kuma:1
```


