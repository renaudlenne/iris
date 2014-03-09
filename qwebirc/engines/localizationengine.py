from twisted.web import resource, server, static, error as http_error

import json
import os

class AJAXException(Exception):
  pass

class PassthruException(Exception):
  pass
  
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
    lang_header = request.headers.get("Accept-Language", "en")
    locales = [locale.split(';')[0] for locale in lang_header.split(',')]

    lang = json.load(open(self.localePath + "base.json"))

    for locale in locales:
      path = self.localePath + locale + ".json"
      if os.path.exists(path):
        lang.update(json.load(open(path)))

    request.write(json.dumps(lang))
    request.finish()

    return True
