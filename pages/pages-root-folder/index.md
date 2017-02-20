---
#
# Use the widgets beneath and the content will be
# inserted automagically in the webpage. To make
# this work, you have to use › layout: frontpage
#
layout: frontpage
header:
  image_fullwidth: /images/header_home.jpg

widget1:
  title: "Web Framework"
  url: 'https://github.com/bndynet/web-framework'
  image: 'https://raw.githubusercontent.com/BndyNet/web-framework/master/screenshots/home.png'
  text: 'A web framework with Admin template for building great Web sites and Web applications using C# fast and easily.'

widget2:
  title: "Web Framework"
  url: 'https://github.com/bndynet/web-framework'
  text: 'A web framework with Admin template for building great Web sites and Web applications using C# fast and easily.'
  image: 'https://raw.githubusercontent.com/BndyNet/web-framework/master/screenshots/home-sidebar-horizontal.png'

widget3:
  title: "Web Framework"
  url: 'https://github.com/bndynet/web-framework'
  text: 'A web framework with Admin template for building great Web sites and Web applications using C# fast and easily.'
  image: 'https://raw.githubusercontent.com/BndyNet/web-framework/master/screenshots/home-header-light.png'

#
# Use the call for action to show a button on the frontpage
#
# To make internal links, just use a permalink like this
# url: /getting-started/
#
# To style the button in different colors, use no value
# to use the main color or success, alert or secondary.
# To change colors see sass/_01_settings_colors.scss
#
callforaction:
  url: /GitHubVisualizer/#user=bndynet
  text: View GitHub Projects Diagram ›
  style: alert
permalink: /index.html
#
# This is a nasty hack to make the navigation highlight
# this page as active in the topbar navigation
#
homepage: true
---

<div id="videoModal" class="reveal-modal large" data-reveal="">
  <div class="flex-video widescreen vimeo" style="display: block;">
    <iframe width="1280" height="720" src="/GitHubVisualizer/#user=bndynet" frameborder="0" allowfullscreen frameborder="0"></iframe>
  </div>
  <a class="close-reveal-modal">&#215;</a>
</div>



