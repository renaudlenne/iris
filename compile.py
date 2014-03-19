import subprocess, shlex, yaml
import bin.merge as merge

working_dir = r"static"

#update submodules to latest version ie static
submod_update = subprocess.Popen(shlex.split("git submodule foreach git pull origin master"), shell=True)
submod_update.wait() #wait to complete before build

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
