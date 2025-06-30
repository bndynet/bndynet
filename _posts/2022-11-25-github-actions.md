---
title: GitHub Actions 
categories: [DevOps,CI and CD]
tags: [DevOps,CI and CD]
---

[https://www.notion.so/GitHub-Actions-07bb3aca648f407a91d8ecbcecdfa59d](https://www.notion.so/GitHub-Actions-07bb3aca648f407a91d8ecbcecdfa59d)


## Context in Workflow


More contexts at [https://docs.github.com/en/actions/learn-github-actions/contexts](https://docs.github.com/en/actions/learn-github-actions/contexts)

- Url for repo, for example: [https://github.com/bndynet/bndynet](https://github.com/bndynet/bndynet)
`${{ github.server_url }}/${{ github.repository }}`
- Url for pull request
`${{ github.server_url }}/${{ github.repository }}/pull/${{ github.event.pull_request.number }}`
- Url for issue
`${{ github.server_url }}/${{ github.repository }}/issues/${{ github.event.issue.number }}`

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


### Examples


```shell
name: Test Build

on:  
  push:
  pull_request:
  schedule:
    - cron: '00 1 * * 1'  # At 01:00 on Mondays.
```


```shell
name: Sync Notion pages to posts

on:
  schedule:
    # Runs "At 20:00 on every day-of-week"
    - cron: '0 20 * * *'
    
jobs:
  # Build job
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Generate posts
        uses: bndynet/github-action-notion@v1
        with:
          notion-token: ${{ secrets.NOTION_TOKEN}}
          root-page-id: ${{ secrets.NOTION_ROOT_PAGE_ID }}

      - name: Commit posts
        uses: EndBug/add-and-commit@v9  # https://github.com/marketplace/actions/add-commit
        with:
          add: '_posts'
          message: Sync Notion pages to posts by GitHub Actions
          committer_name: Bendy Zhang
          committer_email: email@your.com
```

