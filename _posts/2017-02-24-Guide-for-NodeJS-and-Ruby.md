---
layout: page
subheadline: "Node.js and  Ruby"
title:  "Guide for Node.js and Ruby"
teaser: ""
breadcrumb: true
sidebar: right
categories:
    - Guide
tags:
    - node.js
    - npm
    - ruby
author: Bndy
---


### Node.js

```javascript

    const http = require('http');
    
    const hostname = '127.0.0.1';
    
    const port = 3000;
    
    const server = http.createServer((req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Hello World\n');
    });
    
    server.listen(port, hostname, () => {
    	console.log(`Server running at http://${hostname}:${port}/`);
    });
```



### npm --help

    Usage: npm <command>
    
    where <command> is one of:
	    access, adduser, bin, bugs, c, cache, completion, config,
	    ddp, dedupe, deprecate, dist-tag, docs, edit, explore, get,
	    help, help-search, i, init, install, install-test, it, link,
	    list, ln, login, logout, ls, outdated, owner, pack, ping,
	    prefix, prune, publish, rb, rebuild, repo, restart, root,
	    run, run-script, s, se, search, set, shrinkwrap, star,
	    stars, start, stop, t, tag, team, test, tst, un, uninstall,
	    unpublish, unstar, up, update, v, version, view, whoami
    
    npm <cmd> -h quick help on <cmd>
    npm -l   display full usage info
    npm help <term>  search for help on <term>
    npm help npm involved overview
    

```
$ npm install -g cnpm --registry=https://registry.npm.taobao.org
```



### gem --help


    RubyGems is a sophisticated package manager for Ruby.  This is a
    basic help message containing pointers to more information.
    
      Usage:
	    gem -h/--help
	    gem -v/--version
	    gem command [arguments...] [options...]
    
      Examples:
	    gem install rake
	    gem list --local
	    gem build package.gemspec
	    gem help install
    
      Further help:
	    gem help commandslist all 'gem' commands
	    gem help examplesshow some examples of usage
	    gem help gem_dependenciesgem dependencies file guide
	    gem help platforms   gem platforms guide
	    gem help <COMMAND>   show help on COMMAND
         (e.g. 'gem help install')
	    gem server   present a web page at
	     http://localhost:8808/
	     with info about installed gems