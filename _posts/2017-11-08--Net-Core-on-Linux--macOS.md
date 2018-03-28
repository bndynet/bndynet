---
layout: page
title:  ".Net Core on Linux, macOS"
teaser: "Start .net core app on Ubuntu, Debian, CentOS and macOS"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

Start .net core app on Ubuntu, Debian, CentOS and macOS

## Ubuntu

1. Register the trusted Microsoft signature key and Microsoft Product feed:

    ```shell
    curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
    sudo mv microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg
    ```
  
    Microsoft Product feed

    - Ubuntu 17.10
  
        `sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-ubuntu-artful-prod artful main" > /etc/apt/sources.list.d/dotnetdev.list'`

    - Ubuntu 17.04

        `sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-ubuntu-zesty-prod zesty main" > /etc/apt/sources.list.d/dotnetdev.list'`

    - Ubuntu 16.04 / Linux Mint 18
  
    `sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-ubuntu-xenial-prod xenial main" > /etc/apt/sources.list.d/dotnetdev.list'`

    - Ubuntu 14.04 / Linux Mint 17

        `sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-ubuntu-trusty-prod trusty main" > /etc/apt/sources.list.d/dotnetdev.list'`

1. Install SDK and Run App

    ```shell
    sudo apt-get update
    sudo apt-get install dotnet-sdk-2.0.2

    dotnet new console -o myApp
    cd myApp

    dotnet run
    ```
    
## Debian

    ```shell
    sudo apt-get update
    sudo apt-get install curl libunwind8 gettext apt-transport-https

    curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
    sudo mv microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg

    //Debian 9
    sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-debian-stretch-prod stretch main" > /etc/apt/sources.list.d/dotnetdev.list'
    //Debian 8
    sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-debian-jessie-prod jessie main" > /etc/apt/sources.list.d/dotne

