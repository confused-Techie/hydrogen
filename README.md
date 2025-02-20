# WARNING:

As Pulsar users have had a great deal of trouble with Hydrogen, but everyone seems to love it, I've decided to try my hand at fixing it.

My Goals:
  - Make it Maintainable
  - Make it Functional
  - Keep it updated with Pulsar

My Issues:
  - I've never ever used Hydrogen
  - I've never ever used Jypter Notebook or Friends
  - I really don't like TypeScript & FlowJS

What this Means:
  - I'm preforming a rather rude hostile takeover on the code here, I can't say if it'll work, or be helpful.
  - I'm really really trusting the tests here. I know the current maintainer is fantastic about relying on tests. So let's hope the same is true here.

I'm trying to remove any and all fancy build tools, and get it back to standard JavaScript, by just taking the `dist` ugly output, and prettifying it.

Install:

You can't install this like a regular modules (of course):

- apm install
- npx electron-rebuild -v 12.2.3
- node run build
- npm run test

# Hydrogen <img src="https://cdn.jsdelivr.net/gh/nteract/hydrogen@17eda24547a2195b4a21c883af3dd12ec50bd442/static/animate-logo.svg" alt="hydrogen animated logo" height="50px" align="right" />

[![CI](https://github.com/nteract/hydrogen/actions/workflows/CI.yml/badge.svg)](https://github.com/nteract/hydrogen/actions/workflows/CI.yml)

Hydrogen is an interactive coding environment that supports Python, R, JavaScript and [other Jupyter kernels](https://github.com/jupyter/jupyter/wiki/Jupyter-kernels).

Checkout our [Documentation](https://nteract.gitbooks.io/hydrogen/) and [Medium blog post](https://medium.com/nteract/hydrogen-interactive-computing-in-atom-89d291bcc4dd) to see what you can do with Hydrogen.

![hero](https://cloud.githubusercontent.com/assets/13285808/20360886/7e03e524-ac03-11e6-9176-37677f226619.gif)

# Atom Sunset Notice

Atom is [sunsetted](https://github.blog/2022-06-08-sunsetting-atom/).  It is not possible to publish new packages anymore. If you have Atom working offline locally, it should continue to work, but the servers are down.

You can export `ipynb` from Hydrogen using [this method](https://github.com/nteract/hydrogen/blob/master/docs/Usage/NotebookFiles.md#notebook-export) and migrate to the following alternatives:

- Nteract, which is directly inspired by Hydrogen.
https://nteract.io/

- VsCode with its Jupyter integration
https://code.visualstudio.com/docs/datascience/jupyter-notebooks

- Pycharm with Jupyter Notebook integration
https://www.jetbrains.com/pycharm/


## Contents

1. [Background](#background)
2. [Features](#features)
3. [Plugins for Hydrogen](#plugins-for-hydrogen)
4. [Useful external packages](#useful-external-packages)
5. [How it works](#how-it-works)
6. [Why "Hydrogen"?](#why-hydrogen)
7. [Contributing](#contributing)
8. [Changelog](#changelog)
9. [License](#license)

## Background

Hydrogen was inspired by Bret Victor's ideas about the power of instantaneous feedback and the design of [Light Table](http://lighttable.com/). Running code inline and in real time is a more natural way to develop. By bringing the interactive style of Light Table to the rock-solid usability of Atom, Hydrogen makes it easy to write code the way you want to.

You also may be interested in our latest project – [nteract](https://github.com/nteract/nteract) – a desktop application that wraps up the best of the web based Jupyter notebook.

## Features

- execute a line, selection, or block at a time
- rich media support for plots, images, and video
- watch expressions let you keep track of variables and re-run snippets after every change
- completions from the running kernel, just like autocomplete in the Chrome dev tools
- code can be inspected to show useful information provided by the running kernel
- one kernel per language (so you can run snippets from several files, all in the same namespace)
- interrupt or restart the kernel if anything goes wrong
- use a custom kernel connection (for example to run code inside Docker), read more in the "Custom kernel connection (inside Docker)" section

## [Documentation](https://nteract.gitbooks.io/hydrogen/)

- [Installation](https://nteract.gitbooks.io/hydrogen/docs/Installation.html)
- [Usage](https://nteract.gitbooks.io/hydrogen/docs/Usage/GettingStarted.html)
  - [Getting started](https://nteract.gitbooks.io/hydrogen/docs/Usage/GettingStarted.html)
  - [Examples](https://nteract.gitbooks.io/hydrogen/docs/Usage/Examples.html)
  - [Notebook Import and Export](https://nteract.gitbooks.io/hydrogen/docs/Usage/NotebookFiles.html)
  - [Remote Kernels](https://nteract.gitbooks.io/hydrogen/docs/Usage/RemoteKernelConnection.html)
- [Troubleshooting Guide](https://nteract.gitbooks.io/hydrogen/docs/Troubleshooting.html)
- [Style Customization](https://nteract.gitbooks.io/hydrogen/docs/StyleCustomization.html)
- [Plugin API](https://nteract.gitbooks.io/hydrogen/docs/PluginAPI.html)

## Plugins for Hydrogen

Hydrogen has support for plugins. Feel free to add your own to the list:

- [Hydrogen Launcher](https://github.com/lgeiger/hydrogen-launcher): launches terminals and Jupyter consoles connected to Hydrogen
- [hydrogen-python](https://github.com/nikitakit/hydrogen-python): provides various Python-specific features
- [Data Explorer](https://github.com/BenRussert/data-explorer): allows you to use [nteract data-explorer](https://github.com/BenRussert/data-explorer) within Hydrogen

If you are interested in building a plugin take a look at our [plugin API documentation](https://nteract.gitbooks.io/hydrogen/docs/PluginAPI.html).

## Useful external packages

Here is a list of external packages that could be useful when using Hydrogen (without using Hydrogen plugin API, as such they're mostly only related to the UIs):

- [markdown-cell-highlight](https://github.com/aviatesk/atom-markdown-cell-highlight): highlights code cells in markdown files
- [Cell Navigation](https://github.com/hoishing/cell-navigation): enables easy jumps between Hydrogen code cells
- [Hydrogen Cell Separator](https://github.com/jhabriel/hydrogen-cell-separator): gives simple horizontal line decorations for Hydrogen code cells

If you find/create a package that you think can be useful when used in combination with Hydrogen, feel free to make a PR and add it.

## How it works

Hydrogen implements the [messaging protocol](http://jupyter-client.readthedocs.io/en/latest/messaging.html) for [Jupyter](https://jupyter.org/). Jupyter (formerly IPython) uses ZeroMQ to connect a client (like Hydrogen) to a running kernel (like IJulia or iTorch). The client sends code to be executed to the kernel, which runs it and sends back results.

## Why "Hydrogen"?

Hydrogen atoms make up 90% of Jupiter by volume.

Plus, it was easy to make a logo.

## Contributing

Thanks for taking the time to contribute. Take a look at our [Contributing Guide](https://github.com/nteract/hydrogen/blob/master/CONTRIBUTING.md) to get started.

Then, take a look at any issue labeled [good first issue](https://github.com/nteract/hydrogen/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or [help wanted](https://github.com/nteract/hydrogen/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) that has not been claimed. These are great starting points.

## Changelog

Every release is documented on the [GitHub Releases page](https://github.com/nteract/hydrogen/releases).

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/nteract/hydrogen/blob/master/LICENSE.md) file for details

**[⬆ back to top](#contents)**
