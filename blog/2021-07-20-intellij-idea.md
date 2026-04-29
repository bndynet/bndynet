---
title: 'IntelliJ IDEA'
slug: 'intellij-idea'
date: 2021-07-20
tags: ['Tools ']
notion_url: 'https://app.notion.com/p/IntelliJ-IDEA-091b588d904749aeaf9efd7c9fb3215a'
---

[Open in Notion](https://app.notion.com/p/IntelliJ-IDEA-091b588d904749aeaf9efd7c9fb3215a)


# Auto-build

- Preferences → Build, Execute, Deployment → Compiler → [x] Build project automatically
- Command + Shift + A (on MacOS) → Type "Registry" → [x] compiler.automake.allow.when.app.running
- Add dependency to pom.xml

    ```xml
    \<dependency\>
    	\<groupId\>org.springframework.boot\</groupId\>
    	\<artifactId\>spring-boot-devtools\</artifactId\>
    	\<version\>2.5.0\</version\>
    	\<optional\>true\</optional\>
    \</dependency\>
    ```


