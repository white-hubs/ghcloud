<template>
  <a-locale-provider :locale="locale">
    <div id="vue2App" class="vue2App">
      <router-view></router-view>
    </div>
  </a-locale-provider>
</template>
<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';
import { LOAD_CURRENT_PROJECT } from '@store/account';

export default {
  data() {
    return {
      locale: zhCN,
    };
  },
  async created() {
    await this.$store.dispatch(LOAD_CURRENT_PROJECT);
  },
};
</script>
<style lang="less" scoped>
#vue2App {
  width: 100%;
  height: 100%;
}
</style>
