---
layout: page
title:  "Testing AngularJS with Grunt, Karma, and Jasmine"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

## Setup Environment

```sh
npm install karma --save-dev  
npm install karma-jasmine --save-dev  
npm install karma-phantomjs-launcher --save-dev

npm install grunt-karma --save-dev
npm install jasmine-core --save-dev
```

## Gruntfile

```
karma:
  unit:
    options:
      frameworks: ["jasmine"]
      singleRun: true
      browsers: ["PhantomJS"]
      files: [
        "lib/jquery/dist/jquery.js"
        "lib/moment/min/moment-with-locales.js"
        "lib/angular/angular.js"
        "lib/angular-bootstrap-datetimepicker/src/js/datetimepicker.templates.js"
        "lib/angular-date-time-input/src/dateTimeInput.js"
        "dist/angular-more.min.js"
        "test/lib/angular-mocks.js"
        "test/filters.js"
        "test/directives.js"
      ]
          
grunt.loadNpmTasks "grunt-karma"
grunt.registerTask "test", ["karma"]
```

<!--more-->

## Other Post Formats
{: .t60 }
{% include list-posts tag='post format' %}
