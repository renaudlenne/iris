import subprocess, shlex

working_dir = r"static"

#install build deps
npm_install = subprocess.Popen(shlex.split("npm install"), cwd=working_dir, shell=True)

npm_install.wait() #wait to complete before build

#build scripts
subprocess.Popen(shlex.split("grunt"), cwd=working_dir, shell=True)