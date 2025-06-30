---
title: Package your React Component for distribution via NPM
categories: [Frontend,React]
tags: [Frontend,React]
---

[https://www.notion.so/Package-your-React-Component-for-distribution-via-NPM-61150b3f3bc24cef9f4cc2aae0ac09b9](https://www.notion.so/Package-your-React-Component-for-distribution-via-NPM-61150b3f3bc24cef9f4cc2aae0ac09b9)


## 1. MAKE A PACKAGE NPM PUBLISHABLE


`npm init`


In the package.json, make sure these fields are populated:
package.json


```json
{
  "name": "myUnflappableComponent",
  "version": "0.0.29",
  "main": "dist/index.js",
  "publishConfig": {
    "access": "restricted"
  },
  ...
}
```


## 2. DON’T BUNDLE REACT. USE THE PARENT’S REACT AND REACT-DOM.


In package.json, add React and react-dom in the project’s peerDependencies (And remove it from dependencies, but add it to devDependencies for development)


```json
...
"peerDependencies": {
  "react": "&gt;=15.0.1",
  "react-dom": "&gt;=15.0.1"
},
"devDependencies": {
  "react": "&gt;=15.0.1",
  "react-dom": "&gt;=15.0.1"
},
...
```


In your webpack configuration, create a UMD bundle


```javascript
...
module.exports = {
  ...
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'myUnflappableComponent.js',
    library: libraryName,
    libraryTarget: 'umd',
    publicPath: '/dist/',
    umdNamedDefine: true
  },
  plugins: {...},
  module: {...},
  resolve: {...},
  externals: {...}
}
```


And super-duper important, don’t bundle React


```javascript
module.exports = {
  output: {...},
  plugins: {...},
  module: {...},
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    }
  },
  externals: {
    // Don't bundle react or react-dom
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "React",
      root: "React"
    },
    "react-dom": {
      commonjs: "react-dom",
      commonjs2: "react-dom",
      amd: "ReactDOM",
      root: "ReactDOM"
    }
  }
}
```


## 3. SET UP YOUR .NPMIGNORE FILE


If you don’t set up a .npmignore file, npm uses your .gitignore file and bad things will happen. An empty .npmignore file is allowed. This is what mine looks like:


> webpack.local.config.js
>>webpack.production.config.js
>>.eslintrc
>>.gitignore

