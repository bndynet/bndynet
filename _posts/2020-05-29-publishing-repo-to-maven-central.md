---
title: Publishing Repo to Maven Central
categories: [Programming,Java]
tags: [Programming,Java]
---

[https://www.notion.so/Publishing-Repo-to-Maven-Central-149966b2de424104bb0d0f9bf87b6116](https://www.notion.so/Publishing-Repo-to-Maven-Central-149966b2de424104bb0d0f9bf87b6116)


## Create an account on oss.sonatype.org


Create an account and create an ISSUE about Repo. And waiting approved.


## Generate and share a PGP signature


Installing GnuPG


`gpg --version`


Generating a Key Pair and Sharing Key


Delete Key or Sub Key


## Local GPG


Add `~/.gradle/gradle.properties` with following content:


## Project Configuration


build.gradle example:


```groovy
group ‘net.bndy’  
version ‘1.0’

apply plugin: ‘java’  
apply plugin: ‘maven’  
apply plugin: ‘signing’

sourceCompatibility = 1.8

repositories {  
  mavenCentral()  
}

dependencies {  
  testCompile group: ‘junit’, name: ‘junit’, version: ‘4.12’  
  compile group: ‘com.fasterxml.jackson.core’, name: ‘jackson-core’, version: ‘2.9.3’  
  compile group: ‘com.fasterxml.jackson.core’, name: ‘jackson-databind’, version: ‘2.9.3’  
  compile group: ‘commons-codec’, name: ‘commons-codec’, version: ‘1.11’  
  compile group: ‘javax.mail’, name: ‘javax.mail-api’, version: ‘1.6.0’  
  compile group: ‘org.apache.directory.studio’, name: ‘org.apache.commons.io’, version: ‘2.4’  
  compile group: ‘javax.servlet’, name: ‘servlet-api’, version: ‘2.5’  
}

task javadocJar(type: Jar) {  
  classifier = ‘javadoc’  
  from javadoc  
}

task sourcesJar(type: Jar) {  
  classifier = ‘sources’  
  from sourceSets.main.allSource  
}

artifacts {  
  archives javadocJar, sourcesJar  
}

signing {  
  sign configurations.archives  
}

uploadArchives {  
  repositories {  
    mavenDeployer {  
      beforeDeployment { 
        MavenDeployment deployment -> signing.signPom(deployment)
      }

    repository(url: “https://oss.sonatype.org/service/local/staging/deploy/maven2/”) {  
      authentication(userName: ossrhUsername, password: ossrhPassword)  
    }

    snapshotRepository(url: “https://oss.sonatype.org/content/repositories/snapshots/”) {  
      authentication(userName: ossrhUsername, password: ossrhPassword)  
    }

    pom.project {  
      name ‘Jlib’  
      packaging ‘jar’

      // optionally artifactId can be defined here  
      description ‘A Java Library’  
      url ‘https://github.com/bndynet/Jlib’

      scm {
        url ‘https://github.com/bndynet/Jlib’  
        connection ‘scm:git:git://github.com/bndynet/Jlib.git’  
        developerConnection ‘scm:git:git@github.com:bndynet/Jlib.git’  
      }

      licenses {  
        license {  
          name ‘The Apache License, Version 2.0’  
          url ‘http://www.apache.org/licenses/LICENSE-2.0.txt’  
        }
      }

      developers {  
        developer {  
          id ‘bndynet’  
          name ‘Bendy Zhang’  
          email ‘zb@bndy.net’  
          url ‘http://bndy.net’  
        }
      }
    }
  }
}
```


## Deployment

