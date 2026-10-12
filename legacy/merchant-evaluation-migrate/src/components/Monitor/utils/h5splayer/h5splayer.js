function H5sPlayerWS(e) {
  this.sourceBuffer,
    (this.buffer = []),
    this.mediaSource,
    this.video,
    this.wsSocket,
    this.checkSourceBufferId,
    this.keepaliveTimerId,
    (this.emptyBuffCnt = 0),
    (this.lastBuffTime = 0),
    (this.buffTimeSameCnt = 0),
    (this.bNeedReconnect = !1),
    (this.bDisConnected = !1),
    (this._bGetCodec = !1),
    this._strCodec,
    (this._conf = e),
    void 0,
    (this._videoId = e.videoid),
    (this._token = e.token),
    void 0 === this._videoId
      ? ((this._videodom = e.videodom),
        void 0)
      : ((this._videodom = document.getElementById(this._videoId)),
        void 0),
    (this.video = this._videodom);
  var o =
    this._conf.protocol +
    '//' +
    this._conf.host +
    this._conf.rootpath +
    'api/v1/GetImage?token=' +
    this._token +
    '&session=' +
    this._conf.session;
  this._videodom.setAttribute('poster', o);
}
function H5sPlayerHls(e) {
  this.wsSocket,
    this.keepaliveTimerId,
    (this._conf = e),
    (this._videoId = e.videoid),
    (this._token = e.token),
    this._reConnectInterval,
    (this._version = e.hlsver),
    void 0 === this._videoId
      ? ((this._videodom = e.videodom),
        void 0)
      : ((this._videodom = document.getElementById(this._videoId)),
        void 0),
    (this._video = this._videodom),
    (this._video.type = 'application/x-mpegURL'),
    (this._lastTime = 0),
    (this._sameCnt = 0);
  var o =
    this._conf.protocol +
    '//' +
    window.location.host +
    '/api/v1/GetImage?token=' +
    this._token +
    '&session=' +
    this._conf.session;
  this._videodom.setAttribute('poster', o);
}
function H5sPlayerRTC(e) {
  this.wsSocket,
    this.checkSourceBufferId,
    this.keepaliveTimerId,
    (this.emptyBuffCnt = 0),
    (this.lastBuffTime = 0),
    (this.buffTimeSameCnt = 0),
    (this.bNeedReconnect = !1),
    (this.bDisConnected = !1),
    (this._conf = e),
    (this._videoId = e.videoid),
    (this._token = e.token),
    void 0 === this._videoId
      ? ((this._videodom = e.videodom),
        void 0)
      : ((this._videodom = document.getElementById(this._videoId)),
        void 0),
    (this.video = this._videodom),
    (this.pc = null),
    (this.pcOptions = {
      optional: [
        {
          DtlsSrtpKeyAgreement: !0,
        },
      ],
    }),
    (this.mediaConstraints = {
      mandatory: {
        offerToReceiveAudio: !0,
        offerToReceiveVideo: !0,
      },
    }),
    (this.pcConfig = {
      iceServers: [],
    }),
    (this.earlyCandidates = []);
  var o =
    this._conf.protocol +
    '//' +
    this._conf.host +
    this._conf.rootpath +
    'api/v1/GetImage?token=' +
    this._token +
    '&session=' +
    this._conf.session;
  this._videodom.setAttribute('poster', o);
}
function createRTCSessionDescription(e) {
  return (
    void 0, new RTCSessionDescription(e)
  );
}
(H5sPlayerWS.prototype.ReconnectFunction = function () {
  !0 === this.bNeedReconnect &&
    (void 0,
    this.setupWebSocket(this._token),
    (this.bNeedReconnect = !1));
  //  ,
}),
  (H5sPlayerWS.prototype.H5SWebSocketClient = function (e) {
    var o;
    try {
      this._conf.protocol == 'http:' &&
        (o =
          typeof MozWebSocket !== 'undefined'
            ? new MozWebSocket('ws://' + this._conf.host + e)
            : new WebSocket('ws://' + this._conf.host + e)),
        this._conf.protocol == 'https:' &&
          (void 0,
          (o =
            typeof MozWebSocket !== 'undefined'
              ? new MozWebSocket('wss://' + this._conf.host + e)
              : new WebSocket('wss://' + this._conf.host + e))),
        void 0;
    } catch (e) {
      return void alert('error');
    }
    return o;
  }),
  (H5sPlayerWS.prototype.readFromBuffer = function () {
    if (this.buffer.length !== 0 && !this.sourceBuffer.updating) {
      try {
        var e = this.buffer.shift();
        var o = new Uint8Array(e);
        this.sourceBuffer.appendBuffer(o);
      } catch (e) {
      }
    }
  }),
  (H5sPlayerWS.prototype.keepaliveTimer = function () {
    try {
      this.wsSocket.send('keepalive');
    } catch (e) {
    }
  }),
  (H5sPlayerWS.prototype.onWebSocketData = function (e) {
    if (!0 !== this.bDisConnected) {
      return !1 === this._bGetCodec
        ? ((this._strCodec = String.fromCharCode.apply(
            null,
            new Uint8Array(e.data),
          )),
          this.setupSourceBuffer(this),
          void (this._bGetCodec = !0))
        : (this.buffer.push(e.data), void this.readFromBuffer());
    }
  }),
  (H5sPlayerWS.prototype.setupSourceBuffer = function (e) {
    try {
      (window.MediaSource = window.MediaSource || window.WebKitMediaSource),
        window.MediaSource || void 0;
      var o = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
      'MediaSource' in window && MediaSource.isTypeSupported(o)
        ? void 0
        : void 0,
        (e.mediaSource = new window.MediaSource()),
        (e.video.autoplay = !0),
        void 0;
      (e.video.src = window.URL.createObjectURL(e.mediaSource)),
        e.video.play(),
        e.mediaSource.addEventListener(
          'sourceopen',
          e.mediaSourceOpen.bind(e),
          !1,
        );
    } catch (e) {
    }
  }),
  (H5sPlayerWS.prototype.mediaSourceOpen = function () {
    void 0,
      (this.sourceBuffer = this.mediaSource.addSourceBuffer(this._strCodec)),
      (this.mediaSource.duration = 1 / 0),
      this.mediaSource.removeEventListener(
        'sourceopen',
        this.mediaSourceOpen,
        !1,
      ),
      this.sourceBuffer.addEventListener(
        'updateend',
        this.readFromBuffer.bind(this),
        !1,
      );
  }),
  (H5sPlayerWS.prototype.setupWebSocket = function (e) {
    this.video.autoplay = !0;
    var o = 'api/v1/h5swsapi';
    (o =
      this._conf.rootpath +
      o +
      '?token=' +
      e +
      '&session=' +
      this._conf.session),
      void 0,
      (this.wsSocket = this.H5SWebSocketClient(o)),
      void 0,
      (this.wsSocket.binaryType = 'arraybuffer'),
      ((this.wsSocket.h5 = this).wsSocket.onmessage = this.onWebSocketData.bind(
        this,
      )),
      (this.wsSocket.onopen = function () {
        void 0,
          (this.h5.checkSourceBufferId = setInterval(
            this.h5.CheckSourceBuffer.bind(this.h5),
            1e4,
          )),
          (this.h5.keepaliveTimerId = setInterval(
            this.h5.keepaliveTimer.bind(this.h5),
            1e3,
          ));
      }),
      (this.wsSocket.onclose = function () {
        void 0,
          !0 === this.h5.bDisConnected
            ? void 0
            : (this.h5.bNeedReconnect = !0),
          this.h5.CleanupSourceBuffer(this.h5),
          this.h5.CleanupWebSocket(this.h5),
          (this.h5._strCodec = ''),
          (this.h5._bGetCodec = !1);
      });
  }),
  (H5sPlayerWS.prototype.CleanupSourceBuffer = function (e) {
    try {
      e.sourceBuffer.removeEventListener('updateend', e.readFromBuffer, !1),
        e.sourceBuffer.abort(),
        document.documentMode || /Edge/.test(navigator.userAgent)
          ? void 0
          : e.mediaSource.removeSourceBuffer(e.sourceBuffer),
        (e.sourceBuffer = null),
        (e.mediaSource = null),
        (e.buffer = []);
    } catch (e) {
    }
  }),
  (H5sPlayerWS.prototype.CleanupWebSocket = function (e) {
    void 0,
      clearInterval(e.keepaliveTimerId),
      clearInterval(e.checkSourceBufferId),
      (e.emptyBuffCnt = 0),
      (e.lastBuffTime = 0),
      (e.buffTimeSameCnt = 0);
  }),
  (H5sPlayerWS.prototype.CheckSourceBuffer = function () {
    !0 === this.bDisConnected &&
      (void 0,
      clearInterval(this.keepaliveTimerId),
      clearInterval(this.checkSourceBufferId),
      clearInterval(this.reconnectTimerId));
    try {
      if (this.sourceBuffer.buffered.length <= 0) {
        if ((this.emptyBuffCnt++, this.emptyBuffCnt > 8)) {
          return (
            void 0, void this.wsSocket.close()
          );
        }
      } else {
        this.emptyBuffCnt = 0;
        this.sourceBuffer.buffered.start(0);
        var e = this.sourceBuffer.buffered.end(0);
        var o = e - this.video.currentTime;
        if (o > 5 || o < 0) {
          return (
            void 0,
            void this.wsSocket.close()
          );
        }
        if (e == this.lastBuffTime) {
          if ((this.buffTimeSameCnt++, this.buffTimeSameCnt > 3)) {
            return (
              void 0,
              void this.wsSocket.close()
            );
          }
        } else {
          this.buffTimeSameCnt = 0;
        }
        this.lastBuffTime = e;
      }
    } catch (e) {
    }
  }),
  (H5sPlayerWS.prototype.connect = function () {
    this.setupWebSocket(this._token),
      (this.reconnectTimerId = setInterval(
        this.ReconnectFunction.bind(this),
        3e3,
      ));
  }),
  (H5sPlayerWS.prototype.disconnect = function () {
    void 0,
      (this.bDisConnected = !0),
      clearInterval(this.reconnectTimerId),
      this.wsSocket != null && (this.wsSocket.close(), (this.wsSocket = null)),
      void 0;
  }),
  (H5sPlayerHls.prototype.H5SWebSocketClient = function (e) {
    var o;
    try {
      this._conf.protocol == 'http:' &&
        (o =
          typeof MozWebSocket !== 'undefined'
            ? new MozWebSocket('ws://' + this._conf.host + e)
            : new WebSocket('ws://' + this._conf.host + e)),
        this._conf.protocol == 'https:' &&
          (void 0,
          (o =
            typeof MozWebSocket !== 'undefined'
              ? new MozWebSocket('wss://' + this._conf.host + e)
              : new WebSocket('wss://' + this._conf.host + e))),
        void 0;
    } catch (e) {
      return void alert('error');
    }
    return o;
  }),
  (H5sPlayerHls.prototype.keepaliveTimer = function () {
    try {
      var e = {
        type: 'keepalive',
      };
      this.wsSocket.send(JSON.stringify(e));
    } catch (e) {
    }
  }),
  (H5sPlayerHls.prototype.onWebSocketData = function (e) {
  }),
  (H5sPlayerHls.prototype.setupWebSocket = function (e) {
    var o = 'api/v1/h5swscmnapi';
    (o = this._conf.rootpath + o + '?token=' + e),
      void 0,
      (this.wsSocket = this.H5SWebSocketClient(o)),
      void 0,
      (this.wsSocket.binaryType = 'arraybuffer'),
      ((this.wsSocket.h5 = this).wsSocket.onmessage = this.onWebSocketData.bind(
        this,
      )),
      (this.wsSocket.onopen = function () {
        void 0,
          (this.h5.keepaliveTimerId = setInterval(
            this.h5.keepaliveTimer.bind(this.h5),
            1e3,
          ));
      }),
      (this.wsSocket.onclose = function () {
        void 0,
          this.h5.CleanupWebSocket(this.h5);
      });
  }),
  (H5sPlayerHls.prototype.CleanupWebSocket = function (e) {
    void 0,
      clearInterval(e.keepaliveTimerId);
  }),
  (H5sPlayerHls.prototype.CheckPlaying = function () {
    void 0,
      void 0;
    var e = this._video.currentTime;
    var o = e - this._lastTime;
    void 0,
      o === 0 && this._sameCnt++,
      (this._lastTime = e),
      this._sameCnt > 3 &&
        (this.wsSocket != null &&
          (this.wsSocket.close(), (this.wsSocket = null)),
        this.setupWebSocket(this._token),
        void 0,
        (this._video.src = ''),
        (this._lastTime = 0),
        (this._sameCnt = 0),
        (this._video.src =
          this._conf.protocol +
          '//' +
          this._conf.host +
          this._conf.rootpath +
          'hls/' +
          this._version +
          '/' +
          this._token +
          '/hls.m3u8'),
        this._video.play());
  }),
  (H5sPlayerHls.prototype.connect = function () {
    this.setupWebSocket(this._token),
      (this._lastTime = 0),
      (this._sameCnt = 0),
      (this._video.onended = function (e) {
      }),
      (this._video.onpause = function (e) {
      }),
      (this._video.onplaying = function (e) {
      }),
      (this._video.onseeking = function (e) {
      }),
      (this._video.onvolumechange = function (e) {
      }),
      (this._video.src =
        this._conf.protocol +
        '//' +
        this._conf.host +
        this._conf.rootpath +
        'hls/' +
        this._version +
        '/' +
        this._token +
        '/hls.m3u8'),
      this._video.play(),
      (this._reConnectInterval = setInterval(
        this.CheckPlaying.bind(this),
        3e3,
      ));
  }),
  (H5sPlayerHls.prototype.disconnect = function () {
    clearInterval(this._reConnectInterval),
      (this._lastTime = 0),
      (this._sameCnt = 0),
      this.wsSocket != null && (this.wsSocket.close(), (this.wsSocket = null)),
      void 0;
  }),
  (H5sPlayerRTC.prototype.ReconnectFunction = function () {
    void 0,
      !0 === this.bNeedReconnect &&
        (void 0,
        this.setupWebSocket(this._token),
        (this.bNeedReconnect = !1)),
      void 0;
  }),
  (H5sPlayerRTC.prototype.H5SWebSocketClient = function (e) {
    var o;
    try {
      this._conf.protocol == 'http:' &&
        (o =
          typeof MozWebSocket !== 'undefined'
            ? new MozWebSocket('ws://' + this._conf.host + e)
            : new WebSocket('ws://' + this._conf.host + e)),
        this._conf.protocol == 'https:' &&
          (void 0,
          (o =
            typeof MozWebSocket !== 'undefined'
              ? new MozWebSocket('wss://' + this._conf.host + e)
              : new WebSocket('wss://' + this._conf.host + e))),
        void 0;
    } catch (e) {
      return void alert('error');
    }
    return o;
  }),
  (H5sPlayerRTC.prototype.keepaliveTimer = function () {
    try {
      var e = {
        type: 'keepalive',
      };
      this.wsSocket.send(JSON.stringify(e));
    } catch (e) {
    }
  }),
  (H5sPlayerRTC.prototype.onIceCandidate = function (e) {
    var o;
    e.candidate
      ? (void 0,
        ((o = e.candidate).type = 'remoteice'),
        void 0,
        this.wsSocket.send(JSON.stringify(o)))
      : void 0;
  }),
  (H5sPlayerRTC.prototype.onTrack = function (e) {
    var o;
    void 0,
      (o = e.streams ? e.streams[0] : e.stream);
    var t = this._videodom;
    (t.src = URL.createObjectURL(o)), t.play();
  }),
  (H5sPlayerRTC.prototype.createPeerConnection = function () {
    var t = new RTCPeerConnection(this.pcConfig, this.pcOptions);
    var s = this;
    return (
      (t.onicecandidate = function (e) {
        s.onIceCandidate.call(s, e);
      }),
      void 0 !== t.ontrack
        ? (t.ontrack = function (e) {
            s.onTrack.call(s, e);
          })
        : (t.onaddstream = function (e) {
            s.onTrack.call(s, e);
          }),
      (t.oniceconnectionstatechange = function (e) {
        var o = s._videodom;
        o &&
          (t.iceConnectionState === 'connected'
            ? (o.style.opacity = '1.0')
            : t.iceConnectionState === 'disconnected' ||
              t.iceConnectionState === 'failed' ||
              t.iceConnectionState);
      }),
      void 0,
      t
    );
  }),
  (H5sPlayerRTC.prototype.ProcessRTCOffer = function (e) {
    try {
      (this.pc = this.createPeerConnection()),
        (this.earlyCandidates.length = 0);
      var o = this;
      this.pc.setRemoteDescription(createRTCSessionDescription(e)),
        this.pc.createAnswer(this.mediaConstraints).then(
          function (e) {
            void 0,
              o.pc.setLocalDescription(
                e,
                function () {
                  void 0,
                    o.wsSocket.send(JSON.stringify(e));
                },
                function () {},
              );
          },
          function (e) {
            alert('Create awnser error:' + JSON.stringify(e));
          },
        );
    } catch (e) {
      this.disconnect(), alert('connect error: ' + e);
    }
  }),
  (H5sPlayerRTC.prototype.ProcessRemoteIce = function (e) {
    try {
      var o = new RTCIceCandidate({
        sdpMLineIndex: e.sdpMLineIndex,
        candidate: e.candidate,
      });
      void 0,
        void 0,
        this.pc.addIceCandidate(
          o,
          function () {
          },
          function (e) {
          },
        );
    } catch (e) {
      alert('connect ProcessRemoteIce error: ' + e);
    }
  }),
  (H5sPlayerRTC.prototype.onWebSocketData = function (e) {
    var o = JSON.parse(e.data);
    void 0,
      o.type === 'offer' &&
        (void 0, this.ProcessRTCOffer(o)),
      o.type === 'remoteice' &&
        (void 0,
        this.ProcessRemoteIce(o));
  }),
  (H5sPlayerRTC.prototype.setupWebSocket = function (e) {
    this.video.autoplay = !0;
    var o = 'api/v1/h5srtcapi';
    (o = this._conf.rootpath + o + '?token=' + e),
      void 0,
      (this.wsSocket = this.H5SWebSocketClient(o)),
      void 0,
      (this.wsSocket.binaryType = 'arraybuffer'),
      ((this.wsSocket.h5 = this).wsSocket.onmessage = this.onWebSocketData.bind(
        this,
      )),
      (this.wsSocket.onopen = function () {
        var e = {
          type: 'open',
        };
        this.h5.wsSocket.send(JSON.stringify(e)),
          (this.h5.keepaliveTimerId = setInterval(
            this.h5.keepaliveTimer.bind(this.h5),
            1e3,
          ));
      }),
      (this.wsSocket.onclose = function () {
        void 0,
          !0 === this.h5.bDisConnected
            ? void 0
            : (this.h5.bNeedReconnect = !0),
          this.h5.CleanupWebSocket(this.h5);
      });
  }),
  (H5sPlayerRTC.prototype.CleanupWebSocket = function (e) {
    void 0,
      clearInterval(e.keepaliveTimerId),
      (e.emptyBuffCnt = 0),
      (e.lastBuffTime = 0),
      (e.buffTimeSameCnt = 0);
  }),
  (H5sPlayerRTC.prototype.connect = function () {
    // debugger;
    this.setupWebSocket(this._token),
      (this.reconnectTimerId = setInterval(
        this.ReconnectFunction.bind(this),
        3e3,
      ));
  }),
  (H5sPlayerRTC.prototype.disconnect = function () {
    void 0,
      (this.bDisConnected = !0),
      clearInterval(this.reconnectTimerId),
      this.wsSocket != null && (this.wsSocket.close(), (this.wsSocket = null)),
      void 0;
  });

export { H5sPlayerWS, H5sPlayerHls, H5sPlayerRTC };
