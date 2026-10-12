<template lang="pug">
//- 是否支持keyboard键盘esc关闭
//- visible(v-model)	对话框是否可见
//- maskClosable	点击蒙层是否允许关闭
//- v-on绑定事件监听器。$listeners 属性，它是一个对象，里面包含了作用在这个组件上的所有监听器。可以使用 $listeners 属性，在组件的$listeners 属性里面写好所有将会需要的监听器（原生事件），这些监听器就可以直接绑定在组件的子元素上（不是根元素）
//- $attrs包含了父作用域中不作为 prop 被识别 (且获取) 的特性绑定 (class 和 style 除外)。当一个组件没有声明任何 prop 时，这里会包含所有父作用域的绑定 (class和 style 除外)，并且可以通过 v-bind="$attrs" 传入内部组件——在创建高级别的组件时非常有用。
a-modal.app-modal(
  :keyboard='keyboard',
  :visible='visible',
  :maskClosable='maskClosable',
  v-on='$listeners',
  v-bind='$attrs'
)
  slot
  slot(name='title', slot='title') {{ title }}
  slot(name='closeIcon', slot='closeIcon')
  slot(name='footer', slot='footer')
</template>

<script>
export default {
  model: {
    prop: 'visible',
    event: 'change',
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    maskClosable: {
      type: Boolean,
      default: false,
    },
    title: String,
  },
  data() {
    return {
      keyboard: true,
      desVisibleCnt: 0,
    };
  },
  watch: {
    visible(v) {
      // $pub自定义事件，src-plugin-evevt_bus.js中定义。
      // // 设置eventBus用于传值
      // const eventBus = new Vue();
      // 发布
      // api和vue的$emit一模一样
      // Vue._eventBus = eventBus;
      // apply() 方法接受数组形式的参数。第一个参数改变this指向，第二个为参数数组
      // Vue.prototype.$pub = (...args) => {
      //   eventBus.$emit.apply(eventBus, _.toArray(args));
      // };
      // 将v ? 'Modal.Shown' : 'Modal.Hidden'的值存给了eventBus；
      this.$pub(v ? 'Modal.Shown' : 'Modal.Hidden', this);
    },
  },
  created() {
    // antd的this.$form.createForm创建form实例的方法方法，动态生成表单
    this.form = this.$form.createForm(this, {});
    // 第二个参数（回调函数）接收组件发布的消息，并操作
    this.$sub('Modal.Shown', (sender) => {
      if (this.isDescendant(sender)) {
        // esc关闭弹出框属性
        this.keyboard = false;
        // 默认值为0，用来干嘛的？
        ++this.desVisibleCnt;
      }
    });
    this.$sub('Modal.Hidden', (sender) => {
      if (this.isDescendant(sender)) {
        // 回归默认值为true的话
        if (--this.desVisibleCnt === 0) {
          // 键盘关闭属性设置为true
          this.keyboard = true;
        }
      }
    });
  },

  methods: {
    isDescendant(c) {
      let p = c.$parent;
      while (p) {
        if (p === this) return true;
        p = p.$parent;
      }
      return false;
    },
  },
};
</script>
<style lang="less">
.app-modal {
  background-color: red;
}
</style>
