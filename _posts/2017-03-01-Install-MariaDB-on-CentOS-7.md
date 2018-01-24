---
layout: page
title:  "Install MariaDB on CentOS 7"
teaser: "Before You Begin"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

## Before You Begin
Ensure that you have followed the Getting Started and Securing Your Server guides, and the Linode’s hostname is set.

To check your hostname run:
```
hostname
hostname -f
```

The first command should show your short hostname, and the second should show your fully qualified domain name (FQDN).
Update your system:

`sudo yum update`

## Install and Start MariaDB

`sudo yum install mariadb-server`

## Enable MariaDB to start on boot and then start the service:

```
sudo systemctl enable mariadb
sudo systemctl start mariadb
mysql
use mysql;
update user set password=password('new-password');
update user set host = '%' where host = 'localhost';
flush privileges;
```

MariaDB will bind to localhost (127.0.0.1) by default. For information on connecting to a remote database using SSH, see our MySQL remote access guide, which also applies to MariaDB.

Allowing unrestricted access to MariaDB on a public IP not advised but you may change the address it listens on by modifying the bind-address parameter in /etc/my.cnf. If you decide to bind MariaDB to your public IP, you should implement firewall rules that only allow connections from specific IP addresses.
Harden MariaDB Server
Run the mysql_secure_installation script to address several security concerns in a default MariaDB installation:


`sudo mysql_secure_installation`

## Port 3306 is configured in firewall

One more point to consider whether the firwall is configured to allow incoming request from remote clients:

On RHEL and CentOS 7, it may be necessary to configure the firewall to allow TCP access to MySQL from remote hosts. To do so, execute both of these commands:

```
firewall-cmd --add-port=3306/tcp
firewall-cmd --permanent --add-port=3306/tcp
```

