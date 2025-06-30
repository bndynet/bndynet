---
title: Docker Usage
categories: [DevOps,CI and CD]
tags: [DevOps,CI and CD]
---

[https://www.notion.so/Docker-Usage-c50b9e8cc6ad48899e2c0ff488f271f0](https://www.notion.so/Docker-Usage-c50b9e8cc6ad48899e2c0ff488f271f0)


```shell
docker build -t <image-name> --build-arg YOUR_ARG="<arg-value>" .

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
## copy files from container into host which does not need a running container
docker cp your-file-path-in-container your-host-location

# Publish
docker build -t bndynet/image-name:1.0 .
docker push bndynet/image-name:1.0
```


## Networking


[bookmark](https://docs.docker.com/network/)


```shell
# bridge: The default network driver
# host: use the host’s networking directly
docker --network bridge|host|overlay|ipvlan
```


## Change the port for the existing container


You can change the port mapping by directly editing the `hostconfig.json` file at `/var/lib/docker/containers/[hash_of_the_container]/hostconfig.json` or `/var/snap/docker/common/var-lib-docker/containers/[hash_of_the_container]/hostconfig.json`, I believe, if You installed Docker as a snap.


You can determine the [hash_of_the_container] via the `docker inspect <container_name>` command and the value of the "Id" field is the hash.

1. Stop the container (`docker stop <container_name>`).
2. Stop docker service (per Tacsiazuma's comment)
3. Change the file.
4. Restart your docker engine (to flush/clear config caches).
5. Start the container (`docker start <container_name>`).

## Clear


```shell
	docker system df   # show disk space about docker
	docker image prune -f # clear all images which is not used
```


## Print Logs


```shell
# print the log for container
docker logs -f <container-name> 1>/dev/null
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

