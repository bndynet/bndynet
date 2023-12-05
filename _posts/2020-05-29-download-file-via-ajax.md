---
title: Download File via AJAX
categories: [Programming,Web,JavaScript]
tags: [Programming,Web,JavaScript]
---

[https://www.notion.so/Download-File-via-AJAX-c2cbd5b166b94b03a51acf2da3f39090](https://www.notion.so/Download-File-via-AJAX-c2cbd5b166b94b03a51acf2da3f39090)


```javascript
$('#GetFile').on('click', function () {
  $.ajax({
    url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/172905/test.pdf',
    method: 'GET',
    xhrFields: {
        responseType: 'blob'
    },
    success: function (response) {
        var blob = response.data;
        var a = document.createElement('a');
        var fileUrl = window.URL.createObjectURL(blob);
        var filename = 'myfile.pdf';
        /* you can also use below to get filename from backend */
        // var contentDisposition = response.headers('Content-Disposition');
        // var matches = /filename=\\"(.+?)\\"/g.exec(contentDisposition);
        // var filename = matches && matches.length > 1 ? matches\[1\] : '';
        /* but need add backend code like below, otherwise you cannot get Content-Disposition header */
        // + response.setHeader("Content-Disposition", "attachment; filename=\\"myfile.csv\\"");
        // + response.setHeader("Content-type", "application/octet-stream;charset=utf-8");
        // + response.setHeader("Access-Control-Expose-Headers","Content-Disposition");
        // work in IE
        if (window.navigator && window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(blob, filename);
            return;
        }
        a.href = fileUrl;
        a.download = filename;
        a.dispatchEvent(new MouseEvent('click'));
        setTimeout(function() {
            a.remove();
            window.URL.revokeObjectURL.bind(window.URL, fileUrl);
        });
    }
  });
});
```

