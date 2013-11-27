// /* This could do with a rewrite from scratch. */
//going to rewrite using socket.io commet.
// //uris = dict(p=push, n=newConnection, s=subscribe)
(function() {
    //http://blog.mibbit.com/?p=143
    // moved browser specific headers to be removed here so it doesnt have to be computed each connection.
    // header nullables are browser dependent
    var killBit = "";
    var killHeaders = {//http://www.w3.org/TR/XMLHttpRequest/#dom-xmlhttprequest-setrequestheader
        // "User-Agent": killBit,
        "Accept": killBit,
        "Accept-Language": killBit
        /*,
        "Content-Type": "M"*/
    };

    irc.TwistedConnection = new Class({
        Implements: [Events, Options],
        Binds: ["send"],
        options: {
            initialNickname: "",
            minTimeout: 45000,
            maxTimeout: 5 * 60000,
            timeoutIncrement: 10000,
            initialTimeout: 65000,
            floodInterval: 200,
            floodMax: 10,
            floodReset: 5000,
            errorAlert: true,
            maxRetries: 5,
            serverPassword: null
        },
        connected: false,
        counter: 0,

        __sendQueue: [],
        __lastActiveRequest: null,
        __activeRequest: null,
        __sendQueueActive: false,

        __floodLastRequest: 0,
        __retryAttempts: 0,
        __floodCounter: 0,
        __floodLastFlood: 0,
        __timeoutId: null,


        initialize: function(options) {
            this.setOptions(options);
            this.__timeout = this.options.initialTimeout;
        },

        connect: function() {
            var self = this;
            self.connected = true;
            self.cacheAvoidance = util.randHexString(16);
            var request = self.newRequest("n");

            request.addEvent("complete", function(stream) {
                if (!stream) {
                    self.connected = false;
                    self.__error(lang.connectionFail);
                    return;
                } else if (!stream[0]) {
                    self.disconnect();
                    self.__error(lang.connError, stream);
                    return;
                }
                self.sessionid = stream[1];
                self.recv();
            });

            var postdata = "nick=" + encodeURIComponent(self.options.initialNickname);
            if ($defined(self.options.serverPassword)) {
                postdata += "&password=" + encodeURIComponent(self.options.serverPassword);
            }
            request.send(postdata);
        },

        disconnect: function() {
            this.connected = false;
            this.__cancelTimeout();
            this.__cancelRequests();
        },

        newRequest: function(url, floodProtection, synchronous) {
            var self = this;
            //check if request should proceed
            if (!self.connected) {
                return null;
            } else if (floodProtection && self.__isFlooding()) {
                self.disconnect();
                self.__error(lang.uncontrolledFlood);
            }
            var request = new Request.JSON({
                url: qwebirc.global.dynamicBaseURL + "e/" + url + "?r=" + self.cacheAvoidance + "&t=" + self.counter++,
                async: !synchronous
            });

            // try to minimise the amount of headers 
            request.headers = {};//{X-Requested-With: "XMLHttpRequest", Accept: "application/json", X-Request: "JSON"}
            request.addEvent("request", function() {
                Object.each(killHeaders, function(val, key) {
                    try {
                        request.xhr.setRequestHeader(key, val);
                    } catch (o_O) {
                        delete killHeaders[key];//cant set header on this browser
                    }
                });
            });

            if (Browser.ie && Browser.version < 8) {
                request.setHeader("If-Modified-Since", "Sat, 01 Jan 2000 00:00:00 GMT");
            }
            return request;
        },

        recv: function() {
            var self = this,
                request = self.newRequest("s", true);
            if (request == null) {
                return;
            }
            self.__activeRequest = request;
            request.__replaced = false;
            var onComplete = function(stream) {
                // replaced requests... 
                if (request.__replaced) {
                    self.__lastActiveRequest = null;
                    if (stream) {
                        self.__processData(stream);
                    }
                    return;
                }
                // the main request 
                self.__activeRequest = null;
                self.__cancelTimeout();
                if (!stream) {
                    if (self.connected && self.__checkRetries()) {
                        self.recv();
                    }
                    return;
                } else if (self.__processData(stream)) {
                    self.recv();
                }
            };
            request.addEvent("complete", onComplete);
            self.__scheduleTimeout();
            request.send("s=" + self.sessionid);
        },

        send: function(data, synchronous) {
            if (!this.connected) {
                return false;
            }
            if (synchronous) {
                this.__send(data, false);
            } else {
                this.__sendQueue.push(data);
                this.__processSendQueue();
            }
            return true;
        },

        __processSendQueue: function() {
            if (this.__sendQueueActive || this.__sendQueue.length === 0) {
                return;
            }
            this.sendQueueActive = true;
            this.__send(this.__sendQueue.shift(), true);
        },

        __send: function(data, async) {
            var request = this.newRequest("p", false, !async);
            if (request === null) {
                return;
            }
            request.addEvent("complete", _.bind(this.__completeRequest, this, async))
                .send("s=" + this.sessionid + "&c=" + encodeURIComponent(data));
        },

        __completeRequest: function(async, stream) {
            if (async) {
                this.__sendQueueActive = false;
            }
            if (!stream || (!stream[0])) {
                this.__sendQueue = [];
                if (this.connected) {
                    this.connected = false;
                    this.__error(lang.connError, stream);
                }
                return false;
            }
            this.__processSendQueue();
        },

        __isFlooding: function() {
            var t = Date.now(),
                floodt = t - this.__floodLastRequest;
            if (floodt < this.options.floodInterval) {
                if (this.__floodLastFlood !== 0 && (floodt > this.options.floodReset)) {
                    this.__floodCounter = 0;
                }
                this.__floodLastFlood = t;
                if (++this.__floodCounter > this.options.floodMax) {
                    return true;
                }
            }
            this.__floodLastRequest = t;
            return false;
        },

        __checkRetries: function() { /* hmm, something went wrong! */
            if (++this.__retryAttempts > this.options.maxRetries && this.connected) {
                this.disconnect();
                this.__error(lang.connTimeOut, {
                    retryAttempts: this.__retryAttempts
                });
                return false;
            }
            var to = this.__timeout - this.options.timeoutIncrement;
            if (to >= this.options.minTimeout) {
                this.__timeout = to;
            }
            return true;
        },

        __cancelRequests: function() {
            if ($defined(this.__lastActiveRequest)) {
                this.__lastActiveRequest.cancel();
                this.__lastActiveRequest = null;
            }
            if ($defined(this.__activeRequest)) {
                this.__activeRequest.cancel();
                this.__activeRequest = null;
            }
        },

        __processData: function(o) {
            if (o[0] == false) {
                if (this.connected) {
                    this.connected = false;
                    this.__error(lang.connError, o);
                }
                return false;
            }

            this.__retryAttempts = 0;
            o.each(function(x) {
                this.fireEvent("recv", [x]);
            }, this);

            return true;
        },


        __scheduleTimeout: function() {
            this.__timeoutId = this.__timeoutEvent.delay(this.__timeout, this);
        },

        __cancelTimeout: function() {
            if ($defined(this.__timeoutId)) {
                $clear(this.__timeoutId);
                this.__timeoutId = null;
            }
        },

        __timeoutEvent: function() {
            this.__timeoutId = null;
            if (!$defined(this.__activeRequest)) {
                return;
            } else if (this.__lastActiveRequest) {
                this.__lastActiveRequest.cancel();
            }
            this.fireEvent("timeout", {
                duration: this.__timeout
            });
            this.__activeRequest.__replaced = true;
            this.__lastActiveRequest = this.__activeRequest;
            var to = this.__timeout + this.options.timeoutIncrement;
            if (to <= this.options.maxTimeout) {
                this.__timeout = to;
            }
            this.recv();
        },

        __error: function(message, context) {
            var msg = context ? util.formatter(message.message, context) : message.message;
            this.fireEvent("error", msg);
            if (this.options.errorAlert) {
                alert(msg);
            }
            console.log('had error:' + msg);
        }
    });
})();
