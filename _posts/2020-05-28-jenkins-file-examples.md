---
title: Jenkins File Examples
categories: [CI and CD]
tags: [CI and CD]
---

[https://www.notion.so/Jenkins-File-Examples-bb0efd5ea63e41699913260f81ad7219](https://www.notion.so/Jenkins-File-Examples-bb0efd5ea63e41699913260f81ad7219)


## Example with Parameters


```groovy
node {
  print '✋' + params
	print params.anything_to_undefined     // output: null

  if (params.MultiLines) {
    params.MultiLines.split("\\r?\\n").each {
      if (it.trim()) {
        echo '✋-->' + it
      }
    }
  }

  // clean workspace
  cleanWs()

  try {
    docker.image('node:14').inside {
      stage("Source code") {
        //git branch: Git_Branch, credentialsId: Cred_ID, url: Git_Url
      }
      stage('Prepare') {
				sh """
					echo "================================"
					printenv | sort
					echo "================================"
				"""
        sh 'npm i'
      }
      stage('Build') {
				withEnv(['my_name=bing']) {
					// TODO
					sh 'Hi ${my_name}.'
				}
      }
      stage('Test') {
        if (params.Skip_Test != true) {
          echo 'do test'
        } else {
          echo 'Skip test'
        }
      }
      stage('Deploy') {
        if (params.Skip_Deploy != true) {
          // TODO
          echo 'do deploy'
        } else {
          echo 'Skip deploy'
        }
      }
      stage('Deploy to production') {
        def toProdParams
        def didTimeout = false
        try {
          timeout(time: 15, unit: 'SECONDS') { // change to a convenient timeout for you
            toProdParams = input(
              id: 'deployToProd', message: 'Deploy to production?', parameters: [
                choice(choices: ['prod-a.com/api', 'prod-b.com/api'], description: 'Backend endpoint to connect', name: 'Backend_Uri'),
                booleanParam(defaultValue: false, description: 'Archive this package', name: 'Archive')
              ])
          }
        } catch (err) { // timeout reached or input false
          // def user = err.getCauses()[0].getUser() // required administrator
          //if('SYSTEM' == user.toString()) { // SYSTEM means timeout.
          didTimeout = true
          //} else {
          //toProd = false
          //echo "Aborted by: [${user}]"
          //}
        }
        echo '✋Your choice: ' + toProdParams // null if timeout
        if (toProdParams) {
          echo toProdParams.Backend_Uri
        }

        if (didTimeout) {
          // do something on timeout
          echo "no input was received before timeout"
        } else if (toProdParams) {
          // do something
          echo "Deployed to production."
        } else {
          // do something else
          echo "Skip deployment to production."
        }
      }
    }
  } catch (error) {
    echo """❗Exception thrown: 
    ${error.class}
    ${error.message}
    """

    // error.printStackTrace() // required administrator

    currentBuild.result = 'FAILURE'
  } finally {
    if (currentBuild.result == 'SUCCESS') {
      // TODO
    } else {
      // TODO
    }
    echo currentBuild.result
  }
}
```


## Docker in Node


```groovy
node ('your-server-node-label') {
	stage('Test') {
    docker.image('node:7-alpine').withRun() { c ->
        sh 'node --version'
    }
  }
}
```


## Maven and Deploy


```groovy
pipeline {
    agent any

    tools { 
        maven 'Maven 3.5'
    }

    environment { 
        APP_NAME     = 'wf'
        DEPLOY_TO    = '../../../../websites/demo/'
        EMAIL_RECIPIENTS = 'zb@bndy.net'
        HAS_DEPLOYMENT   = 'false'
    }

    stages {
        stage('Prepare') {
            steps {
                updateGithubStatus("PENDING", "Begin to build");
                //sh 'printenv'
                sh 'java -version'
                sh 'mvn -v'
                sh 'mkdir -p ../../email-templates/ && \\cp ./jenkins/my-groovy-html.template ../../email-templates/my-groovy-html.template'
            }
        }
        stage('Build') {
            steps {
                echo 'Building...'
                sh 'mvn -B -DskipTests clean package' 
            }
        }
        stage('Test') {
            steps {
                echo 'Skip tests'
            }
        }
        stage('Deploy') {
            when {
                // following expression is just available for multi-branch project
                branch 'master'
            }
            steps {
                echo 'Deploying....'
                sh 'rm -f ${DEPLOY_TO}/${APP_NAME}.war'
                sh 'rm -Rf $DEPLOY_TO/${APP_NAME}'
                sh 'mv ./target/wf-*.war ${DEPLOY_TO}/${APP_NAME}.war'
                script {
                    HAS_DEPLOYMENT = 'true'
                }
            }
        }
    }
    
    post {
        success {
            updateGithubStatus("SUCCESS", "Build complete");
            sendEmail("SUCCESS");
        }
        unstable {
            updateGithubStatus("UNSTABLE", "Build complete");
            sendEmail("UNSTABLE");
        }
        failure {
            updateGithubStatus("FAILURE", "Build complete");
            sendEmail("FAILURE");
        }
    }
}

// get change log to be send over the mail
@NonCPS
def getChangeString() {
    MAX_MSG_LEN = 100
    def changeString = ""

    echo "Gathering SCM changes"
    def changeLogSets = currentBuild.changeSets
    for (int i = 0; i < changeLogSets.size(); i++) {
        def entries = changeLogSets[i].items
        for (int j = 0; j < entries.length; j++) {
            def entry = entries[j]
            truncated_msg = entry.msg.take(MAX_MSG_LEN)
            changeString += "<li>${truncated_msg} [${entry.author}]</li>"
        }
    }

    if (!changeString) {
        changeString = "<li>No new changes</li>"
    }
    return changeString
}

def sendEmail(status) {
    def subject = "[" + status + "] ${currentBuild.fullDisplayName}"
    if (HAS_DEPLOYMENT == 'true') {
        subject += " - deployed"
    }

    // Default Email Notification Plugin: email(...), but below supports html
        emailext(
	mimeType: "text/html",
        to: "$EMAIL_RECIPIENTS",
        subject: "${subject}",
	body: '''${SCRIPT, template="my-groovy-html.template"}''',
        //body: "Changes:<ul>" + getChangeString() + "</ul><br />Check console output at: ${BUILD_URL}console" + "<br />",
	recipientProviders: [[$class: 'CulpritsRecipientProvider'], [$class: 'RequesterRecipientProvider']]
    )
}

// set GitHub status
def getRepoURL() {
    sh "git config --get remote.origin.url > .git/remote-url"
    return readFile(".git/remote-url").trim()
}

def getCommitSha() {
    sh "git rev-parse HEAD > .git/current-commit"
    return readFile(".git/current-commit").trim()
}

def updateGithubStatus(status, message) {
    // status: pending, success, failure or error
    repoUrl = getRepoURL()
    commitSha = getCommitSha()

    step ([
        $class: 'GitHubCommitStatusSetter',
        reposSource: [$class: "ManuallyEnteredRepositorySource", url: repoUrl],
        commitShaSource: [$class: "ManuallyEnteredShaSource", sha: commitSha],
        errorHandlers: [[$class: 'ShallowAnyErrorHandler']],
        statusResultSource: [
            $class: 'ConditionalStatusResultSource',
            results: [
                [$class: 'AnyBuildResult', state: status, message: message]
            ]
        ]
    ])
}
```

