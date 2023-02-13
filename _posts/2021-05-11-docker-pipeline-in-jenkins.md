---
title: Docker pipeline in Jenkins
categories: [CI and CD]
tags: [CI and CD]
---

[https://www.notion.so/Docker-pipeline-in-Jenkins-4f3dcdce9b2e4859a74f75550a2de892](https://www.notion.so/Docker-pipeline-in-Jenkins-4f3dcdce9b2e4859a74f75550a2de892)


Dockerfile


```docker
FROM jenkins/jenkins:lts
LABEL maintainer="Bendy Zhang <zb@bndy.net>"

USER root

# Install the latest Docker CE binaries and add user `jenkins` to the docker group
RUN apt-get update && \
    apt-get -y --no-install-recommends install apt-transport-https \
      ca-certificates \
      curl \
      gnupg2 \
      software-properties-common && \
    curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg > /tmp/dkey; apt-key add /tmp/dkey && \
    add-apt-repository \
      "deb [arch=amd64] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") \
      $(lsb_release -cs) \
      stable" && \
   apt-get update && \
   apt-get -y --no-install-recommends install docker-ce && \
   apt-get clean && \
   usermod -aG docker jenkins

# drop back to the regular jenkins user - good practice
USER jenkins

COPY --chown=jenkins:jenkins plugins.txt /usr/share/jenkins/ref/plugins.txt
#(Deprecated) RUN /usr/local/bin/install-plugins.sh < /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli -f /usr/share/jenkins/ref/plugins.txt
```


plugin.txt


```docker
credentials:latest
credentials-binding:latest
configuration-as-code:latest
docker-commons:latest
docker-workflow:latest
git:latest
github:latest
github-branch-source:latest
git-parameter:latest
git-changelog:latest

rebuild:latest
remote-file:latest
ssh-agent:latest
ssh-credentials:latest
ssh-slaves:latest
workflow-scm-step:latest
ws-cleanup:latest
```


Jenkinsfile


```shell
pipeline {
    agent {
        docker { image 'node:7-alpine' }
    }
    stages {
        stage('Test') {
            steps {
                sh 'node --version'
            }
        }
    }
}
```

