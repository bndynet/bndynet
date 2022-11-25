---
title: Docker Usage
categories: [CI and CD]
tags: [CI and CD]
---

[https://www.notion.so/Docker-Usage-c50b9e8cc6ad48899e2c0ff488f271f0](https://www.notion.so/Docker-Usage-c50b9e8cc6ad48899e2c0ff488f271f0)


```shell
docker build -t <image-name> .

# -d: as deamon
# --rm: exit and remove
docker run -d -p 80:80 -p 443:443 --name <container-name> -v /opt/websites/app:/usr/share/nginx/html <image-name>

# enter the terminal
docker exec -it <container-name> /bin/bash

docker image remove <image-name>

docker container rm <container-name>


##
docker container rename <container-name> <new-container-name>
docker rm -f <container-name>

# build from github
docker build -t <image-name> https://github.com/bndynet/docker.nginx.git[#<branch/tag>:<dir-for-context>]


# Copy & Move 
## Export and import containers
docker export container-name | gzip > container-name.gz
zcat container-name.gz | docker import - container-name
## Container image migration - Using this method, the data volumes will not be migrated, but it preserves the data of the application created inside the container.
docker commit container-id image-name
## Save and load images
docker save image-name > image-name.tar
cat image-name.tar | docker load

# Publish
docker build -t bndynet/image-name:1.0 .
docker push bndynet/image-name:1.0
```


## Example:


```shell
IMAGE_NAME = "bndynet/nginx"
CONTAINER_NAME = "web"

docker rm -f $CONTAINER_NAME || true
docker image rm $IMAGE_NAME || true
docker build -t $IMAGE_NAME .

docker run -d -p 80:80 -p 443:443 --name $CONTAINER_NAME -v /opt/website:/usr/share/nginx/html -v /etc/ssl:/etc/ssl $IMAGE_NAME
```


## Mirrors


```json
{
  "registry-mirrors": [
    "https://registry.docker-cn.com",
    "http://hub-mirror.c.163.com",
    "https://docker.mirrors.ustc.edu.cn"
  ]
}
```

