# Source for http://bndy.net website

## Quick-start guide

Requres Ruby development environment with all headers and RubyGems installed (see Jekyll’s requirements):

```
# Install Jekyll and Bundler gems through RubyGems
gem install jekyll bundler

# Install packages
bundle install

# Build the site on the preview server
jekyll serve

# Now browse to http://localhost:4000
```

NOTE: use `jekyll build` for publishing

Issues:

- You have already activated <pkg> <version>, but your Gemfile requires <pkg> <version>

  Fix: `bundle clean --force` to remove every system gem not in this bundle
