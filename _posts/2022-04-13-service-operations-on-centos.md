---
title: Service Operations on CentOS
categories: [OS]
tags: [OS]
---

[https://www.notion.so/Service-Operations-on-CentOS-e2dbd2619fa24666ba86d19f4e6297a5](https://www.notion.so/Service-Operations-on-CentOS-e2dbd2619fa24666ba86d19f4e6297a5)


# Enable or disable service on OS start


```shell
$ systemctl disable httpd
rm '/etc/systemd/system/multi-user.target.wants/httpd.service'

$ systemctl status httpd
httpd.service - The Apache HTTP Server
   Loaded: loaded (/usr/lib/systemd/system/httpd.service; **disabled**)
```


```shell
$ systemctl enable httpd
ln -s '/usr/lib/systemd/system/httpd.service' '/etc/systemd/system/multi-user.target.wants/httpd.service'

$ systemctl status httpd
httpd.service - The Apache HTTP Server
   Loaded: loaded (/usr/lib/systemd/system/httpd.service; **enabled**)
```

