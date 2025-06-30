---
title: Spring Boot with Keycloak
categories: [Backend,Java]
tags: [Backend,Java]
---

[https://www.notion.so/Spring-Boot-with-Keycloak-43abb21afb144e8aacfc13dcba7a1ce9](https://www.notion.so/Spring-Boot-with-Keycloak-43abb21afb144e8aacfc13dcba7a1ce9)


[bookmark](https://www.baeldung.com/spring-boot-keycloak)


# Dependencies


**The Keycloak Spring Boot adapter** **capitalizes on Spring Boot’s auto-configuration**, so all we need to do is add the Keycloak Spring Boot starter to our project.


Within the dependencies XML element, we need the following to run Keycloak with Spring Boot:


```xml
<dependency>
    <groupId>org.keycloak</groupId>
    <artifactId>keycloak-spring-boot-starter</artifactId>
</dependency>
```


After the dependencies XML element, we need to specify _dependencyManagement_ for Keycloak:


```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.keycloak.bom</groupId>
            <artifactId>keycloak-adapter-bom</artifactId>
            <version>11.0.2</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```


The following embedded containers are supported now and don't require any extra dependencies if using Spring Boot Keycloak Starter:

- Tomcat
- Undertow
- Jetty

# Keycloak Configuration


Here's **the basic, mandatory configuration**:


```yaml
keycloak.realm = <REALM_NAME>
keycloak.auth-server-url = http://127.0.0.1:8080/auth
keycloak.ssl-required = external
keycloak.resource = <CLIENT_ID>
keycloak.credentials.secret = <CLIENT_SECRET>
keycloak.use-resource-role-mappings = true
keycloak.bearer-only = true
```


You can disable the Keycloak Spring Boot Adapter (for example in tests) by setting `keycloak.enabled = false`.


To configure a Policy Enforcer, unlike keycloak.json, `policy-enforcer-config` must be used instead of just `policy-enforcer`.


You also need to specify the Java EE security config that would normally go in the `web.xml`. The Spring Boot Adapter will set the `login-method` to `KEYCLOAK` and configure the `security-constraints` at startup time. Here’s an example configuration:


```text
keycloak.securityConstraints[0].authRoles[0] = admin
keycloak.securityConstraints[0].authRoles[1] = user
keycloak.securityConstraints[0].securityCollections[0].name = insecure stuff
keycloak.securityConstraints[0].securityCollections[0].patterns[0] = /insecure

keycloak.securityConstraints[1].authRoles[0] = admin
keycloak.securityConstraints[1].securityCollections[0].name = admin stuff
keycloak.securityConstraints[1].securityCollections[0].patterns[0] = /admin
```


> If you plan to deploy your Spring Application as a WAR then you should not use the Spring Boot Adapter and use the dedicated adapter for the application server or servlet container you are using. Your Spring Boot should also contain a web.xml file.


# KeycloakSecurityConfig.java


```java
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(jsr250Enabled = true)
public class KeycloakSecurityConfig extends KeycloakWebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        super.configure(http);
        http.authorizeRequests()
            .anyRequest()
            .permitAll();
        http.csrf().disable();
    }

    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        KeycloakAuthenticationProvider keycloakAuthenticationProvider = keycloakAuthenticationProvider();
        keycloakAuthenticationProvider.setGrantedAuthoritiesMapper(new SimpleAuthorityMapper());
        auth.authenticationProvider(keycloakAuthenticationProvider);
    }

    @Bean
    @Override
    protected SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        return new RegisterSessionAuthenticationStrategy(new SessionRegistryImpl());
    }

    @Bean
    public KeycloakConfigResolver KeycloakConfigResolver() {
        return new KeycloakSpringBootConfigResolver();
    }
}
```


**configureGlobal:** Registers the KeycloakAuthenticationProvider with the authentication manager.


**sessionAuthenticationStrategy:** Defines the session authentication strategy.


**KeycloakConfigResolver :** By Default, the Spring Security Adapter looks for a `keycloak.json` configuration file. You can make sure it looks at the configuration provided by the Spring Boot Adapter by adding this bean


**@EnableGlobalMethodSecurity:** The _jsr250Enabled_ property allows us to use the _@RoleAllowed_ annotation. We’ll explore more about this annotation in the next section.


# TestController.java


```java
@RestController
@RequestMapping("/test")
public class TestController {

    @RequestMapping(value = "/anonymous", method = RequestMethod.GET)
    public ResponseEntity<String> getAnonymous() {
        return ResponseEntity.ok("Hello Anonymous");
    }

    @RequestMapping(value = "/user", method = RequestMethod.GET)
    public ResponseEntity<String> getUser() {
        return ResponseEntity.ok("Hello User");
    }

    @RequestMapping(value = "/admin", method = RequestMethod.GET)
    public ResponseEntity<String> getAdmin() {
        return ResponseEntity.ok("Hello Admin");
    }

    @RequestMapping(value = "/all-user", method = RequestMethod.GET)
    public ResponseEntity<String> getAllUser() {
        return ResponseEntity.ok("Hello All User");
    }
}
```


Run the Spring Boot Application. Make sure Maven is installed and configured.


```text
mvn spring-boot:run
```


As defined in the TestController, let’s invoke the REST APIs with CURL one by one.


```text
curl -X GET 'http://localhost:8000/test/anonymous'
curl -X GET 'http://localhost:8000/test/user'
curl -X GET 'http://localhost:8000/test/admin'
curl -X GET 'http://localhost:8000/test/all-user'
```


As you see all APIs don’t require any authentication or authorization. Now let’s try to secure these API endpoints.


## Define Role-Based Access with @RolesAllowed Annotation


```java
@RolesAllowed("user")
@RequestMapping(value = "/user", method = RequestMethod.GET)
public ResponseEntity<String> getUser(@RequestHeader String Authorization) {
    return ResponseEntity.ok("Hello User");
}

@RolesAllowed("admin")
@RequestMapping(value = "/admin", method = RequestMethod.GET)
public ResponseEntity<String> getAdmin(@RequestHeader String Authorization) {
    return ResponseEntity.ok("Hello Admin");
}

@RolesAllowed({ "admin", "user" })
@RequestMapping(value = "/all-user", method = RequestMethod.GET)
public ResponseEntity<String> getAllUser(@RequestHeader String Authorization) {
    return ResponseEntity.ok("Hello All User");
}
```


## Define Role-Based Access with Security Configuration


Rather than using @RolesAllowed annotation, the same configuration can be made in KeycloakSecurityConfig class as below.


```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    super.configure(http);
    http.authorizeRequests()
        .antMatchers("/test/anonymous").permitAll()
        .antMatchers("/test/user").hasAnyRole("user")
        .antMatchers("/test/admin").hasAnyRole("admin")
        .antMatchers("/test/all-user").hasAnyRole("user","admin")
        .anyRequest()
        .permitAll();
    http.csrf().disable();
}
```

