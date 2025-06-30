---
title: Enable https in Spring Boot
categories: [Backend,Java]
tags: [Backend,Java]
---

[https://www.notion.so/Enable-https-in-Spring-Boot-13ee4cfeaa2c485f91e22e1e4b01a4d0](https://www.notion.so/Enable-https-in-Spring-Boot-13ee4cfeaa2c485f91e22e1e4b01a4d0)

1. Create Self Signed SSL Certificate

	```shell
	keytool -genkeypair -alias filenameAlias -keyalg RSA -keysize 2048 -storetype PKCS12 -keystore filename.p12 -validity 3650
	```


	And use below code to view certificate details.


	```shell
	keytool -list -keystore  filename.p12
	```

2. Enabling HTTPS in Spring Boot **application.propreties**

	```yaml
	# The format used for the keystore. for JKS, set it as JKS
	  server.ssl.key-store-type=PKCS12
	# The path to the keystore containing the certificate
	  server.ssl.key-store=classpath:keystore/javadevjournal.p12
	# The password used to generate the certificate
	server.ssl.key-store-password=use the same password which we added during certificate creation
	# The alias mapped to the certificate
	  server.ssl.key-alias=javadevjournal
	# Run Spring Boot on HTTPS only, default 443 like no https 80 port
	server.port=8443
	```


**Note that** you need copy **filename.p12** to **src/main/resources/keystore** folder

