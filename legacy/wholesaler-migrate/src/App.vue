<template>
  <a-locale-provider :locale="locale">
    <div id="app" class="app">
      <router-view></router-view>
    </div>
  </a-locale-provider>
</template>
<script>
import { LOAD_CURRENT_PROJECT } from '@store/account';
import zhCn from '@nqmy/ant-design-vue/lib/locale-provider/zh_CN'
export default {
  data() {
    return {
      locale: zhCn
    }
  },
  created() {
    this.$store.dispatch(LOAD_CURRENT_PROJECT);
  },
}
</script>
