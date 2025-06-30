---
title: Install Xvfb on CentOS
categories: [Frontend,Testing]
tags: [Frontend,Testing]
---

[https://www.notion.so/Install-Xvfb-on-CentOS-2a01f24a9e694e78bf725a61883356b8](https://www.notion.so/Install-Xvfb-on-CentOS-2a01f24a9e694e78bf725a61883356b8)


Xvfb, or X virtual frame buffer is needed by selenium and chromedriver or gekodriver, so it can run via cron with your PC locked, or without your script taking focus from the user section.


## Installing


```shell
yum install xorg-x11-server-Xvfb
```


## Copy below to /etc/systemd/system/Xvfb.service


```text
[Unit]
Description=X Virtual Frame Buffer Service
After=network.target

[Service]
ExecStart=/usr/bin/Xvfb :99 -screen 0 1024x768x24

[Install]
WantedBy=multi-user.target
```


```shell
chmod +x /etc/systemd/system/Xvfb.service
systemctl enable Xvfb.service
systemctl start Xvfb.service
```

