//@ts-ignore
import { addResponseEventListener, connect, load, emitUIInteraction,closeUeModel } from "./ue-apps.js"
export default class UeClient {
	options: any;
	requestCallbackCache: any;
	onActorClickCallbacks: any[];
//@ts-ignore
	requestChunksQueue: any[];
	responseChunksBuffer: any;
	onActorPoiClickCallbacks: any[];
	onTourPointClickCallbacks: any[];
	onConnectedCallbacks: any[];
	onDisconnectedCallbacks: any[];
	viewPointInfo: any[]; // 用于保存当前视角信息
	kickedOut:boolean;
	clearUeInterval: {
		intervalCatch: any
		connect: any
	};
	clearUeTimeOut:{
		reload:any
	}
	
//@ts-ignore
	webRTC_DOM:HTMLElement;
	webrtcHeartbeatTimeMillis:number;

	private static instance: UeClient | null;

	public static getInstance(options = {}): UeClient {
		if (UeClient.instance) {
			return UeClient.instance
		}
		UeClient.instance = new UeClient(options)
		return UeClient.instance
	}

	private constructor(options = {}) {
		this.options = options;
		this.viewPointInfo = [];
		this.clearUeInterval={
			intervalCatch:null,
			connect:null
		}
		this.clearUeTimeOut={
			reload:null
		}
		this.requestCallbackCache = new _Map();
		this.onActorClickCallbacks = [];
		this.onActorPoiClickCallbacks = [];
		this.onTourPointClickCallbacks = [];
		this.onConnectedCallbacks = [];
		this.onDisconnectedCallbacks = [];
		this.kickedOut = false

		this.webrtcHeartbeatTimeMillis = new Date().getTime();
		this.init();
	}

	init() {
		// 全局监听响应
		addResponseEventListener("handle_responses", (responseObj: any) => {
			this.handleResponse(responseObj);
		});
		// 监听连建立事件
		document.addEventListener('ue_open', (e) => {
			this.onConnectedCallbacks.forEach((cb) => {
				cb.call(this, e);
			});
		});
		// 监听连接断开事件
		document.addEventListener('ue_close', 
			this.handleConectClose
		);
		// 清理 requestCallbackCache
		this.clearUeInterval.intervalCatch =	setInterval(() => {
			this.clearRequestCallbackCache(this);
		}, 10 * 60 * 1000);

		// 发送webrtc心跳及超时重连
		this.clearUeInterval.connect =	setInterval(() => {
			if (new Date().getTime() - this.webrtcHeartbeatTimeMillis > 60 * 1000) {
        // @ts-ignore
				window.ueWebSocket.close();
			}
			this.webrtcHeartbeatRequest();
		}, 30 * 1000);
	}
	// 
	// 断开连接事件执行方法
	handleConectClose=(e:any)=>{
		if(!this.onDisconnectedCallbacks) return
		
		this.onDisconnectedCallbacks.forEach( (cb) =>{
			cb.call(this, e);
		});
		if (!this.kickedOut) {
			// @ts-ignore
			this.reloadUE5(this.webRTC_DOM,window.ueWebSocket.url);
		}
	}

	/** 连接模型 webSocket & webRTC  */
	loadUE5(dom:HTMLElement,line:string){
		this.webRTC_DOM = dom
		this.kickedOut=false
		load(dom,line);
	}
	/** 重连模型 webSocket & webRTC  */
	reloadUE5(dom:HTMLElement,line:string) {
		this.clearUeTimeOut.reload = setTimeout(function() { connect(dom,line); }, 10000);
	}
	/**关闭模型连接 */
  closeUE5():void{
		this.kickedOut=true
		clearInterval(this.clearUeInterval.connect)
		clearInterval(this.clearUeInterval.intervalCatch)
		clearTimeout(this.clearUeTimeOut.reload)
		this.onDisconnectedCallbacks=[]
		this.onConnectedCallbacks=[]
		window.removeEventListener('ue_close',this.handleConectClose)
    closeUeModel()
	}

	/** send 方法响应 */
	handleResponse(responseObj: string){
		// 识别是否心跳，处理并终止响应处理
		if (this.webrtcHeartbeatResponse(responseObj)) {
			return;
		}
		// 重新生成局部变量避免调用混乱
		let responseJson = JSON.stringify(responseObj);
		// 异步处理response，避免阻塞流送处理过程
		let promise = new Promise<void>((resolve, reject) => {
			// 响应Json字符串转为对象
        //@ts-ignore
			let response = null;
			try {
				response = JSON.parse(responseJson);
			} catch (e) {
			}
			// 尝试调用回调
			if (this.chekResopnse(response) && this.requestCallbackCache.has(response.id)) {
				let callbackContainer = this.requestCallbackCache.get(response.id);
				this.requestCallbackCache.delete(response.id);
				if (new Date().getTime() < callbackContainer.timestamp) {
					callbackContainer.callback.call(this, response.data);
				}
			}
			// 特殊的ID处理
			if (response.id == 'actorClicked') {
				this.onActorClickCallbacks.forEach((cb) => {
            //@ts-ignore
					cb.call(this, response.data);
				});
			}
			if (response.id == 'actorPoiClicked') {
				this.onActorPoiClickCallbacks.forEach((cb) => {
            //@ts-ignore
					cb.call(this, response.data);
				});
			}
			if (response.id == 'tourPointClicked') {
				this.onTourPointClickCallbacks.forEach((cb) => {
            //@ts-ignore
					cb.call(this, response.data);
				});
			}
			if (response.id == 'kickedOut') {
				this.kickedOut = true;
			}
			// 异步处理成功
			resolve();
		});
	}

	/** 检查响应 */
    //@ts-ignore
	chekResopnse(response) {
		if (!response.hasOwnProperty('type')) {
			alert('response has no type attribute!');
			return false;
		}
		if (!response.hasOwnProperty('id')) {
			alert('response has no id attribute!');
			return false;
		}
		if (!response.hasOwnProperty('code')) {
			alert('response has no code attribute!');
			return false;
		}
		if (!response.hasOwnProperty('message')) {
			alert('response has no message attribute!');
			return false;
		}
		if (!response.hasOwnProperty('data')) {
			alert('response has no data attribute!');
			return false;
		}
		if (response.type != 'response') {
			alert('wrong type: ' + response.type);
			return false;
		}
		if (response.code != 200) {
			alert(response.message);
			return false;
		}
		return true;
	}

	/** 向模型服务端发送请求 */
    //@ts-ignore
	send(command:any, param:any = null, callback:any = null) {
		let _command = '';
		let _param = {};
		let _callback = function () { };

		// 参数校验 command
		if (!command || (typeof (command) != 'string')) {
			alert('command must be string');
			return;
		}
		_command = command;

		// 参数校验 callback
		let hasCallback = false;
		if (callback && (typeof (callback) == 'function')) {
			hasCallback = true;
			_callback = callback;
		}

		// 参数校验 param
		if (param) {
			// 已经有callback，param只能作为参数
			if (hasCallback) {
				if (typeof (param) == 'function') {
            //@ts-ignore
					_param = param.apply();
            //@ts-ignore
				} else if (param instanceof Object) {
					_param = param;
				} else {
					alert('param must be Object or function');
					return;
				}
			}
			// 没有callback，param如果类型为function则当作callback来处理
			else {
				if (typeof (param) == 'function') {
					hasCallback = true;
					_callback = param;
				} else {
					_param = param;
				}
			}
		}

		// 生成请求ID
		let requestId = this.generateRequestId();
		// 缓存回调，与请求ID关联
		if (hasCallback) {
			this.requestCallbackCache.set(requestId, {
				callback: _callback,
				timestamp: new Date().getTime() + (10 * 60 * 1000)
			});
		}

		// 通过websocket发送请求
		let requestJsonStr = JSON.stringify({
			id: requestId,
			command: _command,
			payload: _param,
			type: 'request'
		});
      //@ts-ignore
		window.ueWebSocket.send(requestJsonStr);
	}

	generateRequestId() {
		let num = "";
		for (let i = 0; i < 4; i++) {
			num += Math.floor(Math.random() * 10);
		}
		let requestId = new Date().getTime() + '_' + num;
		return requestId;
	}

	clearRequestCallbackCache(instance: this) {
		let keys: any[] = [];
		instance.requestCallbackCache.forEach(function (key: any, val: { timestamp: number }) {
			if (new Date().getTime() > val.timestamp) {
				keys.push(key);
			}
		});
		keys.forEach(key => {
			instance.requestCallbackCache.delete(key);
		});
	}

	webrtcHeartbeatRequest() {
		let heartbeatDescriptor = {
			type: 'ping'
		};
		emitUIInteraction(heartbeatDescriptor);
	}
	
	webrtcHeartbeatResponse(response: string) {
		if (typeof response == 'string') {
			try {
				let responseObj = JSON.parse(response);
				if (responseObj.type && responseObj.type == 'pong') {
					this.webrtcHeartbeatTimeMillis = new Date().getTime();
					return true;
				}
			} catch(e) {
			}
		}
		return false;
	}

	onActorClick(cb: any) {
		this.onActorClickCallbacks.push(cb);
	}

	onActorPoiClick(cb: any) {
		this.onActorPoiClickCallbacks.push(cb);
	}

	onTourPointClick(cb: any) {
		this.onTourPointClickCallbacks.push(cb);
	}

	onConnected(cb: any) {
		this.onConnectedCallbacks.push(cb);
	}

	onDisconnected(cb: any) {
		this.onDisconnectedCallbacks.push(cb);
	}

	/** 保存当前视角 */
	async saveNowViewPoint() {
		return new Promise((resolve)=>{
			this.send("getCameraView", "", (res: unknown) => {
				this.viewPointInfo.push(res)
				resolve(res)
			});
		})
	}

	/** 返回缓存的视角 上一个视角*/
	backViewPoint() {
		let viewPointData = this.viewPointInfo.pop()
		if (!viewPointData) {
			try {
				viewPointData = (window as any).config.modelPerspective[0].value
			} catch (error) {
			}
		}

		viewPointData && this.send("setCameraView", viewPointData)
	}
}


class _Map {
	obj: any;
	size: number;

	constructor() {
		this.obj = {}
		this.size = 0
	}

	set = (key: string | number, value: any) => {
		if (!this.obj.hasOwnProperty(key)) {
			this.size++
		}
		this.obj[key] = value
	}

	has = (key: any) => {
		return this.obj.hasOwnProperty(key)
	}

	get = (key: string | number) => {
		return this.obj[key]
	}

	delete = (key: string | number) => {
		if (this.obj.hasOwnProperty(key)) {
			this.size--
		}
		delete this.obj[key]
	}

	forEach = (fn:any) => {
		const res = this.obj
		for (let key in res) {
			fn.call(this, key, res[key], res)
		}
	}

	clear = () => {
		this.obj = {}
		this.size = 0
	}

}
