---
layout: page
title:  "Build Commands"
teaser: "Maven"
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

## Maven

- `mvn package` or `mvn compile war:war`

## MSBuild

-- `MSBuild.exe buildapp.csproj /p:Configuration=Release;WarningLevel=2;OutDir=bin\Debug`

-- `MSBuild.exe solution.sln /t:Rebuild /p:Configuration=Release;PublishProfile=Jenkins-DEV;DeployOnBuild=true;OutDir=bin\Debug`

## Node.js

-- `npm install`

-- `npm run build`

