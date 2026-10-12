<template>
  <ConfigProvider :locale="locale">
    <RouterView></RouterView>
  </ConfigProvider>
</template>
<script setup lang="ts">
import { ConfigProvider } from "ant-design-vue";
import locale from "ant-design-vue/lib/locale-provider/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
dayjs.locale("zh-cn");
</script>
<style scoped></style>
