<template lang="pug">
a-layout.layout(style='height: 100%' v-bind='$attrs')
  slot
  a-layout-footer(v-if="copyright"
    :style="{textAlign: 'center', height: '30px', lineHeight: '30px', padding: '0px', color: '#999999'}") {{copyright}}    
</template>
<script lang='jsx'>
import { defineComponent, ref } from "vue";
export default defineComponent({
  components: {},

  setup() {
    return {
      selectedKeys: ref(["2"]),
      copyright: window.config.copyright,
    };
  },
});
</script>
<style lang="less" scoped>
// @import url("@/styles/theme/color.less");;
.site-layout-content {
  min-height: 280px;
  padding: 24px;
  background: @white;
}
#components-layout-demo-top .logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}
.ant-row-rtl #components-layout-demo-top .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

[data-theme="dark"] .site-layout-content {
  background: #141414;
}
</style>
