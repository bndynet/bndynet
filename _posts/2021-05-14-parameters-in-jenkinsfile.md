---
title: Parameters in Jenkinsfile
categories: [CI and CD]
tags: [CI and CD]
---

[https://www.notion.so/Parameters-in-Jenkinsfile-c42a2207b65f43df9ff6f78b2c4e17cb](https://www.notion.so/Parameters-in-Jenkinsfile-c42a2207b65f43df9ff6f78b2c4e17cb)


```shell
node {
	stage('Start') {
		echo 'Testing..'
		print params
		if (params.b) {
			echo 'has b'
		}
		if (b == 'true') {
			echo 'b == true'
		}
		print 's:' + s
		echo 's: ' + s
      
		if (params.nn) {
			echo 'has nn'
		} else {
			echo 'nn undefined'
		}
	}

	stage('Build') {
		echo 'Building..'
	}

	stage('Test') {
		echo 'Testing..'
	}

	stage('Deploy') {
		echo 'Deploying....'
	}
}
```

