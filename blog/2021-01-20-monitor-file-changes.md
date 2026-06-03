---
title: 'Monitor File Changes'
slug: 'monitor-file-changes'
date: 2021-01-20
tags: ['Backend', 'Java']
notion_url: 'https://app.notion.com/p/Monitor-File-Changes-0d635ecd452c4e5eb7ad13f9777adafe'
---

[Open in Notion](https://app.notion.com/p/Monitor-File-Changes-0d635ecd452c4e5eb7ad13f9777adafe)


```java
public static void main(String[] args) throws Exception {
 
   WatchService watchService = FileSystems.getDefault().newWatchService();

   Path path = Paths.get("G:\\");

   path.register(
       watchService,
       StandardWatchEventKinds.ENTRY_CREATE,
       StandardWatchEventKinds.ENTRY_DELETE,
       StandardWatchEventKinds.ENTRY_MODIFY);

   WatchKey key;
   while ((key = watchService.take()) != null) {
       for (WatchEvent<?> event : key.pollEvents()) {
          System.out.println("Event:" + event.kind() + ", File：" + event.context());
       }
       key.reset();
   }
}
```


**WatchService** added in Java7 for NIO solution.


