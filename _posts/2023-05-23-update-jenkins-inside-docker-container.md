---
title: Update Jenkins inside Docker Container
categories: [DevOps,CI and CD]
tags: [DevOps,CI and CD]
---

[https://www.notion.so/Update-Jenkins-inside-Docker-Container-caffb7b2f92e4f0290dfe3cfb1f33def](https://www.notion.so/Update-Jenkins-inside-Docker-Container-caffb7b2f92e4f0290dfe3cfb1f33def)


First identify your image.


`$ docker ps --format "{{.ID}}: {{.Image}} {{.Names}}"3d2fb2ab2ca5: jenkins-docker jenkins-docker_1`


Then login into the image as root.


`$ docker container exec -u 0 -it jenkins-docker_1 /bin/bash`


Now you are inside the container, download the `jenkins.war` file from the official site like.


`# wget http://updates.jenkins-ci.org/download/war/2.176.1/jenkins.war`


Replace the version with the one that fits to you.


The next step is to move that file and replace the oldest one.


`# mv ./jenkins.war /usr/share/jenkins/`


Then change permissions.


`# chown jenkins:jenkins /usr/share/jenkins/jenkins.war`


The last step is to logout from the container and restart it.


`$ docker restart jenkins-docker_1`


You can verify that update was successful by access to you Jenkins url.

