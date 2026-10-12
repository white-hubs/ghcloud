// oxlint-disable
import { addResponseEventListener, loadClose, connect, load, emitUIInteraction } from "./ueApp";

export default class UeClient {
  options: any;
  requestCallbackCache: any;
  onActorClickCallbacks: any[];
  requestChunksQueue: any[];
  responseChunksBuffer: any;
  onActorPoiClickCallbacks: any[];
  onTourPointClickCallbacks: any[];
  onConnectedCallbacks: any[];
  onDisconnectedCallbacks: any[];
  onActorInSightCallbacks: any[];
  onCameraCallbacks: any[];
  viewPointInfo: any[]; // 用于保存当前视角信息
  kickedOut: boolean;
  isReLoad: boolean;
  webRTC_DOM: HTMLElement;
  webrtcHeartbeatTimeMillis: number;

  private static instance: UeClient;

  public static getInstance(options = {}): UeClient {
    if (UeClient.instance) {
      return UeClient.instance;
    }
    UeClient.instance = new UeClient(options);
    return UeClient.instance;
  }

  private constructor(options = {}) {
    this.options = options;
    this.viewPointInfo = [];
    this.requestCallbackCache = new _Map();
    this.onActorClickCallbacks = [];
    this.onActorPoiClickCallbacks = [];
    this.onTourPointClickCallbacks = [];
    this.onConnectedCallbacks = [];
    this.onDisconnectedCallbacks = [];
    this.onActorInSightCallbacks = [];
    this.onCameraCallbacks = [];
    this.kickedOut = false;
    this.isReLoad = true;
    this.webrtcHeartbeatTimeMillis = new Date().getTime();
    this.init();
  }

  init() {
    const _this = this;
    // 全局监听响应
    addResponseEventListener("handle_responses", function (responseObj) {
      _this.handleResponse(responseObj);
    });
    // 监听连建立事件
    document.addEventListener("ue_open", function (e) {
      _this.onConnectedCallbacks.forEach(function (cb) {
        cb.call(_this, e);
      });
    });
    // 监听连接断开事件
    document.addEventListener("ue_close", function (e) {
      _this.onDisconnectedCallbacks.forEach(function (cb) {
        cb.call(_this, e);
      });
      if (!_this.kickedOut && _this.isReLoad) {
        _this.reloadUE5(_this.webRTC_DOM, window.ueWebSocket.url);
      }
    });

    // 清理 requestCallbackCache
    setInterval(
      function () {
        _this.clearRequestCallbackCache(_this);
      },
      10 * 60 * 1000,
    );

    // 发送webrtc心跳及超时重连
    setInterval(function () {
      if (!navigator.userAgent.includes("UnrealEngine")) {
        if (new Date().getTime() - _this.webrtcHeartbeatTimeMillis > 60 * 1000) {
          window.ueWebSocket.close();
        }
        _this.webrtcHeartbeatRequest();
      }
    }, 30 * 1000);
  }

  /** 连接模型 webSocket & webRTC  */
  loadUE5(dom: HTMLElement, line: string) {
    this.webRTC_DOM = dom;
    load(dom, line);
  }
  ue5Close() {
    this.isReLoad = false;
    loadClose();
  }
  /** 重连模型 webSocket & webRTC  */
  reloadUE5(dom: HTMLElement, line: string) {
    setTimeout(function () {
      connect(dom, line);
    }, 10000);
  }

  /** send 方法响应 */
  async handleResponse(responseObj) {
    const _this = this;
    // 识别是否心跳，处理并终止响应处理
    if (_this.webrtcHeartbeatResponse(responseObj)) {
      return;
    }
    // 重新生成局部变量避免调用混乱
    const responseJson = JSON.stringify(responseObj);
    // 异步处理response，避免阻塞流送处理过程
    const promise = new Promise<void>((resolve, reject) => {
      // 响应Json字符串转为对象
      let response = null;
      try {
        response = JSON.parse(responseJson);
      } catch (e) {
      }
      // 尝试调用回调
      if (_this.chekResopnse(response) && _this.requestCallbackCache.has(response.id)) {
        const callbackContainer = _this.requestCallbackCache.get(response.id);
        _this.requestCallbackCache.delete(response.id);
        if (new Date().getTime() < callbackContainer.timestamp) {
          callbackContainer.callback.call(_this, response.data);
        }
      }
      // 特殊的ID处理
      if (response.id == "actorClicked") {
        _this.onActorClickCallbacks.forEach(function (cb) {
          cb.call(_this, response.data);
        });
      }
      if (response.id == "actorPoiClicked") {
        _this.onActorPoiClickCallbacks.forEach(function (cb) {
          cb.call(_this, response.data);
        });
      }
      if (response.id == "actorInSight") {
        _this.onActorInSightCallbacks.forEach(function (cb) {
          cb.call(_this, response.data);
        });
      }
      if (response.id == "cameraViewChanged") {
        _this.onCameraCallbacks.forEach(function (cb) {
          cb.call(_this, response.data);
        });
      }
      if (response.id == "tourPointClicked") {
        _this.onTourPointClickCallbacks.forEach(function (cb) {
          cb.call(_this, response.data);
        });
      }
      if (response.id == "kickedOut") {
        _this.kickedOut = true;
      }
      // 异步处理成功
      resolve();
    });
    return promise;
  }

  /** 检查响应 */
  chekResopnse(response) {
    if (!response.hasOwnProperty("type")) {
      alert("response has no type attribute!");
      return false;
    }
    if (!response.hasOwnProperty("id")) {
      alert("response has no id attribute!");
      return false;
    }
    if (!response.hasOwnProperty("code")) {
      alert("response has no code attribute!");
      return false;
    }
    if (!response.hasOwnProperty("message")) {
      alert("response has no message attribute!");
      return false;
    }
    if (!response.hasOwnProperty("data")) {
      alert("response has no data attribute!");
      return false;
    }
    if (response.type != "response") {
      alert("wrong type: " + response.type);
      return false;
    }
    if (response.code != 200) {
      alert(response.message);
      return false;
    }
    return true;
  }

  /** 向模型服务端发送请求 */
  send(command, param = null, callback = null) {
    const _this = this;

    let _command = "";
    let _param = {};
    let _callback = function () {};

    // 参数校验 command
    if (!command || typeof command !== "string") {
      alert("command must be string");
      return;
    }
    _command = command;

    // 参数校验 callback
    let hasCallback = false;
    if (callback && typeof callback === "function") {
      hasCallback = true;
      _callback = callback;
    }

    // 参数校验 param
    if (param) {
      // 已经有callback，param只能作为参数
      if (hasCallback) {
        if (typeof param === "function") {
          _param = param.apply();
        } else if (param instanceof Object) {
          _param = param;
        } else {
          alert("param must be Object or function");
          return;
        }
      }
      // 没有callback，param如果类型为function则当作callback来处理
      else {
        if (typeof param === "function") {
          hasCallback = true;
          _callback = param;
        } else {
          _param = param;
        }
      }
    }

    // 生成请求ID
    const requestId = _this.generateRequestId();
    // 缓存回调，与请求ID关联
    if (hasCallback) {
      _this.requestCallbackCache.set(requestId, {
        callback: _callback,
        timestamp: new Date().getTime() + 10 * 60 * 1000,
      });
    }

    // 通过websocket发送请求
    const requestJsonStr = JSON.stringify({
      id: requestId,
      command: _command,
      payload: _param,
      type: "request",
    });
    window.ueWebSocket.send(requestJsonStr);
  }

  generateRequestId() {
    let num = "";
    for (let i = 0; i < 4; i++) {
      num += Math.floor(Math.random() * 10);
    }
    const requestId = new Date().getTime() + "_" + num;
    return requestId;
  }

  clearRequestCallbackCache(_this) {
    const keys = [];
    _this.requestCallbackCache.forEach(function (key, val) {
      if (new Date().getTime() > val.timestamp) {
        keys.push(key);
      }
    });
    keys.forEach((key) => {
      _this.requestCallbackCache.delete(key);
    });
  }

  webrtcHeartbeatRequest() {
    const heartbeatDescriptor = {
      type: "ping",
    };
    emitUIInteraction(heartbeatDescriptor);
  }

  webrtcHeartbeatResponse(response) {
    if (typeof response === "string") {
      try {
        const responseObj = JSON.parse(response);
        if (responseObj.type && responseObj.type == "pong") {
          this.webrtcHeartbeatTimeMillis = new Date().getTime();
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  onActorClick(cb) {
    this.onActorClickCallbacks.push(cb);
  }

  onActorPoiClick(cb) {
    this.onActorPoiClickCallbacks.push(cb);
  }

  onTourPointClick(cb) {
    this.onTourPointClickCallbacks.push(cb);
  }

  onConnected(cb) {
    this.onConnectedCallbacks.push(cb);
  }

  onDisconnected(cb) {
    this.onDisconnectedCallbacks.push(cb);
  }

  onActorInSight(cb) {
    this.onActorInSightCallbacks.push(cb);
  }

  onCamera(cb) {
    this.onCameraCallbacks.push(cb);
  }

  /** 保存当前视角 */
  async saveNowViewPoint() {
    const _this = this;
    return new Promise((resolve) => {
      _this.send("getCameraView", "", function (res) {
        _this.viewPointInfo.push(res);
        resolve(res);
      });
    });
  }

  /** 返回缓存的视角 上一个视角 */
  backViewPoint() {
    let viewPointData = this.viewPointInfo.pop();
    if (!viewPointData) {
      try {
        viewPointData = (window as any).config.modelPerspective[0].value;
      } catch (error) {
      }
    }

    viewPointData && this.send("changeCameraView", viewPointData);
  }
}

class _Map {
  obj: any;
  size: number;

  constructor() {
    this.obj = {};
    this.size = 0;
  }

  set = (key, value) => {
    if (!this.obj.hasOwnProperty(key)) {
      this.size++;
    }
    this.obj[key] = value;
  };

  has = (key) => {
    return this.obj.hasOwnProperty(key);
  };

  get = (key) => {
    return this.obj[key];
  };

  delete = (key) => {
    if (this.obj.hasOwnProperty(key)) {
      this.size--;
    }
    delete this.obj[key];
  };

  forEach = (fn) => {
    const res = this.obj;
    for (const key in res) {
      fn.call(this, key, res[key], res);
    }
  };

  clear = () => {
    this.obj = {};
    this.size = 0;
  };
}
