---
layout: page
title:  "CI & CD in Docker"
teaser: "Jenkins in Docker"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

Jenkins in Docker

## SETUP

### Docker

#### [Install Docker](https://docs.docker.com/engine/installation/#supported-platforms)

#### [Deploy a registry server](https://docs.docker.com/registry/deploying/)
  
  > $ docker run -d -p 5000:5000 --restart=always --name registry registry:2
  
  Copy an image from Docker Hub to your registry
  
  > $ docker pull ubuntu:16.04
  
  > $ docker tag ubuntu:16.04 localhost:5000/my-ubuntu
  
  > $ docker push localhost:5000/my-ubuntu
  
  > $ docker image remove ubuntu:16.04
  
  > $ docker image remove localhost:5000/my-ubuntu
  
  > $ docker pull localhost:5000/my-ubuntu
  
  **[Run an externally-accessible registry](https://docs.docker.com/registry/deploying/#run-an-externally-accessible-registry)**

### [Jenkins](https://hub.docker.com/_/jenkins/)

  > $ docker pull jenkins
  
  > $ docker run --name myjenkins -p 8080:8080 -p 50000:50000 -v /var/jenkins_home jenkins
  
  Building Evironments
  
  > $ docker exec -it myjenkins bash
  > $ 
 

