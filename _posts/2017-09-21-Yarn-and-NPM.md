---
layout: page
title:  "Yarn and NPM"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

## Commands

YARN  | NPM   | DES
--- | --- | ---
`yarn init` | `npm init` | Starting a new project
`yarn add [package]` `yarn add [package]@[version]` `yarn add [package]@[tag]` | `npm install [package]` | Adding a dependency
`--dev` `--peer` `--optional` | `--save-dev` `--save-prod` `--save-optional` | Add to devDependencies, peerDependencies, and optionalDependencies respectively
`yarn upgrade [package]` `yarn upgrade [package]@[version]` `yarn upgrade [package]@[tag]` | `npm outdated` and `npm update` | Upgrading a dependency
`yarn remove [package]` | `npm uninstall [package]` | Removing a dependency
`yarn` `yarn install` | `npm install` `npm i` | Installing all the dependencies of project
NA | `npm adduser` or `npm login`, `npm publish` | Publishing packages [NPM](https://docs.npmjs.com/getting-started/publishing-npm-packages)
NA | `npm version [patch\|minor\|major]` and `npm publish` | Updating remote packages [NPM](https://docs.npmjs.com/getting-started/publishing-npm-packages)

## MISC

If you are in China, use taobao mirror.
1. `npm install -g cnpm --registry=https://registry.npm.taobao.org`
1. `cnpm install yarn tyarn -g --registry=https://registry.npm.taobao.org`
1. `tyarn add [package]`

<!--more-->

## Other Post Formats
{: .t60 }
{% include list-posts tag='post format' %}
