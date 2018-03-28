---
layout: page
title:  "Publishing Repo to Maven Central"
teaser: "Deploy repo to Maven Central with gradle and maven."
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

Deploy repo to Maven Central with gradle and maven.

## Create an account on oss.sonatype.org
  
  Create an account and create an ISSUE about Repo. And waiting approved.

## Generate and share a PGP signature

  1. Installing GnuPG 
  
    `gpg --version`
    
  1. Generating a Key Pair and Sharing Key
  
    ```
    gpg --generate-key
    gpg --list-keys --keyid-format short
    gpg --list-secret-keys --keyid-format short
    gpg --keyserver hkp://pool.sks-keyservers.net --send-keys <pubkeyid>
    // gpg --keyserver hkp://pool.sks-keyservers.net --recv-keys <pubkeyid>
    ```
    Delete Key or Sub Key
    ```
    gpg2 --edit-key A6BAB25
    gpg> 1 
    gpg> save
    gpg> key 2
    gpg> delkey
    ```

## Local GPG

  1. Add `~/.gradle/gradle.properties` with following content:
  
  ```
  signing.keyId=<pubkeyid>
  signing.password=<passwordGPG>
  // For new version GPG, secring.gpg does not be used.
  // But you can still use `gpg --export-secret-keys >~/.gnupg/secring.gpg` to generate
  // On windows, you can use `C:/Users/<yourname>/.gnupg/secring.gpg` instead.
  signing.secretKeyRingFile=/Users/<yourname>/.gnupg/secring.gpg 
  
  ossrhUsername=<name for oss.sonatype.org>
  ossrhPassword=<password for oss.sonatype.org>
  ```
  
## Project Configuration

  build.gradle example:
  ```
  group 'net.bndy'
  version '1.0'

  apply plugin: 'java'
  apply plugin: 'maven'
  apply plugin: 'signing'


  sourceCompatibility = 1.8

  repositories {
      mavenCentral()
  }

  dependencies {
      testCompile group: 'junit', name: 'junit', version: '4.12'
      compile group: 'com.fasterxml.jackson.core', name: 'jackson-core', version: '2.9.3'
      compile group: 'com.fasterxml.jackson.core', name: 'jackson-databind', version: '2.9.3'
      compile group: 'commons-codec', name: 'commons-codec', version: '1.11'
      compile group: 'javax.mail', name: 'javax.mail-api', version: '1.6.0'
      compile 

