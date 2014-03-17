import subprocess, shlex

working_dir = r"static"

#update submodules to latest version ie static
submod_update = subprocess.Popen(shlex.split("git submodule foreach git pull origin master"), shell=True)
submod_update.wait() #wait to complete before build

#install build deps
npm_install = subprocess.Popen(shlex.split("npm install"), cwd=working_dir, shell=True)

npm_install.wait()

#add config options... Gotta decide how to update them to fit the new version

#build scripts
subprocess.Popen(shlex.split("grunt"), cwd=working_dir, shell=True)
