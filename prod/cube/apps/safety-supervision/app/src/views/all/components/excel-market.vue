<template>
  <div class="btn-area" v-if="props.showBtn && !props.download">
    <Button type="primary" @click="save">保存</Button>
    <Button type="primary" @click="download" style="margin-left: 10px">下载</Button>
  </div>
  <div
    id="excel-dom"
    style="width: 100%"
    :style="{ height: props.showBtn ? `calc(100% - 50px)` : '100%', display: props.download ? 'none' : 'block' }"
  ></div>
</template>
<script setup lang="ts">
import { onMounted, ref, computed } from "vue";

import { Button } from "@ghcloud/cube-ui";

import { marketTemplate0506, marketTemplate0611, marketTemplate20250520, marketTemplate20260116 } from "./market-template";
//@ts-ignore
import { message } from "ant-design-vue";
import axios from "axios";
import dayjs from "dayjs";

import { downloadExcel, getExcelFileObjet, setValue } from "./excel-head-hook";
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
  showBtn: {
    type: Boolean,
    default: true,
  },
  download: {
    type: Boolean,
    default: false,
  },
  from: {
    type: String,
    default: "",
  },
});
const baseApiUrl = computed(() => {
  return `/api/${props.from === "market" ? "centerApi/" : ""}safety-management`;
});
const saveLoading = ref(false);
const excelJson = ref("");
/** 保存数据 */
const save = async () => {
  try {
    saveLoading.value = true;
    await axios.post(
      baseApiUrl.value + "/public/market-monthly-report",
      {
        id: props.id,
        //@ts-ignore
        reportData: JSON.stringify(luckysheet.getAllSheets()[0]),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    message.success("保存成功");
  } catch (error) {
    message.error("保存失败");
  } finally {
    saveLoading.value = false;
  }
};

//@ts-ignore
const initExcel = (excelData) => {
  // 格式处理
  excelData.celldata.forEach((element: { v: { ct: { fa: string } } }) => {
    if (element && element.v && element.v.ct && element.v.ct.fa === "0%") {
      element.v.ct.fa = "0.00%";
    }
  });
  excelData.data.forEach((element: { ct: { fa: string } }[]) => {
    element.forEach((e: { ct: { fa: string } }) => {
      if (e && e.ct && e.ct.fa) {
        e.ct.fa === "0%" && (e.ct.fa = "0.00%");
      }
    });
  });

  const sheetData = excelData;
  sheetData.name = props.title;
  sheetData.scrollLeft = 0;
  sheetData.scrollTop = 0;
  //@ts-ignore
  window.luckysheet.create({
    container: "excel-dom",
    lang: "zh",
    showinfobar: false,
    showtoolbar: false,
    showsheetbar: false,
    sheetFormulaBar: true,
    enableAddRow: false,
    enableAddBackTop: false,
    data: [sheetData],
    title: props.title,
    cellRightClickConfig: {
      copy: false, // 复制
      copyAs: false, // 复制为
      paste: false, // 粘贴
      insertRow: false, // 插入行
      insertColumn: false, // 插入列
      deleteRow: false, // 删除选中行
      deleteColumn: false, // 删除选中列
      deleteCell: false, // 删除单元格
      hideRow: false, // 隐藏选中行和显示选中行
      hideColumn: false, // 隐藏选中列和显示选中列
      rowHeight: false, // 行高
      columnWidth: false, // 列宽
      clear: false, // 清除内容
      matrix: false, // 矩阵操作选区
      sort: false, // 排序选区
      filter: false, // 筛选选区
      chart: false, // 图表生成
      image: false, // 插入图片
      link: false, // 插入链接
      data: false, // 数据验证
      cellFormat: false, // 设置单元格格式
    },
  });
  //@ts-ignore
  window.luckysheet.setCellValue(0, 0, props.title);

  setValue(29, 4, "=SUM(E13:E29)");
  setValue(29, 5, "=SUM(F13:F29)");
  setValue(29, 6, "=SUM(G13:G29)");
  setValue(29, 7, "=SUM(H13:H29)");
  setValue(29, 8, "=SUM(I13:I29)");
  setValue(29, 9, "=AVERAGE(J13:J29)");
};

const download = async () => {
  const file = await getExcelFileObjet(props.title);
  downloadExcel(file);
};

onMounted(async () => {
  await loadLuckysheet();
  themeManager.mount();
  antd3LegacyThemeManager.mount();
  themeManager.use("极光绿");
  antd3LegacyThemeManager.use("极光绿");
  let monthDate = "";

  await axios(`${baseApiUrl.value}/public/market-monthly-report/${props.id}`).then((res) => {
    const data = res.data.data || res.data;
    excelJson.value = data.reportData ? JSON.parse(data.reportData) : "";
    monthDate = data.monthDate;
  });
  let marketTemplate = marketTemplate0506;
  if (dayjs(Number(monthDate)).isBefore(dayjs(1717200000000))) {
    // @ts-ignore
    marketTemplate = marketTemplate0611;
  }
  // 2024-05 开始使用新的汇总模板
  if (dayjs(Number(monthDate)).isAfter(dayjs(1743465600000))) {
    // @ts-ignore
    marketTemplate = marketTemplate20250520;
  }
  // 2025-12-31 08:00:00 开始使用新的汇总模板
  if (dayjs(Number(monthDate)).isAfter(dayjs(1767139200000))) {
    // @ts-ignore
    marketTemplate = marketTemplate20260116;
  }

  initExcel(excelJson.value ? excelJson.value : marketTemplate);
  if (props.download) {
    await download();
    setTimeout(() => {
      window.close();
    }, 1000);
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
