from twisted.web import resource, server, static, error as http_error

import json
import os

class AJAXException(Exception):
  pass

class PassthruException(Exception):
  pass

def getJSON(path):
  file = open(path)
  data = json.load(file)
  file.close()
  return data

class LocalizationEngine(resource.Resource):
  isLeaf = True
  localePath = "static/lang/"
  
  def __init__(self, prefix):
    pass

  def render_GET(self, request):
    return self.getLocale(request)

  def getLocale(self, request):
    """
    Request a localization and respond with json object of appropriate locale
    """
    setLocales = request.getCookie("i18n") #preferred locale (todo implement)?
    locales = []
    if setLocales:
      locales = json.load(setLocales)
    else:
      lang_header = request.headers.get("Accept-Language", "en") # for example en-US,en;q=0.8,es;q=0.6
      locales = [locale.split(';')[0] for locale in lang_header.split(',')]

    basePath = self.localePath + (request.args.get("path", [""])[0])
    if not basePath.endswith("/"):
      basePath += "/"

    print basePath, "exists? " + str(os.path.exists(basePath)), "exists? " + str(os.path.exists(basePath + "base.json"))

    if not os.path.exists(basePath):
      raise http_error.NoResource().render(request)

    lang = getJSON(basePath + "base.json")

    # reverse so specificity overrides
    for locale in reversed(locales):
      path = basePath + locale + ".json"
      if os.path.exists(path):
        lang.update(getJSON(path))

    request.addCookie("lang", json.dumps(locales))
    request.write(json.dumps(lang))
    request.finish()

    return True
