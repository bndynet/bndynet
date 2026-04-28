---
title: 'Development on MacOS'
slug: 'development-on-macos'
date: 2025-06-18
tags: ['OS']
notion_url: 'https://www.notion.so/Development-on-MacOS-2161a3b433fe80728241c00cfe6064ff'
---

[Open in Notion](https://www.notion.so/Development-on-MacOS-2161a3b433fe80728241c00cfe6064ff)


## Code Sign Invalid for Opening App

- Option 1: Resign

    ```shell
    codesign --deep --force --sign "Developer ID Application: Your Name (Team ID)" /path/to/YourApp.app
    ```

- Option 2: Use a temprary sign

    ```shell
    codesign --deep --force --sign - /path/to/YourApp.app
    ```


