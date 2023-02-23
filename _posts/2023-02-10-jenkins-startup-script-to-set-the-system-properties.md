---
title: Jenkins Startup Script to set the System Properties
categories: [CI and CD]
tags: [CI and CD]
---

[https://www.notion.so/Jenkins-Startup-Script-to-set-the-System-Properties-d090c097d99c4e199fb87edad5907c36](https://www.notion.so/Jenkins-Startup-Script-to-set-the-System-Properties-d090c097d99c4e199fb87edad5907c36)


**Step 1:**

- Locate the Jenkins home directory. You can look into the existing system properties for ‘jenkins_home’ or execute ‘echo $JENKINS_HOME’ inside the jenkins server to get the Jenkins home directory.
- Say if your Jenkins home directory is ‘_/var/jenkins_home_’. Create a new directory with name ‘init.groovy.d’.

**Step 2:**

- Now change your working directory to ‘_/var/jenkins_home/init.groovy.d_’
- Within _init.groovy.d_ directory create a new groovy script. Say ‘_startup-properties.groovy’_

**Step 3:**

- Copy the below content to the ‘_startup-properties.groovy_’ file

```groovy
import jenkins.model.Jenkins
import java.util.logging.LogManager

/* Jenkins home directory */
def jenkinsHome = Jenkins.instance.getRootDir().absolutePath
def logger = LogManager.getLogManager().getLogger("")

/* Replace the Key and value with the values you want to set.*/
/* System.setProperty(key, value)*/
System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "sandbox; default-src 'self';")
logger.info("Jenkins Startup Script: Successfully updated the system properties value forhudson.model.DirectoryBrowserSupport.CSP .Script location : ${jenkinsHome}/init.groovy.d ")
```


Visit [https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/lang/System.html?is-external=true#setProperty(java.lang.String,java.lang.String)](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/lang/System.html?is-external=true#setProperty(java.lang.String,java.lang.String)) to see how to use setProperty.


**Step 4:**


Restart the Jenkins server, you can manually restart the server using :


_<Jenkins-server-URL>/restart_ **or** _<Jenkins-server-URL>/safeRestart_

- Use safeRestart when you have some job still running. It will wait till all the jobs are completed.

**Step 5:**


Check the logs after Jenkins restart: Manage Jenkins → System Log. You can see while server is starting, its executing the startup-properties.groovy script which is inside init.groovy.d directory.


![](https://miro.medium.com/max/1400/1*kjzZCxTixWCYsQbIcfRkzA.png)

- Check the System Properties, you will see the required key and values.

> Now every time server is restarted the script will run and set the system properties for you. You don’t need to worry for setting these system properties manually every time server restart.


[https://wiki.jenkins-ci.org/display/JENKINS/Features-controlled-by-system-properties.html](https://wiki.jenkins-ci.org/display/JENKINS/Features-controlled-by-system-properties.html)

