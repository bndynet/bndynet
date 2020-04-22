---
layout: page
title:  "GitHub OAuth Busy Developer's Guide"
teaser: ""
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

# GitHub OAuth Busy Developer's Guide

This is a quick guide to OAuth2 support in GitHub for developers.  This is still experimental and could change at any moment.  This Gist will serve as a living document until it becomes finalized at [Develop.GitHub.com](http://develop.github.com/).

OAuth2 is a protocol that lets external apps request authorization to private details in your GitHub account without getting your password.  All developers need to [register their application](http://github.com/account/applications/new) before getting started.

## Web Application Flow

* Redirect to this link to request GitHub access:

<pre><code>https://github.com/login/oauth/authorize?
  client_id=...&
  redirect_uri=http://www.example.com/oauth_redirect</code></pre>

* If the user accepts your request, GitHub redirects back to your site with 
  a temporary code in a `code` parameter.  Exchange this for an access token:

<pre><code>POST https://github.com/login/oauth/access_token?
  client_id=...&
  redirect_uri=http://www.example.com/oauth_redirect&
  client_secret=...&
  code=...

RESPONSE:
access_token=...</code></pre>

* You have the access token, so now you can make requests on the user's behalf:

<pre><code>GET https://github.com/api/v2/json/user/show?
  access_token=...</code></pre>

## Javascript Flow

Disabled, for now...

## Desktop flow

Disabled, for now...

## Scopes

* (no scope) - public read-only access (includes user profile info, public repo info, and gists).
* `user` - DB read/write access to profile info only.
* `public_repo` - DB read/write access, and Git read access to public repos.
* `repo` - DB read/write access, and Git read access to public and private repos.
* `gist` - write access to gists.

Your application can request the scopes in the initial redirection:

<pre><code>https://github.com/login/oauth/authorize?
  client_id=...&
  scope=user,public_repo&
  redirect_uri=http://www.example.com/oauth_redirect</code></pre>

## References

* [OAuth 2 spec](http://tools.ietf.org/html/draft-ietf-oauth-v2-07)
* [Facebook API](http://developers.facebook.com/docs/authentication/)
* [Ruby OAuth2 lib](https://github.com/intridea/oauth2)
* [simple ruby/sinatra example](https://gist.github.com/9fd1a6199da0465ec87c)
* [simple python example](https://gist.github.com/e3fbd47fbb7ee3c626bb) using [python-oauth2](http://github.com/dgouldin/python-oauth2)
* [Ruby OmniAuth example](http://github.com/intridea/omniauth)
* [Ruby Sinatra extension](http://github.com/atmos/sinatra_auth_github)
* [Ruby Warden strategy](http://github.com/atmos/warden-github)
* [Node.js demo using Nozzle](http://github.com/fictorial/nozzle/blob/master/demo/08-github-oauth2.js)

