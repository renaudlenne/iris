QWebirc-enhancements on Iris
=============  

This is my qwebirc frontend running on (a slightly adapted - 3 files changed) iris server. See branches if you want to see some pre-configured instances. 

An instance of this code is up at http://geeks-irc.herokuapp.com

##Installation

- Clone the repo and the submodule:
`git clone --recursive git@github.com:megawac/iris.git [-b Branch]`

- Install the server python dependencies ([outdated installation instructions](https://github.com/atheme/iris)):
`pip install -r requirements.txt`

- Install [node.js](nodejs.org)

- Configure qwebirc web application settings (go to static/configure/config.js)

- Install front end build dependencies and build:
```
cd static
npm install
grunt [--verbose]
```

- Configure server settings (server ip, port, etc) in config.py

- Run server
`python run.py`
Default port is 9090 or 5000

## Making changes

Most changes will require a server restart or a grunt build. If you make changes to the python code you may need to restart the server. Making changes to most of the javascript or css files will require you to run grunt to recompile the static resources.
