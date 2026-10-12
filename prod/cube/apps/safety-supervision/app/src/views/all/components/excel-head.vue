<template>
  <div id="excel-dom" style="width: 100%; height: 100%" :style="{ display: props.download ? 'none' : 'block' }"></div>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
//@ts-ignore
import { message } from "ant-design-vue";
import axios from "axios";

import { downloadExcel, getExcelFileObjet, initExcel } from "./excel-head-hook";
import { loadLuckysheet } from "./luckysheet-loader";
import { themeManager, antd3LegacyThemeManager } from "@/utils/theme";

const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  download: {
    type: Boolean,
    default: false,
  },
  monthDate: {
    type: String,
    default: "",
  },
});

onMounted(async () => {
  await loadLuckysheet();
  themeManager.mount();
  antd3LegacyThemeManager.mount();
  themeManager.use("极光绿");
  antd3LegacyThemeManager.use("极光绿");

  //获取各个市场的数据
  const marketData: {
    marketName: string;
    marketData: unknown[];
  }[] = [];
  message.loading("正在加载数据...", 0);
  await axios.get(`/api/safety-management/public/market-monthly-reports/wind-up/${props.id}/by-monthly-report`).then((res) => {
    res.data.forEach((element: { title: string; reportData: string; marketName: string }) => {
      if (element.reportData) {
        marketData.push({
          marketName: element.marketName || element.title,
          marketData: JSON.parse(element.reportData),
        });
      }
    });
  });
  message.destroy();
  initExcel(props.title, marketData, props.monthDate);
  if (props.download) {
    message.destroy();
    message.loading("正在导出...", 0);
    setTimeout(async () => {
      const file = await getExcelFileObjet(props.title);
      message.destroy();
      downloadExcel(file);
      setTimeout(() => {
        window.close();
      }, 1000);
    }, 5000);
  }
});
</script>
<style scoped>
.btn-area {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 50px;
  box-sizing: border-box;
  padding: 5px;
}
</style>
