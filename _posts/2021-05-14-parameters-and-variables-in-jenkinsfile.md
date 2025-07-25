---
title: Parameters and Variables in Jenkinsfile
categories: [DevOps,CI and CD]
tags: [DevOps,CI and CD]
---

[https://www.notion.so/Parameters-and-Variables-in-Jenkinsfile-c42a2207b65f43df9ff6f78b2c4e17cb](https://www.notion.so/Parameters-and-Variables-in-Jenkinsfile-c42a2207b65f43df9ff6f78b2c4e17cb)


```shell
import groovy.transform.Field

@Field def globalV = ""

def myFunc() {
  echo "${globalV}"    // The @Field is required for this variable in definition
}

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

	stage ("Prompt for input") {
		steps {
			script {
				env.USERNAME = input message: 'Please enter the username',
                             parameters: [string(defaultValue: '',
                                          description: '',
                                          name: 'Username')]
				env.PASSWORD = input message: 'Please enter the password',
                             parameters: [password(defaultValue: '',
                                          description: '',
                                          name: 'Password')]
			}
			echo "Username: ${env.USERNAME}"
			echo "Password: ${env.PASSWORD}"
		}
	}
}
```

