---
title: Build Spring Boot Starter Project
categories: [Programming,Java]
tags: [Programming,Java]
---

[https://www.notion.so/Build-Spring-Boot-Starter-Project-9ce098c683144dc6bd7f34ad338f8bea](https://www.notion.so/Build-Spring-Boot-Starter-Project-9ce098c683144dc6bd7f34ad338f8bea)


## Two Java Files


```java
@ConfigurationProperties(prefix = "spring.ftsi")
public class IndexServiceAutoConfigurationProperties {

}

@Configuration
@EnableConfigurationProperties(IndexServiceAutoConfigurationProperties.class)
@ConditionalOnClass(IndexService.class)
@ConditionalOnProperty(prefix = "spring.ftsi", name = "enabled", matchIfMissing = true)
public class IndexServiceAutoConfiguration {

    @Autowired
    private IndexServiceAutoConfigurationProperties properties;

    @Bean
    @ConditionalOnMissingBean(IndexService.class)
    public IndexService indexService() throws ClassNotFoundException, IllegalAccessException, InstantiationException {
        IndexService service = new IndexService();
        return service;
    }
}
```


## File: /src/main/resources/META-INF/spring.factories


```yaml
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
net.bndy.ftsi.starter.IndexServiceAutoConfiguration

```


## Usage


**application.yml**


```yaml
spring:
  ftsi:
    property1: ...
    property2: ...
```


**java**


```java
@SpringBootApplication
public class Application {

    @Autowried
    IndexService indexService;

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

