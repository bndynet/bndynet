---
layout: page
title:  "Spring Boot Starter Project"
teaser: "How to Build Spring Boot Starter Project"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

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

```
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
net.bndy.ftsi.starter.IndexServiceAutoConfiguration
```

## Usage

**application.yml**

```yml
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

