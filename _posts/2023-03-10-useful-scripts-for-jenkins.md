---
title: Useful Scripts for Jenkins
categories: [CI and CD]
tags: [CI and CD]
---

[https://www.notion.so/Useful-Scripts-for-Jenkins-a0fc6caf2cdc43c6a45f406e816c2d5d](https://www.notion.so/Useful-Scripts-for-Jenkins-a0fc6caf2cdc43c6a45f406e816c2d5d)


## **Decrypt credentials defined in Jenkins and list values.**


```groovy
def creds = com.cloudbees.plugins.credentials.CredentialsProvider.lookupCredentials(
    com.cloudbees.plugins.credentials.common.StandardUsernameCredentials.class,
    Jenkins.instance,
    null,
    null
);
for (c in creds) {
  if (c.properties.privateKeySource) {
	  println("ID: " + c.id)
    println("UserName: " + c.username)
    println("Description: " + c.description)
	  println("Private Key: " + c.getPrivateKey() )
  }
}
```


## **Decrypt the password if you got its HASH.**


```groovy
println(hudson.util.Secret.decrypt("{HASHxxxxx=}"))
# or /////
println(hudson.util.Secret.fromString("{HASHxxxxx=}").getPlainText())
```

