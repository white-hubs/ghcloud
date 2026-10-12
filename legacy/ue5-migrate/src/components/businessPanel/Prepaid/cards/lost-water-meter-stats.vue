<template>
  <SubPanelTemplate title="失联水表实时统计">
    <div class="equipmentAlarm">
      <PlanPie :pieData="roundPieData">
        <div class="content">
          <div class="total-num">{{ roundPieData[1].value + roundPieData[0].value }}</div>
          <div>设备总数</div>
        </div>
      </PlanPie>
      <pieList :roundPieData="roundPieData"></pieList>
    </div>
    <div class="footer">
      <div class="header">失联水表明细</div>
      <RollTable :column="column" :data="listData"> </RollTable>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import { waterMeterPage } from "@/api/prepaid";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import pieList from "@/components/businessPanel/public/pieList.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const roundPieData = ref([
  {
    value: 0,
    label: "未失联",
    color: "rgba(3, 182, 21, 1)",
  },
  {
    value: 0,
    label: "已失联",
    color: "rgba(245, 154, 35, 1)",
  },
]);
const column = reactive([
  {
    title: "水表编号",
    dataIndex: "meterId",
    width: 120,
  },
  {
    title: "商品号",
    dataIndex: "roomId",
  },
  {
    title: "失联状态",
    dataIndex: "lostState",
  },
]);
const listData = ref([]);

const getWaterMeterPage = async () => {
  const contact = await waterMeterPage({ unConnect: true, pageSize: 50, pageNumber: 1 });
  const noContact = await waterMeterPage({ unConnect: true, pageSize: 50, pageNumber: 1 });
  listData.value = contact.records.map((item) => {
    return {
      ...item,
      lostState: "已失联",
    };
  });
  roundPieData.value[1].value = contact.total;
  roundPieData.value[0].value = noContact.total;
};

onMounted(() => {
  getWaterMeterPage();
});
</script>

<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .content {
    font-size: 16px;
    text-align: center;
    color: #fff;
  }
  .policeList {
    height: auto;
  }
}
.header {
  padding: 0 10px;
  width: 100%;
  height: 30px;
  color: #ffffff;
  font-size: 14px;
  background: rgba(97, 148, 247, 0.2);
  text-align: center;
}
.footer {
  height: 250px;
}
</style>
