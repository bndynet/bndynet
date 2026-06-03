---
title: 'TimeZone in Spring Boot'
slug: 'timezone-in-spring-boot'
date: 2020-05-29
tags: ['Backend', 'Java']
notion_url: 'https://app.notion.com/p/TimeZone-in-Spring-Boot-bcb5c63fd9d44f89b6d01845e84f5961'
---

[Open in Notion](https://app.notion.com/p/TimeZone-in-Spring-Boot-bcb5c63fd9d44f89b6d01845e84f5961)


```java
@SpringBootApplication
public class Application {
    @PostConstruct
    public void init(){
        // Setting Spring Boot SetTimeZone
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }
    
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```


In application.properties


```yaml
spring.jackson.time-zone= #  Time zone used when formatting dates. For instance, "America/Los_Angeles" or "GMT+10".
```


