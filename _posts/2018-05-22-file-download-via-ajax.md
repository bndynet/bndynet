---
layout: page
title:  "File Download via AJAX"
teaser: "Describe how to use ajax to download files."
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

Describe how to use ajax to download files.

```html
<button type="button" id="GetFile">Get File!</button>
```

```javascript
$('#GetFile').on('click', function () {
    $.ajax({
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/172905/test.pdf',
        method: 'GET',
        xhrFields: {
            responseType: 'blob'
        },
        success: function (data) {
            console.debug(data);
            var a = document.createElement('a');
            var url = window.URL.createObjectURL(data);
            a.href = url;
            a.download = 'myfile.pdf';
            a.click();
            window.URL.revokeObjectURL(url);
        }
    });
});
```

