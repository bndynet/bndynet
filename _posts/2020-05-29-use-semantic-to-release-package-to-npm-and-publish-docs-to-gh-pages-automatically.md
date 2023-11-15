---
title: Use @semantic to release package to NPM and publish docs to gh-pages automatically
categories: [Programming,JavaScript]
tags: [Programming,JavaScript]
---

[https://www.notion.so/Use-semantic-to-release-package-to-NPM-and-publish-docs-to-gh-pages-automatically-9f1bdd8734874fcaa1ed9621c1867f9b](https://www.notion.so/Use-semantic-to-release-package-to-NPM-and-publish-docs-to-gh-pages-automatically-9f1bdd8734874fcaa1ed9621c1867f9b)

1. Install requisite dependencies

	```text
	# run local scripts for executing ts file for deploying docs
	npm i -D @types/node
	npm i -D ts-node
	
	# semantic-release and plugin for attaching version number to package.json
	npm i -D semantic-release
	npm i -D @semantic-release/git
	
	# git hooks and validate commit messages
	npm i -D husky
	npm i -D @commitlint/cli
	```

2. Add content to **package.json**

	```json
	{
	  "scripts": {
	    "deploy-docs": "ts-node tools/gh-pages-publish.ts",
	    "semantic-release": "semantic-release"
	  },
	  "files": [
	    "dist"
	  ],
	  // if package scoped like @bndynet/ui, by default private, so...
	  "publishConfig": {
	    "access": "public"
	  },
	  "husky": {
	    "hooks": {
	      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
	    }
	  }
	}
	```

3. New file **.releaserc** (Release Configurations)

	```json
	{
	  "branch": "master",
	  "prepare": [
	    "@semantic-release/npm",
	    {
	      "path": "@semantic-release/git",
	      "assets": [
	        "package.json",
	        "package-lock.json"
	      ],
	      "message": "chore(release): ${nextRelease.version} by CI\n\n${nextRelease.notes}"
	    }
	  ],
	  "plugins": [
	    "@semantic-release/commit-analyzer",
	    "@semantic-release/release-notes-generator",
	    "@semantic-release/npm",
	    "@semantic-release/github",
	    "@semantic-release/git"
	  ]
	}
	```

4. New file **.travis.yml** (CI configurations for publishing docs and releasing package)

	```yaml
	language: node_js
	cache:
	  directories:
	    - ~/.npm
	notifications:
	  email: false
	node_js:
	  - '10'
	script:
	  - npm run build
	after_success:
	  - if [ "$TRAVIS_BRANCH" = "master" -a "$TRAVIS_PULL_REQUEST" = "false" ]; then npm run deploy-docs; fi
	  - if [ "$TRAVIS_BRANCH" = "master" -a "$TRAVIS_PULL_REQUEST" = "false" ]; then npm run semantic-release; fi
	branches:
	  except:
	  - /^v\d+\.\d+\.\d+$/
	
	```

5. New file **tools/gh-pages-publish.ts** (Scripts to upload docs to gh-pages branch)

	```typescript
	import { cd, exec, echo, touch } from "shelljs";
	import { readFileSync } from "fs";
	import { parse } from "url";
	
	let repoUrl
	let pkg = JSON.parse(readFileSync("package.json"))
	if (typeof pkg.repository === "object") {
	  if (!pkg.repository.hasOwnProperty("url")) {
	    throw new Error("URL does not exist in repository section")
	  }
	  repoUrl = pkg.repository.url
	} else {
	  repoUrl = pkg.repository
	}
	
	let parsedUrl = parse(repoUrl)
	let repository = (parsedUrl.host || "") + (parsedUrl.path || "")
	let ghToken = process.env.GH_TOKEN
	
	echo("Deploying docs!!!")
	cd("docs")
	touch(".nojekyll")
	exec("git init")
	exec("git add .")
	exec('git config user.name "Bendy Zhang"')
	exec('git config user.email "zb@bndy.net"')
	exec('git commit -m "docs(docs): update gh-pages"')
	exec(
	`git push --force --quiet "https://${ghToken}@${repository}" master:gh-pages`
	)
	echo("Docs deployed!!")
	```

6. Add environment variables to CI (Travis CI)
	- GH_TOKEN or GITHUB_TOKEN: _your token generated in GitHub and has repo scopes_
	- NPM_TOKEN: _your token generated in NPM_
