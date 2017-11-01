---
layout: page
title:  "Database Languages"
teaser: "CRUD(Create, read, update and delete) for MySQL, SqlServer, Oracle and MongoDB"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

CRUD(Create, read, update and delete) for MySQL, SqlServer, Oracle and MongoDB


| DB TYPE | Example | MISC |
|---------|---------|------|
| MySQL  | **`C`** INSERT INTO table(column1, ...) VALUES (value1, ....) <br /> **`R`** SELECT column1, ... FROM table WHERE condition ORDER BY column1 DESC LIMIT offset, count <br /> **`U`** UPDATE table SET column1 = value1, ... WHERE condition  <br /> **`D`** DELETE FROM table WHERE condition | `CONCAT('s1', 's2', s3)` |
| SQL Server | **`C`** INSERT INTO table(column1, ...) VALUES (value1, ....) <br /> **`R`** SELECT TOP 10 column1, ... FROM table WHERE condition ORDER BY column1 ASC <br /> **`U`** UPDATE table SET column1 = value1, ... WHERE condition  <br /> **`D`** DELETE FROM table WHERE condition |  |
| Oracle  | **`C`** INSERT INTO table(column1, ...) VALUES (value1, ....) <br /> **`R`** SELECT column1, ... FROM table WHERE condition AND ROWNUM <= 10 ORDER BY column1 ASC <br /> **`U`** UPDATE table SET column1 = value1, ... WHERE condition  <br /> **`D`** DELETE FROM table WHERE condition | `CONCAT('s1', 111)` `column1 \|\| 's1'` |
| MongoDB | **`C`** db.tablename.insert([{}, {}]) //insert({}) <br /> **`R`** db.tablename.find({"size": { \$gt: 10,  \$lte: 20 } } ).limit(10).skip(10) <br /> **`U`** db.tablename.update({id: "XXXX"},{\$set: {name: "bndy"}},{upsert:true}) <br /> **`U`** db.tablename.update({ "size": {\$lt:15}, "name": "bndy" }, { \$set : { age: 100}})  <br /> **`D`** db.tablename.remove({"size":{$lt:10}, "name": "bndy"}) | `$eq` `$in` `$ne` `$nin` |





<!--more-->

## Other Post Formats
{: .t60 }
{% include list-posts tag='post format' %}
