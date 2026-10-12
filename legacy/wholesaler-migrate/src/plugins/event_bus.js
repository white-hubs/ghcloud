import _ from 'lodash';

// 用户管理实例中全局事件监听
class SubEventsManager {
  eventBus = null;
  _events = {};
  constructor(eventBus) {
    this.eventBus = eventBus;
  }
  addEvent(events, callback) {
    _.each(_.flatten(_.compact([events])), event => {
      if (!this._events[event]) {
        this._events[event] = [];
      }
      this._events[event].push(callback);
    });
  }
  removeEvent(events, callback) {
    _.each(_.flatten(_.compact([events])), event => {
      if (this._events[event]) {
        if (!_.isFunction(callback)) {
          this._events[event] = null;
        } else {
          this._events[event] = _.filter(
            this._events[event],
            handler => handler !== callback
          );
        }
      }
    });
  }
  offAllEvents() {
    _.each(this._events, (handlers, event) => {
      _.each(handlers, handler => {
        handler && this.eventBus.$off(event, handler);
      });
    });
  }
}

/**
 * 全局事件
 */
export default {
  install(Vue) {
    // 设置eventBus用于传值
    const eventBus = new Vue();
    // 发布
    // api和vue的$emit一模一样
    Vue._eventBus = eventBus;
    Vue.prototype.$pub = (...args) => {
      // _.toArray将一个值转变成数组,(Array): 返回转换后的数组
      eventBus.$emit.apply(eventBus, _.toArray(args));
    };

    // 订阅
    // api和vue的$on一模一样
    Vue.prototype.$sub = function(event, callback) {
      this.$_subManager.addEvent(event, callback);
      // 接收组件中发布的数据，与$emit对应
      // 其中可能会遇到一个坑是$on()会触发多次，具体原因跟生命周期有关
      // 解决办法就是在beforeDestroy或destroy周期中将事件进行销毁，使用$off()
      // event与要接受的$emit的名字相同
      eventBus.$on(event, callback);
    };

    // 取消订阅
    // api和vue的$off一模一样
    Vue.prototype.$unsub = function(event, callback) {
      this.$_subManager.removeEvent(event, callback);
      eventBus.$off.apply(eventBus, _.toArray(arguments));
    };

    Vue.mixin({
      created() {
        // 创建了实例的全局事件管理器
        if (!this.$_subManager) {
          this.$_subManager = new SubEventsManager(eventBus);
        }
      },
      // 在组件销毁时取消和本实例相关的所有全局监听器
      beforeDestroy() {
        this.$_subManager.offAllEvents();
      }
    });
  }
};
