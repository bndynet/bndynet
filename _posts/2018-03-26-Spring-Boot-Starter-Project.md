---
layout: page
title:  "Spring Boot Starter Project"
teaser: "Two Java Files"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

## Two Java Files 

```java
@ConfigurationProperties(prefix = "spring.hello")
public class HelloServiceAutoConfigurationProperties {

}

@Configuration
@EnableConfigurationProperties(IndexServiceAutoConfigurationProperties.class)
@ConditionalOnClass(HelloService.class)
@ConditionalOnProperty(prefix = "spring.hello", name = "enabled", matchIfMissing = true)
public class HelloServiceAutoConfiguration {

    @Autowired
    private HelloServiceAutoConfigurationProperties properties;

    @Bean
    @ConditionalOnMissingBean(HelloService.class)
    public HelloService helloService() {
        // propreties from application.yml
        return new HelloService();
    }
}
```

## File: /src/main/resources/META-INF/spring.factories

```
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
package.HelloServiceAutoConfiguration
```

## Usage

**application.yml**

```yml
spring:
  hello:
    property1: ...
    property2: ...

```

**java**

```java
@SpringBootApplication
public class Application {

  @Autowried
  HelloService helloService;
  
  public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
```

