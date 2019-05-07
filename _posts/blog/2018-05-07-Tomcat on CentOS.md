---
layout: page
title:  "Tomcat on CentOS"
teaser: "Installation and Configuration on CentOS"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

Installation and Configuration on CentOS

## Requirement
Open a terminal and switch to root user.

```bash
su -
yum install -y java-1.8.0 wget
java -version
```

## Create Tomcat Service Account

```shell
groupadd tomcat
useradd -g tomcat -d /opt/tomcat -s /bin/nologin tomcat
```

## Download & Setup Apache Tomcat

```
wget http://www-us.apache.org/dist/tomcat/tomcat-8/v8.5.20/bin/apache-tomcat-8.5.20.tar.gz
tar -zxvf apache-tomcat-*.tar.gz
mv apache-tomcat-8.5.20/* /opt/tomcat/
chown -R tomcat:tomcat /opt/tomcat/
```

## Set Environment Variables

```bash
mkdir /opt/tomcat/bin/setenv.sh
chmod 777 /opt/tomcat/bin/setenv.sh
```
Example:
```
export variableName=value
...
```

## Systemd

```shell
vi /etc/systemd/system/tomcat.service
```

Add below information to Tomcat systemd service file.

```
[Unit]
Description=Apache Tomcat 8.x Web Application Container
Wants=network.target
After=network.target

[Service]
Type=forking

Environment=JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.141-1.b16.el7_3.x86_64/jre
Environment=CATALINA_PID=/opt/tomcat/temp/tomcat.pid
Environment=CATALINA_HOME=/opt/tomcat
Environment='CATALINA_OPTS=-Xms512M -Xmx1G -Djava.net.preferIPv4Stack=true'
Environment='JAVA_OPTS=-Djava.awt.headless=true'

ExecStart=/opt/tomcat/bin/startup.sh
ExecStop=/opt/tomcat/bin/shutdown.sh
SuccessExitStatus=143

User=tomcat
Group=tomcat
UMask=0007
RestartSec=10
Restart=always

[Install]
WantedBy=multi-user.target
```

Reload systemd daemon.

```
systemctl daemon-reload
systemctl start tomcat
systemctl status tomcat
systemctl enable tomcat   //Enable the auto start of Tomcat service on system start
```

## Verify Apache Tomcat
By default, Tomcat runs on port no 8080. Use netstat command to check whether the service is listening on port 8080 or not.
```bash
netstat -antup | grep 8080
```
Output:
```
tcp6       0      0 :::8080                 :::*                    LISTEN      2428/java
```

## Firewall

You may need to allow port 8080 in the firewall so that we can access Tomcat from external networks.

```bash
firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd --reload
```

If you want to run tomcat at port 80, the easy way is:

```bash
firewall-cmd --permanent --add-forward-port=port=80:proto=tcp:toport=8080
```

NOTE: below 1024 ports need to run under ROOT user. If your tomcat run as non-root, you can use above to redirect 80 to 8080.

