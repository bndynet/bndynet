---
title: Development on MacOS
categories: [OS]
tags: [OS]
---

[https://www.notion.so/Development-on-MacOS-2161a3b433fe80728241c00cfe6064ff](https://www.notion.so/Development-on-MacOS-2161a3b433fe80728241c00cfe6064ff)


## Code Sign Invalid for Opening App

- Option 1: Resign

	```shell
	codesign --deep --force --sign "Developer ID Application: Your Name (Team ID)" /path/to/YourApp.app
	```

- Option 2: Use a temprary sign

	```shell
	codesign --deep --force --sign - /path/to/YourApp.app
	```

