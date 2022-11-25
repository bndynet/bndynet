---
title: TimeZone in Spring Boot
categories: [Programming,Java]
tags: [Programming,Java]
---

[https://www.notion.so/TimeZone-in-Spring-Boot-bcb5c63fd9d44f89b6d01845e84f5961](https://www.notion.so/TimeZone-in-Spring-Boot-bcb5c63fd9d44f89b6d01845e84f5961)


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

