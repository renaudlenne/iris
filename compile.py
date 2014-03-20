import subprocess, shlex, yaml
import bin.merge as merge

working_dir = r"static"

#update submodules to latest version ie static
#see http://stackoverflow.com/questions/1030169/easy-way-pull-latest-of-all-submodules
#step by step by step
s1 = subprocess.Popen(shlex.split("git pull"))
s1.wait() #wait to complete before build
s2 = subprocess.Popen(shlex.split("git submodule init"))
s2.wait()
s3 = subprocess.Popen(shlex.split("git submodule update"))
s3.wait()
s4 = subprocess.Popen(shlex.split("git submodule status"))
s4.wait()

#install build deps
npm_install = subprocess.Popen(shlex.split("npm install"), cwd=working_dir, shell=True)

npm_install.wait()

#add config options... Gotta decide how to update them to fit the new version
with open("frontend-config.yml") as cf:
    pyconfig = yaml.load(cf)
with open(working_dir + "/" + "app-config.yml") as working_config:
    config = yaml.load(working_config)
    merge(config, pyconfig) #prefer opts set in python instance
with open(working_dir + "/" + "app-config.yml", "w") as working_config:
    working_config.write( yaml.dump(config, default_flow_style=True) ) #write em out


#build scripts
subprocess.Popen(shlex.split("grunt"), cwd=working_dir, shell=True)
