---
title: iTerm2 on MacOS
categories: [Tools ]
tags: [Tools ]
---

[https://www.notion.so/iTerm2-on-MacOS-5df973b859404bb1b6b436026e3b7e50](https://www.notion.so/iTerm2-on-MacOS-5df973b859404bb1b6b436026e3b7e50)


# How to install


## iTerm2


brew cask install iterm2


Or, if you do not have homebrew (you should ;)): [Download](http://www.iterm2.com/downloads.html) and install iTerm2


iTerm2 has better color fidelity than the built in Terminal, so your themes will look better.


Get the iTerm color settings


Just save it somewhere and open the file(s). The color settings will be imported into iTerm2. Apply them in iTerm through iTerm → preferences → profiles → colors → load presets. You can create a different profile other than `Default` if you wish to do so.


# Oh My Zsh


More info here: https://github.com/robbyrussell/oh-my-zsh


## Install with curl


sh -c “$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)”


When the installation is done, edit `~/.zshrc` and set `ZSH_THEME="agnoster"`


## Powerlevel9k


If you prefer the Powerlevel9k look with added info such as exit codes and timestamps on the right, run:


git clone https://github.com/bhilburn/powerlevel9k.git ~/.oh-my-zsh/custom/themes/powerlevel9k


Then edit your `~/.zshrc` and set `ZSH_THEME="powerlevel9k/powerlevel9k"`.


Powerlevel9k offers a whole lot more, best is to [check out these user made configs yourself](https://github.com/bhilburn/powerlevel9k/wiki/Show-Off-Your-Config).


## Install a patched font


Open the downloaded font and press “Install Font”.


Set this font in iTerm2 (14px is my personal preference) (iTerm → Preferences → Profiles → Text → Change Font).


Restart iTerm2 for all changes to take effect.


# Further tweaking


Things like


can be found in the section below.


## Auto suggestions (for Oh My Zsh)


Just follow these steps: https://github.com/zsh-users/zsh-autosuggestions/blob/master/INSTALL.md#oh-my-zsh


If the auto suggestions do not appear to show, it could be a problem with your color scheme. Under “iTerm → Preferences → Profiles → Colors tab”, check the value of Black Bright, that is the color your auto suggestions will have. It will be displayed on top of the Background color. If there is not enough contrast between the two, you won’t see the suggestions even if they’re actually there..


## Enable word jumps and word deletion, aka natural text selection


By default, word jumps (option + → or ←) and word deletions (option + backspace) do not work. To enable these, go to “iTerm → Preferences → Profiles → Keys → Load Preset… → Natural Text Editing → Boom! Head explodes”


## Custom prompt styles


By default, your prompt will now show “user@hostname” in the prompt. This will make your prompt rather bloated. Optionally set `DEFAULT_USER` in `~/.zshrc` to your regular username (these must match) to hide the “user@hostname” info when you’re logged in as yourself on your local machine. You can get your exact username value by executing `whoami` in the terminal.


For further customisation of your prompt, you can follow a great guide here: https://code.tutsplus.com/tutorials/how-to-customize-your-command-prompt–net-24083


## Syntax highlighting


If you do not have or do not like homebrew, follow [the installation instructions](https://github.com/zsh-users/zsh-syntax-highlighting/blob/master/INSTALL.md) instead.


After installation through homebrew, add


to **the end** of your `.zshrc` file. After that, it’s best to restart your terminal. Sourcing your `~/.zshrc` does not seem to work well with this plugin.


## Visual Studio Code config


Installing a patched font will mess up the integrated terminal in VS Code unless you use the proper settings. You’ll need to go to settings (CMD + ,) and add or edit the following values:


You can also set the fontsize e.g.: `"terminal.integrated.fontSize": 14`


## Font with icons


Copy [patched fonts](https://github.com/gabrielelana/awesome-terminal-fonts/tree/patching-strategy/patched) files to **~/.fonts** and install all fonts, and set the installed font for iTerm2. Then add below code to first line of **~/.zshrc**. Restart your iTerm2.


`source ~/.fonts/*.sh POWERLEVEL9K_MODE="awesome-patched"`

