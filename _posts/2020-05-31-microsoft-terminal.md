---
title: Microsoft Terminal
categories: [Tools]
tags: [Tools]
---

[https://www.notion.so/Microsoft-Terminal-9e5dc6adb45b44179857dc8cd887839f](https://www.notion.so/Microsoft-Terminal-9e5dc6adb45b44179857dc8cd887839f)


# Useful Commands


```powershell
Set-PSRepository -Name PSGallery -InstallationPolicy Trusted
Set-ExecutionPolicy -Scope CurrentUser Bypass
```


# oh-my-posh


## Install from local

1. Download the nupkg file from [https://www.powershellgallery.com/packages?q=oh-my-posh](https://www.powershellgallery.com/packages?q=oh-my-posh)
2. Run below command to register repository and install

	```powershell
	Register-PSRepository -Name 'oh-my-posh' -SourceLocation 'your-nupkg-folder'
	Install-Module oh-my-posh -Scope CurrentUser -Repository oh-my-posh
	Import-Module oh-my-posh
	```


## Commands


```powershell
Get-PoshThemes
Get-PoshThemes -list
```

