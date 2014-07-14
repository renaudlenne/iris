# Set configuration option lists.

sections = [
    "adminengine",
    "atheme",
    "athemeengine",
    "execution",
    "feedbackengine",
    "irc",
    "proxy",
    "tuneback"
]

booleans = [
    ("atheme", "nickserv_login"),
    ("atheme", "chan_list_cloud_view"),
    ("atheme", "chan_list_on_start"),
    ("athemeengine", "chan_list_enabled"),
    ("irc", "ssl")
]
    
floats = [
    ("tuneback", "update_freq"),
]

integers = [
    ("athemeengine", "chan_list_count"),
    ("athemeengine", "chan_list_max_age"),
    ("execution", "syslog_port"),
    ("feedbackengine", "smtp_port"),
    ("irc", "port"),
    ("tuneback", "dns_timeout"),
    ("tuneback", "http_ajax_request_timeout"),
    ("tuneback", "http_request_timeout"),
    ("tuneback", "maxbuflen"),
    ("tuneback", "maxlinelen"),
    ("tuneback", "maxsubscriptions"),
]

lists = [
    ("execution", "syslog_addr"),
    ("proxy", "forwarded_for_ips"),
]

strings = [
    ("athemeengine", "xmlrpc_path"),
    ("execution", "args"),
    ("proxy", "forwarded_for_header"),
    ("irc", "server"),
    ("irc", "bind_ip"),
    ("irc", "realname"),
    ("irc", "ident"),
    ("irc", "ident_string"),
    ("irc", "webirc_mode"),
    ("irc", "webirc_password")
]
