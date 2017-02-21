---
#
# Use the widgets beneath and the content will be
# inserted automagically in the webpage. To make
# this work, you have to use › layout: frontpage
#
layout: frontpage
header: no
  #image_fullwidth: /images/header_home.jpg

widget1:
  title: "Default Theme"
  url: 'https://github.com/bndynet/web-framework'
  image: 'https://raw.githubusercontent.com/BndyNet/web-framework/master/screenshots/home.png'
  text: 'The Web Framework is a project for building great Web sites and Web applications using C# fast and easily.'

widget2:
  title: "Horizontal Sidebar"
  url: 'https://github.com/bndynet/web-framework'
  text: 'Add with-sidebar-horizontal class to body tag for setting the sidebar horizontal.'
  image: 'https://raw.githubusercontent.com/BndyNet/web-framework/master/screenshots/home-sidebar-horizontal.png'

widget3:
  title: "Light Header"
  url: 'https://github.com/bndynet/web-framework'
  text: 'class: with-header-light'
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
  text: ""
  style: alert
permalink: /index.html

#
# This is a nasty hack to make the navigation highlight
# this page as active in the topbar navigation
#
homepage: true
---
