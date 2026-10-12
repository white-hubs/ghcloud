<template lang="pug">
  div.sys_version.container
    div.sys_version.p1(@click="show")
      span 系统版本: {{ $version }}
    app-modal(v-model="visible" :title="'当前版本 - ' + $version" :width="800"  @cancel="hide" :footer="null")
      div.p2.px3.change_log_container
        VueMarkdown(:source="source")
</template>
<script>
import VueMarkdown from 'vue-markdown';
import articleList from '@/../CHANGELOG.md';
export default {
  components: {
    VueMarkdown,
  },
  data() {
    return {
      visible: false,
      source: articleList,
    };
  },
  created() {},
  methods: {
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
  },
};
</script>
<style lang="less" scoped>
.sys_version {
  cursor: pointer;
}
.change_log_container {
  max-height: 500px;
  overflow: auto;
}
</style>
