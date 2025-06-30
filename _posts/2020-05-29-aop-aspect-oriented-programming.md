---
title: AOP – Aspect-oriented programming
categories: [Backend,Java]
tags: [Backend,Java]
---

[https://www.notion.so/AOP-Aspect-oriented-programming-059f105d3d4b41e1ae107371919e83a1](https://www.notion.so/AOP-Aspect-oriented-programming-059f105d3d4b41e1ae107371919e83a1)


It does so by adding additional behavior to existing code (an advice) without modifying the code itself, instead separately specifying which code is modified via a “pointcut” specification,
such as “log all function calls when the function’s name begins with ‘set’”. This allows behaviors that are not central to the business logic (such as logging) to be added to a program without cluttering the code,
core to the functionality. AOP forms a basis for aspect-oriented software development.


## Define an Aspect by using @Aspect annotations – which is natively understood by Spring:


```java
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Aspect
public class AuditAspect {

    private static Logger logger = LoggerFactory.getLogger(AuditAspect.class);

    @Pointcut("execution(* net.bndy.service.*.*(..))")
    public void serviceMethods(JoinPoint jp){ }

    // Intercept all calls to methods annotated with @PerLog
    // @Pointcut("execution(@net.bndy.annotations.PerfLog * *.*(..))")
    public void performanceTargets(JoinPoint jp, PerLog perLog){ }
    // Pass annotation to AOP advices
    @Pointcut(value = "@annotation(perLog)", argNames = "perfLog")
    public void performanceTargets(JoinPoint jp, PerLog perLog){ }

    // Using annotations and parameters in AOP advices
    @Before(value = "com.byteslounge.spring.aop.PointcutDefinition.serviceLayer() && args(account,..) && @annotation(auditable)")
    public void audit(Account account, Auditable auditable) {
        System.out.println("Audit account access: "
            + account.getAccountNumber() + ". Audit destination: "
            + auditable.value());
    }

    // If the first parameter is of the JoinPoint, ProceedingJoinPoint, or JoinPoint.StaticPart type, you may leave out the name of the parameter from the value of the "argNames" attribute. For example, if you modify the preceding advice to receive the join point object, the "argNames" attribute need not include it:
    @Before(value="com.xyz.lib.Pointcuts.anyPublicMethod() && target(bean) && @annotation(auditable)", argNames="bean,auditable")
    public void audit(JoinPoint jp, Object bean, Auditable auditable) {
        AuditCode code = auditable.value();
        // ... use code, bean, and jp
    }

    @Before("serviceMethods()")
    public void beforeMethod(JoinPoint jp) {
        String methodName = jp.getSignature().getName();
        logger.info("before method:" + methodName);
    }

    @Around("serviceMethods()")
    public Object aroundMethod(ProceedingJoinPoint jp) {
        try {
            long start = System.nanoTime();
            // execute target method
            Object result = jp.proceed();
            long end = System.nanoTime();
            logger.info(String.format("%s took %d ns", jp.getSignature(), (end - start)));
            return result;
        } catch (Throwable e) {
            throw new RuntimeException(e);
        }
    }

    // Always run if method completed
    @After("serviceMethods()")
    public void afterMethod(JoinPoint jp) {
        logger.info("after method");
    }

    // Run when the method returns normally.
    @AfterReturning(value="execution(* net.bndy.service.*.*(..))",returning="result")
    public void afterReturningMethod(JoinPoint jp, Object result){ }

    // Run if an exception has benn thrown in method
    @AfterThrowing(value="execution(* net.bndy.service.*.*(..))",throwing="e")
    public void afterThorwingMethod(JoinPoint jp, NullPointerException e){ }
}
```


## @Pointcut


```java
//                   Any return type | package          | class | method | any type and number of arguments
@Pointcut("execution(*                 net.bndy.service . *.      *(       ..                                  ))")
@Pointcut("execution(* net.bndy.service.*.*(.. ))")

// examples
@Pointcut("within(*..*Test)")                   // support for sub packages is provided with ".."
@Pointcut("within(net.bndy.service..*Test)")    // ends with Test inside the "net.bndy.service" package
@Pointcut("!within(net.bndy.service..*Test)"    // expects that ends with Test inside the "net.bndy.service" package
@Pointcut("execution(void *..service.Service+.*(..))")  // all methods in the Service class or a subtype of it

@Pointcut("!withincode(@org.junit.Test * *(..))")    //Finds all statements that’s not inside a method marked with @Test

// other Pointcuts
//execution(void Point.setX(int))
//call(void Point.setX(int))
//handler(ArrayOutOfBoundsException)
//this(SomeType)
//target(SomeType)
//within(MyClass)
//cflow(call(void Test.main()))
//call(* *(..)) &amp;&amp; (within(Line) || within(Point))
//execution(!static * *(..))
//execution(public !static * *(..))

```


## Why to use argNames


```java
public class HelloApi {

    public void aspectTest(String a,String b){
        System.out.println("in aspectTest:" + "a:" + a + ",b:" + b);
    }
}
```


```java
@Pointcut(value="execution(* bean.HelloApi.aspectTest(..)) && args(a1,b2)",argNames="a1,b2")
public void pointcut1(String a1,String b2){}

@Before(value="pointcut1(a,b)",argNames="a,b")
public void beforecase1(String a,String b){
    System.out.println("1 a:" + a +" b:" + b);
}

// NOTE: a and p locations
@Before(value="pointcut1(a,b)",argNames="b,a")
public void beforecase2(String a,String b){
    System.out.println("2 a:" + a +" b:" + b);
}
```


```java
HelloApi helloapi1 = beanFactory.getBean("helloapi1",HelloApi.class);
helloapi1.aspectTest("a", "b");
```


**Output**


```shell
1 a:a b:b
2 a:b b:a
in aspectTest:a:a,b:b
```

