---
title: 'healthchecks'
slug: 'healthchecks'
date: 2025-06-26
tags: ['DevOps', 'Monitoring Tools']
notion_url: 'https://app.notion.com/p/healthchecks-21e1a3b433fe807eb6f9e38046ceda75'
---

[Open in Notion](https://app.notion.com/p/healthchecks-21e1a3b433fe807eb6f9e38046ceda75)


## Running in Docker


 


```shell
docker run -d \
  --name=hc \
  -p 8010:8000 \
  --restart unless-stopped \
  -e DB=sqlite \
  -e DB_NAME=/data/hc.sqlite \
  -e DEBUG=False \
  -e SITE_ROOT=http://10.224.59.43:8010 \
  -v ~/healthchecks-data:/data \
healthchecks

docker exec -it hc /opt/healthchecks/manage.py createsuperuser
```


