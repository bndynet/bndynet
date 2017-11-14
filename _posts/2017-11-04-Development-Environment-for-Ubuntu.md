---
layout: page
title:  "Development Environment for Ubuntu"
teaser: "Steps to set up environments on Ubuntu for frontend development and backend development."
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

Steps to set up environments on Ubuntu for frontend development and backend development.

## Install Git

1. `sudo apt-get update`
1. `apt-get install git`

## Install NVM & NodeJS(NPM)

1. `sudo apt-get install curl`
1. `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash`
1. `source ~/.bashrc`
1. *`vi ~/.bashrc` to add `export NVM_NODEJS_ORG_MIRROR=http://npm.taobao.org/mirrors/node` under `export NVM_DIR="$HOME/.nvm"`*
1. `nvm install <version>`
1. `npm install -g cnpm --registry=https://registry.npm.taobao.org` or

    ```shell
    alias cnpm="npm --registry=https://registry.npm.taobao.org \
    --cache=$HOME/.npm/.cache/cnpm \
    --disturl=https://npm.taobao.org/dist \
    --userconfig=$HOME/.cnpmrc"

    # Or alias it in .bashrc or .zshrc
    $ echo '\n#alias for cnpm\nalias cnpm="npm --registry=https://registry.npm.taobao.org \
      --cache=$HOME/.npm/.cache/cnpm \
      --disturl=https://npm.taobao.org/dist \
      --userconfig=$HOME/.cnpmrc"' >> ~/.zshrc && source ~/.zshrc
    ```
  
## Install Docker
  
1. `sudo apt-get install docker.io`
1. Use case: the China registry mirror

    The URL of the registry mirror for China is registry.docker-cn.com. You can pull images from this mirror just like you do for other registries by specifying the full path, including the registry, in your docker pull command, for example:

    `$ docker pull registry.docker-cn.com/library/ubuntu`

    You can add "https://registry.docker-cn.com" to the registry-mirrors array in /etc/docker/daemon.json to pull from the China registry mirror by default.
  
      `{"registry-mirrors": ["https://registry.docker-cn.com"] }`

    Save the file and reload Docker for the change to take effect.Or, you can configure the Docker daemon with the --registry-mirror startup parameter:

    `$ dockerd --registry-mirror=https://registry.docker-cn.com`

<!--more-->

## Other Post Formats
{: .t60 }
{% include list-posts tag='post format' %}
