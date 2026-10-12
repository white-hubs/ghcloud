// 全局状态存储
let store = {
	regionTreeList: [],
	firstRegionList: [],
	secondRegionList: [],
	thirdRegionList: [],
	firstRegionActive: '',
	secondRegionActive: '',
	thirdRegionActive: '',
	currentRegion: { id: '' },
	checkedPoint: { id: '' },
	currentPointIndex: null,
	isSearch: true,
	typeId: '',
	typeList: [],
	pointList: []
};
let pcList = []; // 组件实例列表

// 初始化组件方法
function initComponent() {
	let originalComponent = Component; // 保存原始 Component 构造函数
	Component = function (options) { // 重写 Component 构造函数
			let originalAttached = options.lifetimes.attached || function () {}, // 获取原始 attached 生命周期
					originalDetached = options.lifetimes.detached || function () {}; // 获取原始 detached 生命周期

			// 重写 attached 生命周期
			options.lifetimes.attached = function () {
					loadStore.call(this); // 加载状态
					this.setState = function (data) { // 重写 setState 方法
							setState(this, data);
					};
					originalAttached.call(this, ...arguments); // 调用原始 attached 生命周期
			};

			// 重写 detached 生命周期
			options.lifetimes.detached = function () {
					unloadStore.call(this); // 卸载状态
					originalDetached.call(this, ...arguments); // 调用原始 detached 生命周期
			};

			// 调用原始 Component 构造函数
			originalComponent(options);
	};
}

// 设置状态方法
function setState(instance, data) {
	let keys = Object.keys(data), // 获取更新数据的键名
			stateUpdate = {}; // 用于存储最终的状态更新对象

	// 遍历键名，拼接状态路径
	keys.forEach(key => {
			stateUpdate['$state.' + key] = data[key];
	});

	// 遍历组件实例列表，更新状态
	pcList.forEach(component => {
			component.setData(stateUpdate);
	});
}

// 加载状态方法
function loadStore() {
	pcList.push(this); // 将当前组件实例加入列表
	this.$state = store; // 将全局状态绑定到组件实例
	this.setData({ '$state': store }); // 更新组件状态
}

// 卸载状态方法
function unloadStore() {
	let index = pcList.findIndex(component => component === this); // 查找当前组件实例在列表中的索引
	if (index > -1) {
			pcList.splice(index, 1); // 从列表中移除当前组件实例
	}
}

// 初始化组件方法
initComponent();