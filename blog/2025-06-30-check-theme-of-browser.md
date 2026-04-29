---
title: 'Check Theme of Browser'
slug: 'check-theme-of-browser'
date: 2025-06-30
tags: ['Frontend', 'JavaScript']
notion_url: 'https://app.notion.com/p/Check-Theme-of-Browser-2221a3b433fe80c78ab6ff204c18cbc5'
---

[Open in Notion](https://app.notion.com/p/Check-Theme-of-Browser-2221a3b433fe80c78ab6ff204c18cbc5)


## Theme of the browser 


```javascript
const theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
```


