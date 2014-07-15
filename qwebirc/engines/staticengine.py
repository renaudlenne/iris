from twisted.web import resource, server, static, error
from qwebirc.util.gziprequest import GZipRequest
import qwebirc.util as util
import pprint
from adminengine import AdminEngineAction
from qwebirc.util.caching import cache

class StaticEngine(static.File):
  isLeaf = False
  hit = util.HitCounter()
  
  def __init__(self, *args, **kwargs):
    static.File.__init__(self, *args, **kwargs)
    
  def render(self, request):
    self.hit(request)
    cache(request)
    request = util.apply_gzip(request)
    return static.File.render(self, request)
    
  @property
  def adminEngine(self):
    return {
      #"GZip cache": [
        #("Contents: %s" % pprint.pformat(list(cache.keys())),)# AdminEngineAction("clear", d))
      #],
      "Hits": [
        (self.hit,),
      ]
    }

  def directoryListing(self):
    return error.ForbiddenResource()
