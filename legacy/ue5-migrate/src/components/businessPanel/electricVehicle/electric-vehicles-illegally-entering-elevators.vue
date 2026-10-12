<template>
  <SubPanelTemplate title="电动车违规入电梯统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTimeType" @search="changeDate"></DateInlineForm>
    </template>
    <div class="content">
      <DeviceStatistics style="height: 50px;" imgPath="overView121.png" :statistic="deviceStatisticsData">
      </DeviceStatistics>
      <div class="stat-list">
        <div class="list-item" @click="openAlarm(item)" v-for="item in lists" :key="item.id">
          <img v-if="item.intranetFilePath && item.extranetFilePath" :src="
                  serveIp === 'http'
                    ? item.intranetFilePath
                    : item.extranetFilePath
                " alt="">
          <img v-else :src="getAssetsImage('alarm-default.png')" alt="" srcset="">
          <div class="item-content">
            <div class="alarm-name">
              <div class="name">{{ item.alarmEventTypeName }}</div>
              <div :class="['alarm-item-left-content-desc',item.alarmLevelCode]" class="alarm-level">
                {{item.alarmLevelName}}报警</div>
            </div>
            <div class="time">{{item.alarmTime}}</div>
          </div>
          <div :class="['alarm-item-right',item.alarmStatus]">
            {{ item.alarmStatusName }}
          </div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
  <Alarm  :alarmDetailData="alarmDetailData" v-if="show" @close="show = false"
    :isalarm="true">
  </Alarm>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from '../public/types'
import DeviceStatistics from "@/components/businessPanel/small-engineering/components/device-statistics.vue"
import { alarmRecordsCommonPage, recordStatus } from "@/api/alarm";
import { getVideoFilePaths } from "@/api/linkage";
import dayjs from "dayjs";
import { isHttpUrl } from "@/utils/common";
import { getAssetsImage } from "@/utils/getImage";
import Alarm from "@/components/alarmdetails/equipmentMode.vue";

const alarmTimeType = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const deviceStatisticsData = reactive({
    title: "违规入电梯数",
    total: 0,
    ratio:0
});
const alarmDetailData = ref({});

const serveIp = window.location.protocol;
const show = ref(false);
const lists = ref([])
const getAlarmData = async (id)=>{
 return new Promise(async (resolve,reject)=>{
    try {
      const alarmData = await getVideoFilePaths(id)
      resolve(alarmData)
    } catch (error) {
      reject()
    }
  })
}
const changeDate = async ()=>{
  const res = await recordStatus({applicationCode:'ELECTRlC_VEHICLE',alarmEventTypeId:'electricVehucle_wgrt'})
  deviceStatisticsData.total = res.alarmNum
  deviceStatisticsData.ratio = res.chainRatio
  
  const { records } = await alarmRecordsCommonPage({
    period: alarmTimeType.value.dateRange.join(","),
    pageSize: 20,
    pageNumber: 1,
    applicationCode:'ELECTRlC_VEHICLE',
    alarmEventTypeId:'electricVehucle_wgrt'
  })
  for (let i = 0; i < records.length; i++) {
    records[i].alarmTime = dayjs(records[i].alarmTime).format("YYYY-MM-DD HH:mm:ss")
    try {
      const res:any = await getAlarmData(records[i].businessKey)
      const imageList = res.alarmData.filter((item) => item.type === "PHOTOGRAPH").map(item => {
          if(item.intranetFilePath && !isHttpUrl(item.intranetFilePath)){
            item.intranetFilePath = res.baseUrl + item.intranetFilePath
          }
          if(item.extranetFilePath && !isHttpUrl(item.extranetFilePath)){
            item.extranetFilePath = res.baseUrl + item.extranetFilePath
          }
          item.intranetFilePath = item.intranetFilePath +'?session='+res.sessionData.session
          item.extranetFilePath = item.extranetFilePath +'?session='+res.sessionData.session
          return item
        })
        records[i].intranetFilePath = imageList[0].intranetFilePath
        records[i].extranetFilePath = imageList[0].extranetFilePath
    } catch (error) {
      
    }
  }
  lists.value = records
}
const openAlarm = (item)=>{
  alarmDetailData.value = item;
  show.value = true;
}
</script>
<style lang="less" scoped>
.stat-list {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}

.list-item {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  height: 82px;
  margin-top: 10px;
  background: linear-gradient(90deg, rgba(0, 34, 61, 0.00), #002a56 50%, #002a56 51%, rgba(9, 49, 114, 0.00));

  img {
    width: 62px;
    height: 62px;
    border-radius: 8px;
    flex-shrink: 0;
  }


  .item-content {
    height: 80px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    margin-left: 10px;

    .alarm-name {
      display: flex;
      align-items: center;
      gap: 4px
    }

    .name {
      font-size: 16px;
      font-weight: 600;
      width: 100px;
      color: #d9e5ff;
      overflow: hidden; 
      text-overflow: ellipsis; 
      white-space: nowrap;
    }

    .one_level {
      background: rgba(255, 0, 0, 0.15);
      border: 0.5px solid rgba(255, 187, 187, 0.50);
      box-shadow: 0px 0px 9px 0px rgba(255, 114, 114, 0.50) inset;
      color: #ffcece;
    }

    .two_level {
      background: rgba(247, 160, 59, 0.15);
      border: 0.5px solid rgba(255, 224, 188, 0.50);
      box-shadow: 0px 0px 9px 0px rgba(247, 160, 59, 0.50) inset;
      color: #f7a03b;
    }

    .three_level {
      background: rgba(250, 234, 78, 0.15);
      border: 0.5px solid rgba(255, 249, 192, 0.50);
      box-shadow: 0px 0px 9px 0px rgba(250, 234, 78, 0.50) inset;
      color: #e1d244;
    }

    .four_level {
      background: rgba(75, 134, 255, 0.15);
      border: 0.5px solid rgba(188, 210, 255, 0.50);
      box-shadow: 0px 0px 9px 0px rgba(75, 134, 255, 0.50) inset;
      color: #4c9aff;
    }

    .alarm-item-left-content-desc {
      margin-left: 6px;
      padding: 2px;
      font-size: 12px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .time {
      font-size: 14px;
      color: #8fa0c5;
      margin-top: 10px;
    }
  }

  .alarm-item-right {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    font-size: 14px;
    text-align: center;
    line-height: 56px;
  }

  .ALARM_UN_CONFIRMED {
    background: rgba(204, 159, 91, 0.20);
    box-shadow: 0px 0px 6px 0px rgba(204, 159, 91, 0.50) inset;
    color: #d69833;
  }

  .ALARM_PROGRESS_CONFIRMED {
    background: rgba(204, 159, 91, 0.20);
    box-shadow: 0px 0px 6px 0px rgba(204, 159, 91, 0.50) inset;
    color: #d69833;
  }

  .ALARM_SUSPEND {
    background: rgba(75, 134, 255, 0.20);
    box-shadow: 0px 0px 6px 0px rgba(75, 134, 255, 0.50) inset;
    color: #4b86ff;
  }

  .ALARM_HANDLER {
    background: rgba(91, 204, 98, 0.20);
    box-shadow: 0px 0px 6px 0px rgba(62, 200, 53, 0.50) inset;
    color: #3ec835;
  }
}
</style>