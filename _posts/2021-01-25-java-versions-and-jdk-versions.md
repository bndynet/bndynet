---
title: Java Versions and JDK Versions
categories: [Programming,Java]
tags: [Programming,Java]
---

[https://www.notion.so/Java-Versions-and-JDK-Versions-9278629bc95b4dbd94153c4a29e514ca](https://www.notion.so/Java-Versions-and-JDK-Versions-9278629bc95b4dbd94153c4a29e514ca)


## Versions and JDK


| **Java SE Version** | J**DK Version** | **Class Version** | **Released Date**    |
| ------------------- | --------------- | ----------------- | -------------------- |
| Java SE 6 (Mustang) | 1.6             | 50                | December 2006        |
| Java SE 7 (Dolphin) | 1.7             | 51                | July 2011            |
| Java SE 8           | 1.8             | 52                | March 2014           |
| Java SE 9           | 9               | 53                | September, 21st 2017 |
| Java SE 10          | 10              | 54                | March, 20th 2018     |
| Java SE 11          | 11              | 55                | September, 25th 2018 |


## Install on CentOS


```shell
yum list *openjdk*
yum install java-<version here>-openjdk    # e.g java-11-openjdk
update-alternatives --config java    # choose the default java version
java -version
```


## Install via sdkman


```shell
curl -s https://get.sdkman.io | bash
```


```shell
sdk list java
sdk install java <version>  // for example `sdk install java 11.0.12-open`

sdk current
sdk current java
```

