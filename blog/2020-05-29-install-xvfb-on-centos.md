---
title: 'Install Xvfb on CentOS'
slug: 'install-xvfb-on-centos'
date: 2020-05-29
tags: ['Frontend', 'Testing']
notion_url: 'https://app.notion.com/p/Install-Xvfb-on-CentOS-2a01f24a9e694e78bf725a61883356b8'
---

[Open in Notion](https://app.notion.com/p/Install-Xvfb-on-CentOS-2a01f24a9e694e78bf725a61883356b8)


Xvfb, or X virtual frame buffer is needed by selenium and chromedriver or gekodriver, so it can run via cron with your PC locked, or without your script taking focus from the user section.


## Installing


```shell
yum install xorg-x11-server-Xvfb
```


## Copy below to /etc/systemd/system/Xvfb.service


```plain text
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


