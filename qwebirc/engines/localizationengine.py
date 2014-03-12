from twisted.web import resource, server, static, error as http_error
import os

import qwebirc.util.qjson as json
from qwebirc.util.caching import cache

def getJSON(path):
  with open(path) as file:
    return json.loads(file.read())

#i18n engine
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
    requested = request.args.get("locale") #?locale=fr
    setLocales = request.getCookie("locale") #preferred locale (todo implement)?
    locales = []
    if requested:
      locales = requested
    elif setLocales:
      locales = json.loads(setLocales)
    else:
      lang_header = request.headers.get("Accept-Language", "en") # for example en-US,en;q=0.8,es;q=0.6
      locales = [locale.split(';')[0] for locale in lang_header.split(',')]

    basePath = self.localePath + (request.args.get("path", [""])[0])
    if not basePath.endswith("/"):
      basePath += "/"

    if not os.path.exists(basePath):
      raise http_error.NoResource().render(request)

    lang = getJSON(basePath + "base.json")

    # reverse so specificity overrides
    for locale in reversed(locales):
      path = basePath + locale + ".json"
      if os.path.exists(path):
        lang.update(getJSON(path))

    cache(request)
    # apply_gzip(request)
    request.write(json.dumps(lang))
    request.finish()
    return True
