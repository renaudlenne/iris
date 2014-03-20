QWebIRC-enhancements via Iris
=============  

Hacked up Iris server to provide Atheme RPC, localization, and an improved build step for my [qwebirc fork](https://github.com/megawac/qwebirc-enhancements). See branches of this repo if you want to see some pre-configured instances. 

An instance of this code is up at http://geeks-irc.herokuapp.com

##Installation

- Clone the repo and the submodule:
`git clone [--recursive] git@github.com:megawac/iris.git [-b Branch]`

- Install the server python dependencies ([outdated installation instructions](https://github.com/atheme/iris)):
`pip install -r requirements.txt`

- Install [node.js](nodejs.org)

- Configure qwebirc web application settings (go to `/frontend-config.yml`)

- **Build the static files** Run `compile.py` which will install the build dependencies for the static files, merge the `frontend-config` with `static/app-config.yml` then build the files based on the conifg:
```
python compily.py
```
- Configure server settings (server ip, port, etc) in config.py

- Run server
```
python run.py
```
Default port is your environment default port or 9090

## Making changes

Most changes will require a server restart or a grunt build. If you make changes to the python code you may need to restart the server. Making changes to most of the javascript or css files will require you to run grunt to recompile the static resources.
