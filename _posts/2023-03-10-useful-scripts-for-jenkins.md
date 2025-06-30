---
title: Useful Scripts for Jenkins
categories: [DevOps,CI and CD]
tags: [DevOps,CI and CD]
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


## Trigger build by url


```shell
# Run when the anonymous user has the build permission
curl http://127.0.0.1:8080/job/Trigger_Remote_Demo/build?token=My-token
# Send request with credentials
curl -u username:api_token http://127.0.0.1:8080/job/Trigger_Remote_Demo/build
# Build with Parameter
curl -u username:api_token http://127.0.0.1:8080/job/Trigger_Remote_Demo/buildWithParameters?para1=val1&para2=val2
```

