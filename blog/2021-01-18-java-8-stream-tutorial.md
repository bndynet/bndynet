---
title: 'Java 8 Stream Tutorial'
slug: 'java-8-stream-tutorial'
date: 2021-01-18
tags: ['Backend', 'Java']
notion_url: 'https://app.notion.com/p/Java-8-Stream-Tutorial-3e0251f254264fa3acb9eba089478993'
---

[Open in Notion](https://app.notion.com/p/Java-8-Stream-Tutorial-3e0251f254264fa3acb9eba089478993)


![20210116091807985.jpg](/notion/2021-01-18-java-8-stream-tutorial/12e9814a37b6a6c0.jpg)


```java
List<String> myList =
    Arrays.asList("a1", "a2", "b1", "c2", "c1");

myList
    .stream()
    .filter(s -> s.startsWith("c"))
    .map(String::toUpperCase)
    .sorted()
    .forEach(System.out::println);

// C1
// C2
```


```java
Arrays.asList("a1", "a2", "a3")
    .stream()
    .findFirst()
    .ifPresent(System.out::println);  // a1

Stream.of("a1", "a2", "a3")
    .findFirst()
    .ifPresent(System.out::println);  // a1
```


## IntStream, LongStream, DoubleStream


```java
IntStream.range(1, 4)
    .forEach(System.out::println);
// 1
// 2
// 3

IntStream.range(1, 4)
    .mapToObj(i -> "a" + i)
    .forEach(System.out::println);
// a1
// a2
// a3
```


## Processing Order


```java
Stream.of("d2", "a2", "b1", "b3", "c")
    .filter(s -> {
        System.out.println("filter: " + s);
        return true;
    })
    .forEach(s -> System.out.println("forEach: " + s));

filter:  d2
forEach: d2
filter:  a2
forEach: a2
filter:  b1
forEach: b1
filter:  b3
forEach: b3
filter:  c
forEach: c
```


```java
Stream.of("d2", "a2", "b1", "b3", "c")
    .map(s -> {
        System.out.println("map: " + s);
        return s.toUpperCase();
    })
    .anyMatch(s -> {
        System.out.println("anyMatch: " + s);
        return s.startsWith("A");
    });

// map:      d2
// anyMatch: D2
// map:      a2
// anyMatch: A2
```


```java
Stream.of("d2", "a2", "b1", "b3", "c")
    .sorted((s1, s2) -> {
        System.out.printf("sort: %s; %s\n", s1, s2);
        return s1.compareTo(s2);
    })
    .filter(s -> {
        System.out.println("filter: " + s);
        return s.startsWith("a");
    })
    .map(s -> {
        System.out.println("map: " + s);
        return s.toUpperCase();
    })
    .forEach(s -> System.out.println("forEach: " + s));
```


## parallelStream()


```java
List<String> strings = Arrays.asList("abc", "", "bc", "efg", "abcd","", "jkl");
long count = strings.parallelStream().filter(string -> string.isEmpty()).count();
```


## summaryStatistics()


```java
List<Integer> numbers = Arrays.asList(3, 2, 2, 3, 7, 3, 5);
 
IntSummaryStatistics stats = numbers.stream().mapToInt((x) -> x).summaryStatistics();
 
System.out.println("Max: " + stats.getMax());
System.out.println("Min: " + stats.getMin());
System.out.println("Sum: " + stats.getSum());
System.out.println("Avg: " + stats.getAverage());
```


