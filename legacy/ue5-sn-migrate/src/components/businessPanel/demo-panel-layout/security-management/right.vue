<template>
  <div class="panel">
    <SubPanelTemplate title="安全资产结构" class="security-asset-structure">
      <OperateDays :value="7822" title="设备总数" />
      <EquipmentCard title="正常运行设备" status="success" :conut="7822" />
      <EquipmentCard1 title="故障设备数" :conut="0" />
      <RoundPie class="round-pie" :data="roundPieData">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          fill="none"
          version="1.1"
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <g style="mix-blend-mode: passthrough">
            <g>
              <path
                d="M2.21066625,1.095703125L17.79285625,1.095703125C18.40785625,1.095703125,18.90585625,1.718991125,18.90585625,2.486973125L18.90585625,6.553183125C18.90585625,7.321903125,18.40725625,7.945193125,17.79285625,7.945193125L2.21066625,7.945193125C1.59596925,7.945193125,1.09765625,7.322303125,1.09765625,6.553923125L1.09765625,2.486973125C1.09765625,1.718249125,1.59628625,1.095703125,2.21066625,1.095703125ZM3.87158625,3.835203125C3.56898625,3.835203125,3.32368625,4.141833125,3.32368625,4.520073125C3.32368625,4.898323125,3.56898625,5.204953125,3.87158625,5.204953125L7.22783625,5.204953125C7.53043625,5.204953125,7.77573625,4.898323125,7.77573625,4.520073125C7.77573625,4.141833125,7.53043625,3.835203125,7.22783625,3.835203125L3.87158625,3.835203125ZM2.21066625,12.055203125L17.79285625,12.055203125C18.40785625,12.055203125,18.90585625,12.678503125,18.90585625,13.446403125L18.90585625,17.513403125C18.90585625,18.281403125,18.40725625,18.903903125,17.79285625,18.903903125L2.21066625,18.903903125C1.59596925,18.903903125,1.09765625,18.281003125,1.09765625,17.512703125L1.09765625,13.446403125C1.09765625,12.677703125,1.59628625,12.054403125,2.21066625,12.054403125L2.21066625,12.055203125ZM3.87158625,14.795403125C3.56898625,14.795403125,3.32368625,15.102003125,3.32368625,15.480303125C3.32368625,15.858503125,3.56898625,16.165203124999998,3.87158625,16.165203124999998L7.22783625,16.165203124999998C7.53043625,16.165203124999998,7.77573625,15.858503125,7.77573625,15.480303125C7.77573625,15.102003125,7.53043625,14.795403125,7.22783625,14.795403125L3.87158625,14.795403125Z"
                fill="#D0DEEE"
                fill-opacity="1"
              />
            </g>
          </g>
        </svg>
      </RoundPie>
      <div class="round-pie-info">
        <div class="item" v-for="(item, i) in tableData" :key="i">
          <span class="dot" :style="{ background: item.color }"></span>
          <span class="label">{{ item.label }}</span>
          <span class="value">{{ item.value }}</span>
          <span class="rate">{{ item.rate }}</span>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="巡检记录" class="inspection-record">
      <RollTable :column="columns" :data="data">
        <template #status="{ record }">
          <span :class="record.status ? 'success' : 'danger'">{{
            record.status ? "正常" : "异常"
          }}</span>
        </template>
      </RollTable>
    </SubPanelTemplate>
    <SubPanelTemplate title="风险雷达">
      <Radar
        :data="radarData.map((d) => d.value)"
        :titles="radarData.map((d) => d.label)"
        :max-data="radarData.map((d) => d.maxValue)"
      />
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import SubPanelTemplate from "../../../businessPanel/public/subPanelTemplate.vue";
import OperateDays from "../../public/operateDays.vue";
import EquipmentCard from "../../public/equipmentCard.vue";
import Radar from "../../public/charts/radar/radar.vue";
import RoundPie from "../../public/charts/roundPie/roundPie.vue";
import InspectionRecord from "../../public/inspectionRecord .vue";
import EquipmentCard1 from "../../public/equipmentCard1.vue";
import RollTable from "../../public/rollTable/index.vue";
import moment from "moment";
const roundPieData = [
  { label: "动环设备", color: "#00F27B", value: 11, rate: "1%" },
  { label: "广播设备", color: "#FFC700", value: 27, rate: "3.4%" },
  { label: "消防设备", color: "#6EE3E1", value: 2314, rate: "29.6%" },
  { label: "监控设备", color: "#328BF7", value: 463, rate: "5.91%" },
  { label: "电气设备", color: "#6F5DFF", value: 133, rate: "1.7%" },
  { label: "其他设备", color: "#6F5DFF", value: 4874, rate: "58%" },
];
const tableData = [
  { label: "设备名", color: "transparent", value: "设备数", rate: "占比" },
  ...roundPieData,
];
const radarData = [
  { label: "资产安全", color: "#00F27B", value: 80, maxValue: 100, rate: "1%" },
  { label: "消防安全", color: "#FFC700", value: 90, maxValue: 100, rate: "3.4%" },
  { label: "电气安全", color: "#6EE3E1", value: 90, maxValue: 100, rate: "29.6%" },
  { label: "食品安全", color: "#328BF7", value: 88, maxValue: 100, rate: "5.91%" },
];
const columns = ref([
  {
    title: "巡检对象",
    dataIndex: "name",
  },
  {
    title: "对象类型",
    dataIndex: "level",
  },
  {
    title: "巡检结果",
    dataIndex: "status",
    slots: {
      customRender: "status",
    },
  },
  {
    title: "巡检时间",
    dataIndex: "time",
    width: 120,
  },
]);
const data = ref([
  {
    level: `档位`,
    name: `海E04`,
    time: moment().format("YYYY-MM-DD") + " 21:14",
    status: true,
  },
  {
    level: `消防设备`,
    name: `海E115`,
    time: moment().format("YYYY-MM-DD") + " 22:34",
    status: false,
  },
  {
    level: `消防设备`,
    name: `菜C125`,
    time: moment().format("YYYY-MM-DD") + " 23:41",
    status: true,
  },
  {
    level: `电气设备`,
    name: `负一楼机房`,
    time: moment().format("YYYY-MM-DD") + " 23:51",
    status: true,
  },
  {
    level: `监控设备`,
    name: `五号门摄像机9号`,
    time: moment().format("YYYY-MM-DD") + " 04:02",
    status: true,
  },
  {
    level: `监控设备`,
    name: `二号门摄像机2号`,
    time: moment().format("YYYY-MM-DD") + " 04:11",
    status: false,
  },
  {
    level: `动环设备`,
    name: `南区UPS机房`,
    time: moment().format("YYYY-MM-DD") + " 04:20",
    status: true,
  },
  {
    level: `档位`,
    name: `肉类B02`,
    time: moment().format("YYYY-MM-DD") + " 04:31",
    status: true,
  },
]);
</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.chart {
  height: 140px;
  display: flex;
}

.inspection-record {
  height: 280px;
}

.security-asset-structure {
  .equipmentCard {
    display: inline-block;
    margin-top: 10px;
    margin-right: 12px;
  }

  :deep(.round-pie) {
    margin-top: 28px;
    display: inline-block;
  }

  .round-pie-info {
    display: inline-flex;
    flex-flow: column;
    float: right;
    margin-top: 20px;
    margin-right: 10px;

    .item {
      width: 174px;
      height: 26px;
      background: rgba(0, 0, 0, 0.15);
      border-radius: 4px 4px 4px 4px;
      color: white;
      display: flex;
      align-items: center;
      padding-left: 10px;
      margin-bottom: 4px;
      position: relative;
      font-size: 14px;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 3px;
      }

      .label {
        color: #d0deee;
        margin-right: 20px;
        font-size: 12px;
      }

      .rate {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 10px;
      }
    }
  }
}
</style>
