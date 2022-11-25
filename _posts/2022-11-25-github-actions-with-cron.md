---
title: GitHub Actions with CRON
categories: [CI and CD]
tags: [CI and CD]
---

[https://www.notion.so/GitHub-Actions-with-CRON-07bb3aca648f407a91d8ecbcecdfa59d](https://www.notion.so/GitHub-Actions-with-CRON-07bb3aca648f407a91d8ecbcecdfa59d)


## About CRON


```shell
# ┌───────────── minute (0 - 59)
# │ ┌───────────── hour (0 - 23)
# │ │ ┌───────────── day of the month (1 - 31)
# │ │ │ ┌───────────── month (1 - 12)
# │ │ │ │ ┌───────────── day of the week (0 - 6)
# │ │ │ │ │                       
# │ │ │ │ │
# │ │ │ │ │
# * * * * * <command to execute>
```


## Examples


```shell
name: Test Build

on:  
  push:
  pull_request:
  schedule:
    - cron: '00 1 * * 1'  # At 01:00 on Mondays.
```


```shell
name: Trigger Action on a CRON Schedule

on:
  schedule:
    # Runs "At 11:00 on every day-of-week from Monday through Friday"
    - cron: '0 11 * * 1-5'
    
jobs:
  build:
    name: Trigger Code Checkout
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
```

