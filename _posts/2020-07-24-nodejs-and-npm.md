---
title: nodejs and npm
categories: [Tools ]
tags: [Tools ]
---

[https://www.notion.so/nodejs-and-npm-5f60b844b7814b7cb5413147c27f8fa8](https://www.notion.so/nodejs-and-npm-5f60b844b7814b7cb5413147c27f8fa8)


## Installation on CentOS 7


```shell
curl -sL https://rpm.nodesource.com/setup_12.x | sudo bash -
sudo yum install nodejs
node --version
```


## Installation via NVM


```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
nvm --version.  # restart terminal
nvm install node

nvm install --lts
nvm install 8.12.0
nvm ls
nvm use 10.13.0
nvm alias default 10.13.0
nvm ls-remote
```


## Mirrors


```shell
npm config set registry https://registry.npm.taobao.org # or
npm install -g cnpm --registry=https://registry.npm.taobao.org
```


or via alias:


```shell
alias cnpm="npm --registry=https://registry.npm.taobao.org \
--cache=$HOME/.npm/.cache/cnpm \
--disturl=https://npm.taobao.org/dist \
--userconfig=$HOME/.cnpmrc"

# Or alias it in .bashrc or .zshrc
$ echo '\n#alias for cnpm\nalias cnpm="npm --registry=https://registry.npm.taobao.org \
  --cache=$HOME/.npm/.cache/cnpm \
  --disturl=https://npm.taobao.org/dist \
  --userconfig=$HOME/.cnpmrc"' >> ~/.zshrc && source ~/.zshrc
```


## Install development tools


To be able to build native modules from npm we will need to install the development tools and libraries:


```shell
sudo yum install gcc-c++ make
```


## NPM commands


```shell
npm start --prefix subapp   # run `start` in subapp folder

# publish your package to npmjs
npm adduser
npm publish
```


## Test package locally


Run the following commands to generate a package.


```shell
npm run build
cd ./dist
npm pack --pack-destination ~
```


Above will output a file.


```shell
~/your-package-1.0.0.tgz
```


Install this package on your other project.


```shell
"dependencies": {
  "your-package": "file:~/your-package-1.0.0.tgz"
}
```


and then install.


```shell
npm install
```

