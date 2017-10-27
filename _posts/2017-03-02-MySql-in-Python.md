
---
layout: page
title:  "MySql in Python"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

```shell
sudo easy_install pip
sudo pip install mysql-connector
python

>>> import mysql.connector
>>> conn = mysql.connector.connect(user='root', password='pwd', host='192.168.241.129', database='test')
>>> cur = conn.cursor()
>>> cur.execute('select * from foo where name = %s', ('Bndy',))
>>> result = cur.fetchall()
>>> print result
[(u'Bndy', 23)]
>>> conn.close()
```

<!--more-->

## Other Post Formats
{: .t60 }
{% include list-posts tag='post format' %}
