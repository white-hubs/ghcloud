<template>
    <div class="panel">
        <SubPanelTemplate title="消防设备">
            <div class="body">
                <OperateDays title="设备数" :value="equipmentData.deviceNum" class="body-num"></OperateDays>
                <GridContainer :data="devicestatistic"></GridContainer>
                <div class="chart">
                    <RoseChart :pieData="pieData" title="" v-if="pieData.length"></RoseChart>
                    <RoundPie :data="[]" :eventNum="0" v-else>
                      <div class="content">
                        <span>0</span> <br />消防设备
                      </div>
                    </RoundPie>
                </div>
                <div class="statistic-lenged">
                    <div class="statistic-item" v-for="(item, index) in pieData">
                        <a-statistic :value="item.value" :valueStyle="statisticStyle">
                            <template #title>
                                <div class="title flex-start">
                                    <div class="box" :style="statisticValueStyle(index)"></div>
                                    <span>{{ item.name }}</span>
                                </div>
                            </template>
                            <template #suffix>
                                <span>{{ item.chainRatio }}</span>
                            </template>
                        </a-statistic>
                    </div>
                </div>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="消防到期设备统计">
            <template #extra>
                <DateInlineForm
                  v-model:modelValue="timeFrame"
                  @search="changeTopTimeFrame"
                ></DateInlineForm>
            </template>
            <OperateDays title="设备数" :value="alarmCon.totalNumber" class="body-bum">
                <div class="extra flex-start">
                    <div class="mode">环比</div>
                    <div :class="['downtriangle', alarmCon.chainRatio > 0 && 'uptriangle']"></div>
                    <div :class="[alarmCon.chainRatio < 0 ? 'down' : 'up']">{{ alarmCon.chainRatio }}%</div>
                </div>
            </OperateDays>
            <RollTable  :column="alarmColumn" :data="listData" :limitScrollNum="4">
                <template #deviceStatus="{ record }">
              <span class="details" @click="clickRow(record)">定位</span>
            </template>
            </RollTable>
        </SubPanelTemplate>
    </div>
</template>
<script lang="ts" setup>
import { computed, ref, onMounted, reactive, watch, onBeforeUnmount } from "vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from '../public/dateInlineForm.vue';
import OperateDays from '../public/operateDays.vue';
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import GridContainer from '../public/gridContainer.vue';
import RoseChart from '../public/charts/roseChart/roseChart.vue';
import { ModelValueItf } from '../public/types'
import useCommon from '../../hooks/useCommon'
import RollTable from "../public/rollTable/index.vue";
import { storeArea } from "@/piniaStore/area"
import { AlarmAreaTop } from '@/api/models/alarm'
import { statisticsAreaTop } from '@/api/alarm'
import { storeMenu } from "@/piniaStore/menu"
import { mockEquipmentNumber, mockStatisticsAreaTop } from "@/mock/fire-control"
import { expiredPage,expiredChain } from "@/api/device";
import {UeClient} from "@ghcloud/cube-visual-sdk";
const ueClient = UeClient.getInstance();

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();

let timer: any = reactive(null)
const timeFrame = ref<ModelValueItf>({
timeType: 'TODAY',
dateRange: []
});
const pieData = ref([])
const devicestatistic = ref([])
const statisticValueStyle = computed(() => (index) => {
    return {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: pieData[index]?.itemStyle.color
    }
})
const statisticStyle = computed(() => {
    return {
        fontSize: '16px',
        color: '#FFFFFF',
        paddingLeft: '16px'
    }
})
let deviceStatusType = {
    'ALARM': '报警',
    'TROUBLE': '故障',
    'OFFLINE': '离线',
    'NORMAL': '正常',
}
let colorList = ['#328BF7', '#19F8F7', '#FFC700', '#EF424A']
const stateList = {
    SPLIT:'待拆解',
    ACCEPT:'待接收',
    EXECUTING:'进行中',
    OVER:'已完成',
    EXPIRE:'已过期',
}
const alarmColumn = [
  {
    title: "设备名称",
    dataIndex: "name",
    width: 120,
  },
  {
    title: "设备类型",
    dataIndex: "genreName",
  },
  {
    title: "使用年限",
    dataIndex: "usefulLifeYear",
  },
  {
    title: "操作",
    dataIndex: "deviceStatus",
    slots: {
      customRender: "deviceStatus",
    },
    width: 80,
  }
];
const listData = ref([])
const alarmCon = ref({
  totalNumber: 0,
  chainRatio: 0,
});
const areaAlarmDate = ref<ModelValueItf>()
watch(() => piniaStoreArea.currentAreaId, () => {
    clearInterval(timer)
    timer = setInterval(() => {
        init()
    }, (window as any).config.pageLoopRequestTime)
    init()
})
const { getEquipmentNumber } = useCommon()
let equipmentData = reactive({
    deviceNum: 0,
    devices: [],
    deviceGenreNums: {}
})
const clickRow = (value)=>{
    ueClient.send('focusActor', {id: value.code});
}
// 设备统计
const changeTopTimeFrame = async()=>{
    const param = {
        sceneType: piniaStoreMenu.currentMenu,
        areaId: piniaStoreArea.currentAreaId,
        period: timeFrame.value.dateRange.join(","),
        type: timeFrame.value.timeType,
    };
  const {records} = await expiredPage(param)
  listData.value = records.map(item=>{
    return {
      ...item,
      expireStatus:stateList[item.expireStatus]
    }
  })
  alarmCon.value = await expiredChain(param)
}
// 动环设备
const getEquipmentInfo = async () => {
    pieData.value.length = 0
    devicestatistic.value.length = 0
    let res:any = await getEquipmentNumber()
    // let res: any = mockEquipmentNumber()
    equipmentData.deviceNum = res.deviceNum
    equipmentData.devices = res.devices
    equipmentData.deviceGenreNums = res.deviceGenreNums
    res.deviceStatusNums.forEach((item, index) => {
        devicestatistic.value.push({
            alarmStatusName: deviceStatusType[item.name],
            alarmNum: item.num,
            color: colorList[index]
        })
    })
    res.deviceGenreNums.forEach((item, index) => {
        pieData.value.push({
            name: item.genreName,
            value: item.num,
            color: colorList[index]
        })
    })
}
function init() {
    getEquipmentInfo()
}
onMounted(() => {
    // init()
    // timer = setInterval(() => {
        init()
        changeTopTimeFrame()
    // }, (window as any).config.pageLoopRequestTime)
})
onBeforeUnmount(() => {
    clearInterval(timer)
})
</script>
<style lang="less" scoped>
.body-num {
    margin: 10px 0;
}

.chart {
    height: 160px;
}
.body-bum{
    margin-bottom:10px;
}
.extra {
  margin-left: 16px;
  font-size: 12px;
  font-weight: 400;
  font-family: Roboto-Regular, Roboto;

  .mode {
    color: #e7f0ff;
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin: 0 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }

  .down {
    color: #2ae8bd;
    font-family: Roboto-Regular, Roboto;
  }

  .up {
    color: #f14545;
    font-family: Roboto-Regular, Roboto;
  }
}
.details{
  color: #91C2F2;
  cursor: pointer;
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