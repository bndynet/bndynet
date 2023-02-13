---
title: Node.js Installations
categories: [CI and CD]
tags: [CI and CD]
---

[https://www.notion.so/Node-js-Installations-5f60b844b7814b7cb5413147c27f8fa8](https://www.notion.so/Node-js-Installations-5f60b844b7814b7cb5413147c27f8fa8)


# CentOS 7


```shell
curl -sL https://rpm.nodesource.com/setup_12.x | sudo bash -
sudo yum install nodejs
node --version
```


# Install NVM


```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
nvm --version.  # restart terminal
nvm install node

nvm install --lts
nvm install 8.12.0
nvm ls
nvm use 10.13.0
nvm alias default 10.13.0
nvm ls-remote
```


# Install development tools


To be able to build native modules from npm we will need to install the development tools and libraries:


```shell
sudo yum install gcc-c++ make
```

