---
title: Monitor Spring Boot Application
categories: [Backend,Java]
tags: [Backend,Java]
---

[https://www.notion.so/Monitor-Spring-Boot-Application-30e77904ca3241829eafae2f2d96a196](https://www.notion.so/Monitor-Spring-Boot-Application-30e77904ca3241829eafae2f2d96a196)


[bookmark](https://sentry.io/)


## Host Your Sentry


```shell
git clone https://github.com/getsentry/onpremise.git
cd onpremise
./install.sh
```


Once your Sentry is ready, you need to create your project with Spring Boot or Java platform in your Sentry.


## Set up Spring Boot Application


### Get Started


```xml
<dependency>
  <groupId>io.sentry</groupId>
  <artifactId>sentry-spring-boot-starter</artifactId>
  <version>3.1.1</version>
</dependency>
```


```xml
sentry.dsn=https://key@host/id
```


### Who send the exception? 


You can use SentryUserProvider to build a Java Bean:


```java
    @Bean
    public SentryUserProvider sentryUserProvider(){
        return () -> {
            // TODO: get your current user
            User user = new User();
            user.setId("userId");
            user.setUsername("Bendy");
            user.setEmail("zb@bndy.net");

            return user;
        };
    }
```


### Custom Tags


```java
    @Bean
    public SentryOptions.BeforeSendCallback beforeSendCallback(){
        return (event, hint) -> {
            event.setTag("name","zhangsan");
            return event;
        };
    }
```


### Integration with Logback


```xml
<dependency>
  <groupId>io.sentry</groupId>
  <artifactId>sentry-logback</artifactId>
  <version>3.1.1</version>
</dependency>
```


```java
@RestController
public class HelloController {
    private static Logger logger = LoggerFactory.getLogger(HelloController.class);

    @RequestMapping("/")
    public void test(){
        logger.error("Logback error!");
    }
}
```

