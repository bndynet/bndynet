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


| DB TYPE | SQL | Backup | Restore | MISC |
|---------|-----|--------|---------|------|
| MySQL  | **`C`** INSERT INTO table(column1, ...) VALUES (value1, ....) <br /> **`R`** SELECT column1, ... FROM table WHERE condition ORDER BY column1 DESC LIMIT offset, count <br /> **`U`** UPDATE table SET column1 = value1, ... WHERE condition  <br /> **`D`** DELETE FROM table WHERE condition | mysqldump -u username -p dbname table1 table2 ...-> BackupName.sql <br /> mysqldump -u username -p --databases dbname2 dbname2 > Backup.sql <br /> mysqldump -u username -p -all-databases > BackupName.sql <br /> mysqlhotcopy [option] dbname1 dbname2 backupDir/ | mysql -u root -p < C:\backup.sql  | `CONCAT('s1', 's2', s3)` |
| SQL Server | **`C`** INSERT INTO table(column1, ...) VALUES (value1, ....) <br /> **`R`** SELECT TOP 10 column1, ... FROM table WHERE condition ORDER BY column1 ASC <br /> **`U`** UPDATE table SET column1 = value1, ... WHERE condition  <br /> **`D`** DELETE FROM table WHERE condition | Execution Plans | Sql Management |  |
| Oracle  | **`C`** INSERT INTO table(column1, ...) VALUES (value1, ....) <br /> **`R`** SELECT column1, ... FROM table WHERE condition AND ROWNUM <= 10 ORDER BY column1 ASC <br /> **`U`** UPDATE table SET column1 = value1, ... WHERE condition  <br /> **`D`** DELETE FROM table WHERE condition | exp userid=scott/tiger@orcl tables=(emp,dept) file=d:/scott_emp_dept.dmp <br /> exp userid=system/orcl@orcl tables(scott.emp,scott.dept) file=d:/scott_emp_dept.demp direct=y <br /> exp system/orcl@orcl full=y file=d:/orcl_full.dmp  | imp scott/tiger@orcl file=d:/emp_dept.dmp <br /> imp system/orcl@orcl file=orcl_full.dmp full=y  | `CONCAT('s1', 111)` `column1 \|\| 's1'` |
| MongoDB | **`C`** db.tablename.insert([{}, {}]) //insert({}) <br /> **`R`** db.tablename.find({"size": { \$gt: 10,  \$lte: 20 } } ).limit(10).skip(10) <br /> **`U`** db.tablename.update({id: "XXXX"},{\$set: {name: "bndy"}},{upsert:true}) <br /> **`U`** db.tablename.update({ "size": {\$lt:15}, "name": "bndy" }, { \$set : { age: 100}})  <br /> **`D`** db.tablename.remove({"size":{$lt:10}, "name": "bndy"}) | mongodump -h <hostname><:port> -d dbname -o dbdirectory | mongorestore -h <hostname><:port> -d dbname <path> | `$eq` `$in` `$ne` `$nin` |





