<template>
  <div class="modal-wrap">
    <div class="top">{{ data.panel }}</div>
      <a-spin :spinning="loading" style="padding-top: 50px" size="large" >
        <div class="fx-top">
          <div class="score-txt" v-if="!(data.title === '综合分析' && !data?.marketTenant)" >
              <div class="name">{{ scoreTitleMap.get(data.title) || '' }}</div>
              <div class="score" v-if="!props.data?.status || props.data?.status === 'close'" >0</div>
              <div class="score" v-else-if="data.title === '综合分析'" >{{ 100 - Number(dataInfo.panelData['riskIndex'] ?? 0) }}</div>
              <div class="score" v-else-if="data.title === '安全管理'" >{{ dataInfo.panelData['safetyTaskNum'] }}</div>
              <div class="score" v-else>{{ dataInfo.todayData['totalNum'] }}</div>

              <div class="value" v-if="!['综合分析', '安全管理'].includes(data.title)">
                <div class="top-value">
                  <span class="txt">环比</span>
                  <img v-if="dataInfo.todayData['chainRatio'] && Number(dataInfo.todayData['chainRatio']) > 0" :src="getSnImage('up.png')" alt="" />
                  <img v-else :src="getSnImage('down.png')" alt="" />
                  <span :class="['ratio', dataInfo.todayData['chainRatio'] && Number(dataInfo.todayData['chainRatio']) > 0 ? 'up' : 'down']">{{ dataInfo.todayData['chainRatio'] || 0 }}%</span>
                </div>
              </div>
          </div>
          <div class="score-txt" style="padding: 10px 0;" v-else></div>
          <div class="right" style="display: flex;">
            <div class="button" id="linkMarketButton" >进入驾驶舱</div>
          </div>
        </div>
        <div class="line"></div>
        <div class="content">
            <!-- 报警数据 -->
            <div v-for="(item,key) in dataInfo.alarmData" class="device" >
              <div>
                <div class="name">{{ item.name }}</div>
                <div class="value" style="white-space: nowrap;">
                  {{ item.totalNum }}
                  <img v-if="item.chainRatio && Number(item.chainRatio) > 0" :src="getSnImage('up.png')" alt="" />
                  <img v-else :src="getSnImage('down.png')" alt="" />
                  <span :class="['ratio', item.chainRatio && Number(item.chainRatio) > 0 ? 'up' : 'down']">{{ item.chainRatio }}%</span>
                </div>
              </div>
            </div>
            <!-- 业务数据 -->
            <template v-for="(item,key) in MapPanelMap[data.title]">
              <div class="device" >
                <div>
                  <div class="name">{{ item }}</div>
                  <div class="value">
                  {{dataInfo.panelData[key]||0}}
                    <!-- {{ dataInfo.panelData?.key || '0'}} -->
                  </div>
                </div>
              </div>
            </template>
        </div>
      </a-spin>
    </div>
</template>
<script setup lang="ts">
import { ref, watch ,onMounted, reactive, computed, nextTick} from "vue";
import { getAssetsImage, getSnImage } from "@/utils/getImage";
import {synthesismarketmard, typeAlarm, eventTypeAlarm ,fireSafetyMarketCard,useAirMarketCard,usafetyMarketCard, eventTodayAlarm} from '@/api/shennong/marketcard'
import dayjs from 'dayjs'
import { MapPanelMap, MapPanelRatio } from '@/components/shengnongPanel/common/alarmlist'

const emit = defineEmits(['dataUpdate']);

const props = withDefaults(
  defineProps<{
    data:any
  }>(),
  {
    data: {
      marketTenant: '25729454'
    },
  }
);
const dataInfo=reactive({
  alarmData: [],
  panelData: {},
  todayData: {}
})
const listData = ref([])
const codeList = {
  综合分析: '',
  安防监控: 'SECURITY_MONITORING',
  电气安全: 'ELECTRICMANAGE',
  消防安全: 'FIRECONTROL',
  用气安全: 'GAS_MANAGEMENT',
}
const scoreTitleMap = new Map([
  ['综合分析', '风险指数'],
  ['电气安全', '电气报警'],
  ['安防监控', '安防监控报警'],
  ['消防安全', '消防报警'],
  ['用气安全', '燃气报警'],
  ['安全管理', '安全任务数'],
])
const param = reactive({
  period:dayjs(new Date()).format('YYYY-MM-DD 00:00:00')+','+dayjs(new Date()).format('YYYY-MM-DD 23:59:59'),
  marketTenant: props.data?.marketTenant
})
const getlist = {
  综合分析: async () => {
    return await Promise.all([
      typeAlarm({
        ...param,
        alarmEventTypeCode: [
        'FIRECONTROL',
        'ELECTRICMANAGE',
        'SECURITY_MONITORING',
        'GAS_MANAGEMENT'
        ].join(","),
      }),
      synthesismarketmard(param),
    ])
  },
  安防监控: async () => {
    return await eventTypeAlarm({
      ...param,
      applicationCode:'SECURITY_MONITORING',
      alarmEventTypeCode: [
      'firecontrolEvent_mhbj',
      'firecontrolEvent_ywbj',
      'firecontrolEvent_wgzyxftd',
      'manageEvent_ddcgl'
      ].join(","),
    })
  },
  电气安全: async () => {
    return await eventTypeAlarm({
      ...param,
      applicationCode:'ELECTRICMANAGE',
      alarmEventTypeCode: [
        "electricEvent_dlbj",
        "electricEvent_dybj",
        "electricEvent_wdbj",
      ].join(","),
    })
  },
  消防安全: async () => {
    return await Promise.all([
      eventTypeAlarm({
        ...param,
        applicationCode:'FIRECONTROL',
        alarmEventTypeCode: [
          "firecontrolEvent_ywbj",
          "firecontrolEvent_sbbj",
          "firecontrolEvent_sybj",
          "firecontrolEvent_wgzyxftd",
        ].join(","),
      }),
      fireSafetyMarketCard(param),
    ])
  },
  用气安全: async () => {
        return await Promise.all([
      eventTypeAlarm({
        ...param,
        applicationCode:'GAS_MANAGEMENT',
        alarmEventTypeCode: [
          "gas_rqxl",
        ].join(","),
      }),
      useAirMarketCard(param),
    ])
  },
  安全管理: async () => {
    return await usafetyMarketCard(param)
  },
};
const alarmEventEnum={
  综合分析:[
    {key:'FIRECONTROL',title:"今日消防报警数"},
    {key:'ELECTRICMANAGE',title:"今日电气报警数"},
    {key:'SECURITY_MONITORING',title:"今日安防报警数"},
    {key:'GAS_MANAGEMENT',title:"今日用气报警数"},
  ],
  用气安全:[
    {key:'gas_rqxl',title:"今日燃气泄漏报警数"}
  ],
  消防安全:[
    {key:'firecontrolEvent_ywbj',title:"今日烟感报警数"},
    {key:'firecontrolEvent_sbbj',title:"今日手报报警数"},
    {key:'firecontrolEvent_sybj',title:"今日消防水压异常"},
    {key:'firecontrolEvent_wgbj',title:"今日温感报警数"},
  ],
  电气安全:[
    {key:'electricEvent_dlbj',title:"今日电流报警"},
    {key:'electricEvent_dybj',title:"今日电压报警"},
    {key:'electricEvent_wdbj',title:"今日温度报警"},
  ],
  安防监控:[
    {key:'firecontrolEvent_mhbj',title:"今日明火报警"},
    {key:'firecontrolEvent_ywbj',title:"今日烟雾报警"},
    {key:'manageEvent_ddcgl',title:"今日电动车入电梯"},
    {key:'firecontrolEvent_wgzyxftd',title:"今日占用消防通道"},
  ]
}
watch(
  () => props.data,
  async() => {
    try {
      loading.value = true
      param.marketTenant = props.data?.marketTenant
      getTodayData()
      listData.value = await getlist[props.data?.title]()
      resolveMarketData(listData.value)
    } catch (error) {
      loading.value = false;
    } finally{
      loading.value = false;
    }
  },
  {deep: true}
);
const resolveMarketData = (data) => {
    loading.value = false;
    let alarmData = null, panelData = {}
  if(['综合分析', '消防安全', '用气安全'].includes(props.data?.title)){
    if (Array.isArray(data)&&data.length) {
      alarmData = data[0]
      panelData = data[1]
    } else {
      alarmData = []
      panelData = data
    }
  }else if(['安防监控', '电气安全'].includes(props.data?.title)) {
    alarmData = data
    panelData = []
  }else{
    alarmData = []
    panelData = data
  }
  const hasAlarmData = alarmData && Array.isArray(alarmData) ? [...alarmData] : [alarmData]
  try {
  // 默认报警数据回显
  if(alarmEventEnum[props.data.title]){
    const keys= alarmEventEnum[props.data.title].map(e=>e.key)
    const noDataKey=[]
    if(!Array.isArray(alarmData)) alarmData = [alarmData]  
    keys.forEach(e=>{
      if(!alarmData.find(ele=>ele.id===e)){
        noDataKey.push(e)
      }
    })
    if(noDataKey.length && props.data.title){
      alarmData = []
      noDataKey.forEach(key=>{
        const find=alarmEventEnum[props.data.title].find(e=>e.key===key)
        find && alarmData.push({name:find.title,totalNum:0,chainRatio:0})
      })
    }
  }
  } catch (error) {
  }
  hasAlarmData.forEach((item, index) =>{
    const find = alarmEventEnum[props.data.title].find(e=>e.key===item.id)
    if(find) item.name = find.title
  })
  const alarmList = Array.from(new Set([ ...hasAlarmData, ...alarmData ]))
  const _arr2 = sortList(alarmEventEnum[props.data.title], alarmList)

  Object.assign(dataInfo, {
    alarmData:  _arr2,
    panelData: panelData,
    todayData: dataInfo.todayData
  })
  emit("dataUpdate", dataInfo)
}

const sortList = (list, needSort) => {
  if(!list) return needSort
  const _list = list.map(li => li.title) 
  return needSort.sort((a, b) => {
    return _list.indexOf(a.name) - _list.indexOf(b.name);
  });
}

const getTodayData = async () => {
    const applicationCode = codeList[props.data?.title]
    dataInfo.todayData = await eventTodayAlarm({
      ...param,
      applicationCode: applicationCode,
    })
}

const loading = ref(false)
onMounted(async()=>{
  dataInfo.alarmData = []
  dataInfo.panelData = {}
  dataInfo.todayData = {}
  try {
    loading.value = true
    getTodayData()
    const data = await getlist[props.data?.title || '综合分析']()
    resolveMarketData(data)
  } catch (error) {
    loading.value = false;
  } finally{
    loading.value = false;
  }
})
</script>
<style lang="less" scoped>
.fx-top {
  display: flex;

  justify-content: space-between;
  align-items: center;
  .score-txt{
    flex: 1;
    display: flex;
    align-items: center;
  }
  .name {
    font-size: 13px;
    font-family: Source Han Sans CN-Regular, Source Han Sans CN;
    font-weight: 400;
    color: #e2edff;
  }
  .score {
    font-size: 26px;
    font-family: pnzd;
    font-weight: 400;
    color: #19d9a9;
    margin: 0 15px;
  }
  .value {
    display: inline-block;
    font-size: 12px;
    font-family: pnzd;
    font-weight: none;
    color: #ccdfff;
    margin-left: 5px;
    .top-value{
      display: flex;
      align-items: center;
    }
  }
  .txt{
    font-size: 13px;

  }
}
.value {
  font-size: 24px;
  font-family: pnzd;
  font-weight: 400;
  color: #ccdfff;
  margin-top: 4px;
  img{
    margin: 0 4px;
  }
}
  .ratio {
    font-size: 12px;
    font-family: Roboto-Regular, Roboto;
    font-weight: 400;
    margin-top: 4px;
    &.up{
      color: #ed4949;
    }
    &.down{
      color: #2ae8bd;
    }
  }
.content {
  display: flex;
  // justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  .device {
    margin-top: 10px;
    padding-left: 10px;
    width: 33%;
    display: flex;
    // flex-grow: 1; 
    background: url("/resource/v1/ue5-sn-migrate/assets/images/sn/s.png") no-repeat;
    background-position: calc(100% - 10px);
    &:nth-child(3n), &:last-child{
      background: none;
    }
    >div{
      width: 100%;
      // flex-grow: 1; 
    }
    .value {
      width: 100%;
      word-wrap: break-word;
      line-height: 16px;
      display: flex;
      align-items: center;
    }
  }
  .name {
    font-size: 12px;
    font-weight: 400;
    color: rgba(226, 237, 255, 0.7);
  }
}
.top {
  margin-left: 10px;
  font-size: 16px;
  font-family: YouSheBiaoTiHei;
  font-weight: 400;
  line-height: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #7aa9f6 100%);
  -webkit-background-clip: text;
  color: transparent;
}
.line {
  width: 100%;
  height: 1px;
  background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/h.png");
}


.button{
  display: inline-block;
  font-size: 16px;
  font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  color:#7aa9f6;

}
#linkMarketButton{
  cursor: pointer;
  pointer-events: auto !important;

}

.modal-wrap {
  cursor: pointer;
  top: 0;
  left: 0;
  // position: absolute;
  // top: 0;
  // left: 0;
  z-index: 1000;
  width: 100%;
  min-height: 200px;
  // border: 50px solid yellowgreen;
  background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/bk.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 15px;
  // overflow: hidden;
}
</style>
