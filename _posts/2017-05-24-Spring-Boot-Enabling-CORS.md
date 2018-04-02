---
layout: page
title:  "Spring Boot Enabling CORS"
teaser: "Enabling CORS"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

Enabling CORS

Controller method CORS configuration

So that the RESTful web service will include CORS access control headers in its response, you just have to add a @CrossOrigin annotation to the handler method:

src/main/java/hello/GreetingController.java

    @CrossOrigin(origins = "http://localhost:9000")
    @GetMapping("/greeting")
    public Greeting greeting(@RequestParam(required=false, defaultValue="World") String name) {
        System.out.println("==== in greeting ====");
        return new Greeting(counter.incrementAndGet(), String.format(template, name));
    }
This @CrossOrigin annotation enables cross-origin requests only for this specific method. By default, its allows all origins, all headers, the HTTP methods specified in the @RequestMapping annotation and a maxAge of 30 minutes is used. You can customize this behavior by specifying the value of one of the annotation attributes: origins, methods, allowedHeaders, exposedHeaders, allowCredentials or maxAge. In this example, we only allow http://localhost:9000 to send cross-origin requests.

it is also possible to add this annotation at controller class level as well, in order to enable CORS on all handler methods of this class.
Global CORS configuration

As an alternative to fine-grained annotation-based configuration, you can also define some global CORS configuration as well. This is similar to using a Filter based solution, but can be declared within Spring MVC and combined with fine-grained @CrossOrigin configuration. By default all origins and GET, HEAD and POST methods are allowed.

src/main/java/hello/GreetingController.java

    @GetMapping("/greeting-javaconfig")
    public Greeting greetingWithJavaconfig(@RequestParam(required=false, defaultValue="World") String name) {
        System.out.println("==== in greeting ====");
        return new Greeting(counter.incrementAndGet(), String.format(template, name));
    }
src/main/java/hello/Application.java

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurerAdapter() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/greeting-javaconfig").allowedOrigins("http://localhost:9000");
            }
        };
    }
You can easily change any properties (like the allowedOrigins one in the example), as well as only apply this CORS configuration to a specific path pattern. Global and controller level CORS configurations can also be combined.

