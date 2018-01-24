---
layout: page
title:  "spring-boot-ehcache"
teaser: "Using ehcache 3 in spring boot"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

Using ehcache 3 in spring boot

## Getting Started

### Configuration

ehcache.xml

```xml
<config
		xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'
		xmlns='http://www.ehcache.org/v3'
		xmlns:jsr107='http://www.ehcache.org/v3/jsr107'
		xsi:schemaLocation="
        http://www.ehcache.org/v3 http://www.ehcache.org/schema/ehcache-core-3.0.xsd
        http://www.ehcache.org/v3/jsr107 http://www.ehcache.org/schema/ehcache-107-ext-3.0.xsd">

	<service>
		<jsr107:defaults default-template="maxEntriesOnHeapCache" enable-management="false" enable-statistics="true">
			<jsr107:cache name="default" template="byRefTemplate"/>
			<jsr107:cache name="byRefCache" template="byRefTemplate"/>
			<jsr107:cache name="byValCache" template="byValueTemplate"/>
		</jsr107:defaults>
	</service>

	<cache alias="default" uses-template="maxEntriesOnHeapCache"></cache>

	<cache-template name="maxEntriesOnHeapCache">
		<heap unit="entries">2000</heap>
	</cache-template>

	<cache-template name="byRefTemplate">
		<key-type copier="org.ehcache.impl.copy.IdentityCopier">java.lang.Long</key-type>
		<value-type copier="org.ehcache.impl.copy.IdentityCopier">java.lang.String</value-type>
		<heap unit="entries">2000</heap>
	</cache-template>

	<cache-template name="byValueTemplate">
		<key-type copier="org.ehcache.impl.copy.SerializingCopier">java.lang.Long</key-type>
		<value-type copier="org.ehcache.impl.copy.SerializingCopier">java.lang.String</value-type>
		<heap unit="entries">2000</heap>
	</cache-template>
</config>
```

application.yml

```yml
spring:
  cache:
    jcache:
      config: classpath:config/ehcache.xml
```

### Annotation

```java
@EnableCaching
@SpringBootApplication
public class Application {
	
	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
```

```java
    @CacheResult(cacheName = "default")
    @RequestMapping(value = "/", method = RequestMethod.GET)

