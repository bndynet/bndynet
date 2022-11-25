---
title: How to add swap on CentOS
categories: [OS & Apps]
tags: [OS & Apps]
---

[https://www.notion.so/How-to-add-swap-on-CentOS-ca33a5148a8e46f28c1030360b7ff3a9](https://www.notion.so/How-to-add-swap-on-CentOS-ca33a5148a8e46f28c1030360b7ff3a9)


# Check the System for Swap Information


```shell
swapon -s
```


```shell
free -m

total       used       free     shared    buffers     cached
Mem:          3953        315       3637          8         11        107
-/+ buffers/cache:        196       3756
Swap:            0          0       4095
```


# Check Available Storage Space


```shell
df -h

Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        59G  1.5G   55G   3% /
devtmpfs        2.0G     0  2.0G   0% /dev
tmpfs           2.0G     0  2.0G   0% /dev/shm
tmpfs           2.0G  8.3M  2.0G   1% /run
tmpfs           2.0G     0  2.0G   0% /sys/fs/cgroup
```


# Create a Swap File


```shell
sudo dd if=/dev/zero of=/swapfile count=10240 bs=1MiB
```


```shell
ls -lh /swapfile

-rw-r--r-- 1 root root 4.0G Oct 30 11:00 /swapfile
```


# Enable a Swap File


```shell
sudo chmod 600 /swapfile

ls -lh /swapfile
-rw------- 1 root root 4.0G Oct 30 11:00 /swapfile

sudo mkswap /swapfile
Setting up swapspace version 1, size = 4194300 KiB
no label, UUID=b99230bb-21af-47bc-8c37-de41129c39bf

sudo swapon /swapfile
swapon -s
Filename                Type        Size    Used    Priority
/swapfile               file        4194300 0     -1

free -m
total       used       free     shared    buffers     cached
Mem:          3953        315       3637          8         11        107
-/+ buffers/cache:        196       3756
Swap:         4095          0       4095
```


# Make the Swap File Permanent


Edit the file with sudo privileges in your text editor:


```shell
sudo nano /etc/fstab
```


At the bottom of the file, you need to add a line that will tell the operating system to automatically use the swap file that you created:


```shell
/swapfile   swap    swap    sw  0   0
```

