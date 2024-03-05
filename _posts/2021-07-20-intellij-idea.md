---
title: IntelliJ IDEA
categories: [Tools ]
tags: [Tools ]
---

[https://www.notion.so/IntelliJ-IDEA-091b588d904749aeaf9efd7c9fb3215a](https://www.notion.so/IntelliJ-IDEA-091b588d904749aeaf9efd7c9fb3215a)


# Auto-build

- Preferences → Build, Execute, Deployment → Compiler → [x] Build project automatically
- Command + Shift + A (on MacOS) → Type "Registry" → [x] compiler.automake.allow.when.app.running
- Add dependency to pom.xml

	```xml
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-devtools</artifactId>
		<version>2.5.0</version>
		<optional>true</optional>
	</dependency>
	```

