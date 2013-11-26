
ui.Interface = new Class({
    Implements: [Options, Events],
    options: {
        node: false,//use the node implementation with socket.io
        debug: false,

        appTitle: ""/*Quake Net Web IRC*/,
        networkName: "" /* Quake Net */,
        networkServices: [],//registered hosts to treat as a server admin

        minRejoinTime: [5, 20, 300], //array - secs between consecutive joins to a single channel - see js/src/irc/ircclient@canjoinchan

        validators: {//test is a helper from ircutils
            nick: [{
                test: test(/^[\s\S]{1,9}$/),//max 9 by spec some servers implement different rules
                description: "Nick must be between 1 and 9 characters"
            }],
            password: [{
                test: function(pass, $ele) {
                    return pass.length > 0 || !$ele.isVisible();
                },
                description: "Missing password"
            }],
            username: [{
                test: function(pass, $ele) {
                    return pass.length > 0 || !$ele.isVisible();
                },
                description: "Missing username"
            }]
        },

        hue: null,
        saturation: null,
        lightness: null,

        theme: undefined,
        uiOptionsArg: null,

        socketio: "//cdnjs.cloudflare.com/ajax/libs/socket.io/0.9.16/socket.io.min.js",

        loginRegex: /I recogni[sz]e you\./
    },
    clients: [],


    //Note removed option args to configure router. May support it later.
    initialize: function(element, UI, options) {
        options = this.setOptions(options).options;
        var self = this;
        var settings = self.options.settings = new config.Settings(options.settings);
        
        //parse query string
        var query = window.location.search;
        if(query) {
            var parsed = query.slice(1).parseQueryString();
            if(parsed.channels) settings.set("channels", concatUnique(settings.get("channels"), util.unformatChannelString(parsed.channels)));
        }

        window.addEvent("domready", function() {
            self.element = $(element);

            self.ui = new UI(self.element, new ui.Theme(options.theme), options); //unconventional naming scheme

            if(options.node) { Asset.javascript(options.socketio); }
            //cleans up old properties
            if(settings.get("newb")) {
                self.welcome();
                settings.set("newb", false);
            }
            self.ui.loginBox();

            self.ui.addEvent("login:once", function(loginopts) {
                var ircopts = _.extend(Object.subset(options, ['settings', 'specialUserActions', 'minRejoinTime', 'networkServices', 'loginRegex', 'node']),
                                        loginopts);

                var client = self.IRCClient = new irc.IRCClient(ircopts/*, self.ui*/);
                self.ui.newClient(client);
                client.writeMessages(lang.copyright);
                client.connect();
                client.addEvent("auth", function(data) {
                    self.ui.showNotice({
                        title: 'Authenticated with network!',
                        body: util.format("{nick}: {message}", data)
                    }, true);
                });

                window.onbeforeunload = function(e) {
                    if (client.isConnected()) {//ie has gotten passed the IRC gate
                        var message = "This action will close all active IRC connections.";
                        (e || window.onevent).returnValue = message;//legacy ie
                        return message;
                    }
                };
                window.onunload = client.quit;

                self.fireEvent("login", {
                    'IRCClient': client,
                    'parent': self
                });
            });
        });
    },
    welcome: function() {
        ui.WelcomePane.show(this.ui, _.extend({
            element: this.element,
            firstvisit: true
        }, this.options)); 
    }
});
