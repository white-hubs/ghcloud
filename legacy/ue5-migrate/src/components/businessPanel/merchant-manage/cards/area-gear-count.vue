<template>
  <SubPanelTemplate title="区域档位数">
    <div class="equipmentAlarm">
      <planPie :pie-data="roundPieData.arr">
        <div class="content">
          <div class="pie-center">{{ roundPieData.throughNum }}</div>
          <div>档位总数</div>
        </div>
      </planPie>
      <pieList :roundPieData="roundPieData.arr"></pieList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";

import { areasAllGraph } from "@/api/merchant";
import planPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import pieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
const roundPieData = reactive({
  arr: [] as any[],
  throughNum: 0,
});

const changeProportionTime = async () => {
  let res = await areasAllGraph({ projectId: "1323555902002921473" });
  roundPieData.throughNum = 0;
  roundPieData.arr = res.map((item: any, index: number) => {
    roundPieData.throughNum += item.spaceNum;
    return {
      label: item.name,
      value: item.spaceNum || 0,
      color: colors[index % colors.length],
    };
  });
};

onMounted(() => {
  changeProportionTime();
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
    font-size: 16px;
    color: #fff;
    text-align: center;
  }

  .pie-center {
    font-size: 18px;
    font-weight: bold;
  }
}
</style>
