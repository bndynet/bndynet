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


## How to parse JSON string in the terminal?


Install jq via following link to parse the string.


[bookmark](https://jqlang.github.io/jq/download/)


```shell
curl 'https://api.github.com/repos/jqlang/jq/commits?per_page=5' | jq '.[0]'
```

