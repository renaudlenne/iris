from hitcounter import HitCounter
from gziprequest import GZipRequest

def apply_gzip(request):
  accept_encoding = request.getHeader('accept-encoding')
  if accept_encoding:
    encodings = accept_encoding.split(',')
    for encoding in encodings:
      name = encoding.split(';')[0].strip()
      if name == 'gzip':
        request = GZipRequest(request)
  return request