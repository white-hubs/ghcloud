<template>
  <SubPanelTemplate title="诚信经营占比">
    <a-select @change="changeSecureTime" v-model:value="secureType" style="height: 28px; margin-bottom: 10px">
      <a-select-option :value="item.value" v-for="(item, i) in typeList1" :key="i">{{ item.label }}</a-select-option>
    </a-select>
    <div class="equipmentAlarm">
      <planPie :pie-data="proportionData.arr">
        <div class="content">
          <div class="pie-center">{{ proportionData.throughNum }}(次)</div>
          <div>评价次数总数</div>
        </div>
      </planPie>
      <pieList :roundPieData="proportionData.arr"></pieList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import { visualizationProportion } from "@/api/merchant";
import planPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import pieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
const secureType = ref("honesty_score");
const typeList1 = [
  {
    label: "诚信经营",
    value: "honesty_score",
  },
  {
    label: "商品质量",
    value: "z_score",
  },
  {
    label: "诚实守信",
    value: "s_score",
  },
  {
    label: "服务态度",
    value: "t_score",
  },
  {
    label: "环境卫生",
    value: "w_score",
  },
];
const proportionData = reactive({
  arr: [] as any[],
  throughNum: 0,
});

const changeSecureTime = async () => {
  let res = await visualizationProportion({ code: secureType.value });
  proportionData.throughNum = 0;
  proportionData.arr = res.map((item: any, index: number) => {
    proportionData.throughNum += item.value;
    return {
      label: item.name,
      value: item.value,
      color: colors[index % colors.length],
    };
  });
};

onMounted(() => {
  changeSecureTime();
});
</script>

<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  :deep(.policeList) {
    height: auto;
  }

  .content {
    font-size: 12px;
    color: #fff;
    text-align: center;
  }

  .pie-center {
    font-size: 16px;
    font-weight: bold;
  }
}
</style>
