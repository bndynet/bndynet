---
title: Check Theme of Browser
categories: [Frontend,JavaScript]
tags: [Frontend,JavaScript]
---

[https://www.notion.so/Check-Theme-of-Browser-2221a3b433fe80c78ab6ff204c18cbc5](https://www.notion.so/Check-Theme-of-Browser-2221a3b433fe80c78ab6ff204c18cbc5)


## Theme of the browser 


```javascript
const theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
```

