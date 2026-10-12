<template>
  <div class="panel">
    <SubPanelTemplate title="设备实时数据">
      <div class="flex-between mg-10">
        <PlanPie :pieData="roundPieData">
          <div class="content">
            <div class="total-num">{{ alarmTotal }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="roundPieData"></PieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="污水设备分类">
      <div class="chart">
        <RingChart :pieData="pieData" seriesName="设备类型统计" :total="alarmCon"></RingChart>
      </div>
      <div class="statistic">
        <div class="statistic-item" v-for="(item, index) in pieData">
          <a-statistic :value="item.value" :valueStyle="statisticStyle">
            <template #title>
              <div class="title flex-start">
                <div class="box" :style="statisticValueStyle(index)"></div>
                <span>{{ item.name }}</span>
              </div>
            </template>
          </a-statistic>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="异常设备清单">
      <RollTable :column="alarmColumn" :data="listData" :limitScrollNum="4">
      </RollTable>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, computed} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import RollTable from "../public/rollTable/index.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import RingChart from "../public/charts/ring/ring.vue";
import { ModelValueItf } from '../public/types'
import useCommon from '@/components/hooks/useCommon'
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import moment from 'moment'
import { alarmStatisticsList } from '@/api/alarm'

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
const deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};
const { getEquipmentNumber } = useCommon();
const roundPieData = ref([]);
const alarmTotal = ref(0)
const statisticStyle = computed(() => {
  return {
    fontSize: "16px",
    color: "#FFFFFF",
    paddingLeft: "16px",
  };
});
const statisticValueStyle = computed(() => (index) => {
  return {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: colors[index % colors.length],
  };
});
const alarmCon = ref(0)
const pieData = ref([]);
const alarmColumn = [
  {
    title: "设备名称",
    dataIndex: "alarmTargetName",
    width: 120,
  },
  {
    title: "异常情况",
    dataIndex: "alarmTargetTypeName",
  },
  {
    title: "上报时间",
    dataIndex: "alarmTime",
    width: 140,
  }
];
const listData = ref([])
// 设备实时数据
const deviceDataInfo = async () => {
  let res: any = await getEquipmentNumber();
  if (!res.deviceNum) {
    return;
  }
  roundPieData.value.length = 0;
  pieData.value.length = 0;
  alarmTotal.value = 0;
  res.deviceStatusNums.forEach((item, index) => {
    alarmTotal.value += item.num;
    let obj = {
      label: deviceStatusType[item.name],
      color: colors[index],
      value: item.num,
    };
    roundPieData.value.push(obj);
  });
  res.deviceGenreNums.forEach((item, index) => {
    alarmTotal.value += item.num;
    let obj = {
      name: item.genreName,
      color: colors[index],
      value: item.num,
    };
    pieData.value.push(obj);
  });
};
// 异常设备清单
const abnormalEquipment = async ()=>{
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    // period:[moment().startOf("month").format('YYYY-MM-DD 00:00:00'), moment().format("YYYY-MM-DD HH:mm:ss")].join(','),
    pageSize: 10,
    pageNumber: 1, 
  };
  let {records} = await alarmStatisticsList(params);
  listData.value = records.map(item=>{
    return {
      ...item,
      alarmTime:moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss")
    }
  })
}
onMounted(()=>{
  deviceDataInfo()
  abnormalEquipment()
})
</script>
<style lang="less" scoped>
.chart {
  height: 200px;
}

.statistic {
  display: grid;
  grid-column-gap: 10px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  margin-top: 10px;

  .title {
    font-size: 12px;
    color: #d0deee;

    .box {
      margin-right: 8px;
    }
  }
}
.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}
</style>