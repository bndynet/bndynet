---
title: Error Handling in Spring Boot
categories: [Backend,Java]
tags: [Backend,Java]
---

[https://www.notion.so/Error-Handling-in-Spring-Boot-a0b7580bbaa345a5ab3dcb8c1d613c26](https://www.notion.so/Error-Handling-in-Spring-Boot-a0b7580bbaa345a5ab3dcb8c1d613c26)


# Custom Error


## Disabling the Whitelabel Error Page


**S1**: In application.properties `server.error.whitelabel.enabled=false`


**S2**: Excluding the ErrorMvcAutoConfiguration bean


```yaml
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.web.ErrorMvcAutoConfiguration
#for Spring Boot 2.0
#spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration

```


Or by adding this annotation to the main class:


```java
@EnableAutoConfiguration(exclude = {ErrorMvcAutoConfiguration.class})

```


## Custom ErrorController


```java
@Controller
public class MyErrorController implements ErrorController  {
    @RequestMapping("/error")
    public String handleError() {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        // get the errors
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);

        if (status != null) {
            Integer statusCode = Integer.valueOf(status.toString());

            if(statusCode == HttpStatus.NOT_FOUND.value()) {
                return "error-404";
            } else if(statusCode == HttpStatus.INTERNAL_SERVER_ERROR.value()) {
                return "error-500";
            }
        }
        return "error";
    }

    @Override
    public String getErrorPath() {
        return "/error";
    }
}
```


在 Spring 中常见的全局异常处理，主要有三种：


（1）注解 ExceptionHandler


（2）继承 HandlerExceptionResolver 接口


（3）注解 ControllerAdvice


```java
@Controller
@RequestMapping("c")
public class Controller1 {
    // **/c/query   ->   response 400
    @ResponseBody
    @ResponseMapping(value = "/query", produces = "appliation/json;charset=UTF-8")
    public String query(@RequestParam("id") Long id) {
        return id;
    }

    // **/c/calc   -> response 500
    @ResponseBody
    @ResponseMapping(value = "/calc", produces = "application/json;charset=UTF-8")
    public String calc() {
        int a = 2/0;
        return "":
    }
}
```


## 注解 ExceptionHandler


注解 ExceptionHandler 作用对象为方法，最简单的使用方法就是放在 controller 文件中，详细的注解定义不再介绍。如果项目中有多个 controller 文件，通常可以在 baseController 中实现 ExceptionHandler 的异常处理，而各个 contoller 继承 basecontroller 从而达到统一异常处理的目的。因为比较常见，简单代码如下：


```java
@ExceptionHandler(Exception.class)
@ResponseBody
public String exception(Exception ex) {
    return this.getClass().getSimpleName() + ": " + ex.getMessage();
}
```


优点：ExceptionHandler 简单易懂，并且对于异常处理没有限定方法格式；
缺点：由于 ExceptionHandler 仅作用于方法，对于多个 controller 的情况，仅为了一个方法，所有需要异常处理的 controller 都继承这个类，明明不相关的东西，强行给他们找个爹，不太好。


## 注解 ControllerAdvice


这里虽说是 ControllerAdvice 注解，其实是其与 ExceptionHandler 的组合使用。在上文中可以看到，单独使用 @ExceptionHandler 时，其必须在一个 Controller 中，然而当其与 ControllerAdvice 组合使用时就完全没有了这个限制。换句话说，二者的组合达到的全局的异常捕获处理。
这种方法将所有的异常处理整合到一处，去除了 Controller 中的继承关系，并且达到了全局捕获的效果，推荐使用此类方式；
Controller 中单独 @ExceptionHandle 异常处理排在了首位，@ControllerAdvice 排在了第二位。


```java
@ControllerAdvice
public class ExceptionHandlerAdvice {
    @ExceptionHandler(Exception.class)
    @ResponseBody
    public String exceptionHandler(Exception ex) {
        return "";
    }
}
```


## 实现 HandlerExceptionResolver 接口


HandlerExceptionResolver 本身 SpringMVC 内部的接口，其内部只有 resolveException 一个方法，通过实现该接口我们可以达到全局异常处理的目的。


```java
@Component
public class MyHandlerExcptionResolver implements HandlerExceptionResolver {
    @Override
    public ModelAndView resolveException(HttpServletRequest request, 
        HttpServletResponse response, Object handler, Exception ex) {
        PrintWriter writer = response.getWriter();
        writer.write(ex.getMessage());
        writer.flush();
        writer.close();

        return new ModelAndView();
    }
}
```


可以看到 500 的异常处理已经生效了，但是 400 的异常处理却没有生效，并且根没有异常前的返回结果一样。这是怎么回事呢？不是说可以做到全局异常处理的么？


经过DefaultHandlerExceptionResolver异常处理源码分析，可以看到我们的自定义类 MyHandlerExceptionResolver 确实可以做到全局处理异常，只不过对于 query 请求的异常，中间被 DefaultHandlerExceptionResolver 插了一脚，所以就跳过了 MyHandlerExceptionResolver 类的处理，从而出现 400 的返回结果。

