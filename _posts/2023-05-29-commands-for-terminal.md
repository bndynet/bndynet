---
title: Commands for Terminal
categories: [OS & Apps]
tags: [OS & Apps]
---

[https://www.notion.so/Commands-for-Terminal-9f9f65c1bde74874a7e5582c101ca9e1](https://www.notion.so/Commands-for-Terminal-9f9f65c1bde74874a7e5582c101ca9e1)


## Useful Aliases


Add following aliases in your ~/.bash_profile


```shell
alias ..='cd ..'
alias ...='cd ../../'
alias b='brew'
alias c='clear'
alias l='ls -lah'
alias su='sudo -i'
alias root='sudo -i'
```


## How to parse JSON string in the terminal


Install jq via following link to parse the string.


[bookmark](https://jqlang.github.io/jq/download/)


```shell
curl 'https://api.github.com/repos/jqlang/jq/commits?per_page=5' | jq '.[0]'
```


## **How to find the largest files or folders on a file system**


To find the largest folders on a file system pass the `-a` option. This will change the behavior of `du` to write size counts for files as well as folders. Run the following as root to see the ten largest files or folders on a system. This can be useful if you are dealing with out-of-disk space issues on a system.


```shell
du -a / | sort -n -r | head -n 10
5351116 /
2462616 /usr
2153492 /home
2153472 /home/george
1571924 /usr/lib
```


## **How to sort by file or folder size**


To sort by file size pass the output of `du` to `sort` and use the `-n` (numeric) and `-r` (reverse) options.


```shell
du ~/go | sort -n -r | less
170440  /home/george/go
132816  /home/george/go/src
74024   /home/george/go/src/github.com
57072   /home/george/go/src/golang.org
```


## Open and close ports on RHEL 8 / CentOS 8


```shell
sudo firewall-cmd --zone=public --list-ports
sudo firewall-cmd --zone=public --permanent --add-port 8080/tcp
sudo firewall-cmd --reload

sudo firewall-cmd --zone=public --permanent --remove-port 8080/tcp
```

