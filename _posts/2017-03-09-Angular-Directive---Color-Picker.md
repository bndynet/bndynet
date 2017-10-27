---
layout: page
title:  "Angular Directive - Color Picker"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

## Requires

- bootstrap

## Code

```coffee
"use strict"
###!
# @param {object} ng-colors - e.x. [{key: 1, value: "#ff0000", description: "", css: "flag"}, ...]
# @param {object} ng-model - type of key
# @param {function} ng-change - fn(color)
# 
# @example
#   <bn-ui-colorpicker ng-colors="[{}, {}, ...]" ng-model="model" ng-change="changeColor(color)"></bn-ui-colorpicker>
###
angular.module "bn.ui.colorpicker", []
    .directive "bnUiColorpicker", 
    ->
        restrict: "E"
        scope: ngColors: "=ngColors", ngModel: "=ngModel", onChange: "&ngChange"
        template: '''
<div class="bn-ui-colorpicker dropdown">
    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
        <span class="empty" style="width: 1em; height: 1em; display: inline-block; vertical-align: text-top; border: solid 1px #dedede;" ng-show="ngModel == null || typeof(ngModel) == 'undefined'"></span>
        <span style="width: 1em; height: 1em; display: inline-block; vertical-align: text-top;" ng-style="{'background-color': color.value}" ng-class="color.css" ng-show="color.key == ngModel" ng-repeat="color in ngColors" title="{{color.description}}"></span>
    </a>
    <ul class="dropdown-menu">
        <li ng-repeat="color in ngColors">
            <a role="button" ng-click="onChange({color: color})">
                <span style="width: 1em; height: 1em; display: inline-block; vertical-align: text-top;" ng-class="color.css" ng-style="{'background-color': color.value}"></span>
                <span ng-bind="color.description"></span>
            </a>
        </li>
    </ul>
</div>
'''
```

<!--more-->

## Other Post Formats
{: .t60 }
{% include list-posts tag='post format' %}
