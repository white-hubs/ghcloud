<template>
  <SubPanelTemplate title="报警记录" image="security-6.png" class="gz">
    <template #extra>
      <DateInlineForm v-model:modelValue="safetyWorkTime" menuPage="comprehensive" @search="changeWorkOrderTime" />
    </template>
    <div class="more" @click="moreClick">查看更多></div>
    <template v-if="list.length">
      <div class="alarm-list" v-for="item in list" :key="item.id">
        <div class="alarm-item" @click="clickRowAlarm(item)">
          <div class="alarm-item-left">
            <img v-if="!item.intranetFilePath ||  !item.extranetFilePath" :src="getSnImage('alarm-default.png')" alt="" srcset="">

              <img v-else :src="
                    serveIp === 'http'
                      ? item.intranetFilePath
                      : item.extranetFilePath
                  " 
                @error="handleImageError"
                />
            <div class="alarm-item-left-content">
              <div class="alarm-item-left-content-top">
                <div class="alarm-item-left-content-title">{{item.alarmEventTypeName}}</div>
                <div :class="['alarm-item-left-content-desc',item.alarmLevelCode]">{{item.alarmLevelName}}报警</div>
              </div>
              <div class="alarm-item-left-content-bottom">
                <div class="alarm-item-left-content-time">{{item.marketName}}</div>
                <div class="alarm-item-left-content-status">{{item.alarmTime}}</div>
              </div>
            </div>
          </div>
          <div :class="['alarm-item-right',item.alarmStatus]">
            {{ item.alarmStatusName }}
          </div>
        </div>
      </div>
    </template>
    <NoData class="modal-layout" v-else></NoData>
  </SubPanelTemplate>
  <Modal :show="alarmDetailModalShow" :title="`${alarmDetailParameter?.alarmTypeName}【${ alarmDetailParameter?.marketName || alarmDetailParameter?.market }】`" @close="closeModal">
    <Alarm @closeDevicePanel="closeModal" :alarmDetailData="alarmDetailParameter" v-if="alarmDetailModalShow"
      :isalarm="true" :marketName="alarmDetailParameter?.marketName ">
    </Alarm>
  </Modal>
  <modal-alarm-table
  :show-modal="alarmModalShow"
  @close="closeAlarmModal"
  :parameter="alarmParameter"
></modal-alarm-table>
</template>

<script setup lang="ts">
import { getSnImage } from '@/utils/getImage'
import { ref} from 'vue'
import NoData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import DateInlineForm from "../../common/dateInlineForm.vue";
import { ModelValueItf } from "../../../businessPanel/public/types";
import { storeMarket } from "@/piniaStore/other";
import dayjs from 'dayjs'
import { alarmRecordPage, getMarketConfig } from "@/api/shennong/alarm";
import qs from 'qs'
import axios from 'axios'
import { getVideoFilePathsSn, loginSessionSn } from '@/api/snMarket'
import { isHttpUrl } from "@/utils/common";
import { openAlarmDetail } from '@/components/hooks/useAlarm'
import Alarm from "@/components/alarmdetails/equipmentModesn.vue";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import Modal from "@/components/modal-table/modal.vue";
import useEscClose from '@/components/hooks/useEscClose';

const props = withDefaults(
  defineProps<{
    applicationCode: string;
  }>(),
  {
    applicationCode: "",
  }
);
const serveIp = window.location.protocol;

const safetyWorkTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const piniaStoreMarket = storeMarket();
const list = ref([]);
const alarmDetailModalShow = ref(false);
const alarmDetailParameter = ref<any>({
  applicationCode: props.applicationCode,
  alarmTypeCode: props.applicationCode,
});
// 获取市场数据
const getMarketData = async (data) => {
 return new Promise(async (resolve, reject) => {
    try {
      const res = await getMarketConfig({id:data.marketTenant});
      const params = {
        grant_type: "client_credentials",
        client_id: res.account,
        client_secret: res.password,
      };
      const value = await axios.post(`${res?.url}/api/ouaa/oauth/token`, qs.stringify(params))
      await sessionStorage.setItem("market-token", value.data.access_token);
      await sessionStorage.setItem("market-baseUrl", res?.url);
      await sessionStorage.setItem("market-tenant", data?.marketTenant);
      const sessionData = await loginSessionSn()
      const alarmData = await getVideoFilePathsSn(data.businessKey,res?.url)
      resolve({alarmData,sessionData,baseUrl:res?.url})
    } catch (error) {
      reject()
    }
  })
}
const changeWorkOrderTime = async ()=>{
  let param = {
    period: safetyWorkTime.value.dateRange.join(","),
    type: safetyWorkTime.value.timeType,
    pageSize: 4,
    pageNumber: 1,
    marketTenant: '',
    applicationCode: props.applicationCode,
  };
  let { records } = await alarmRecordPage(param);
  for (let i = 0; i < records.length; i++) {
    records[i].alarmTime = dayjs(records[i].alarmTime).format("YYYY-MM-DD HH:mm:ss")
    try {
      const res:any = await getMarketData(records[i])
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
  sessionStorage.removeItem("market-token");
  sessionStorage.removeItem("market-baseUrl");
  sessionStorage.removeItem("market-tenant");
  list.value = records.slice(0, 3);
}
const clickRowAlarm = async (record) => {
  await openAlarmDetail(record, (res)=>{
    alarmDetailParameter.value = Object.assign(alarmDetailParameter.value, record);
    alarmDetailModalShow.value = true;
  })
};
const closeModal = () => {
  alarmDetailModalShow.value = false;
}
useEscClose(() => {
  if (alarmDetailModalShow.value) {
    closeModal();
  }
});
const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  alarmTypeCode: props.applicationCode,
});
const moreClick=()=>{
  alarmParameter.value = {
    applicationCode: props.applicationCode,
    dateRange: safetyWorkTime.value.dateRange,
  }
  alarmModalShow.value = true;
}
const closeAlarmModal = () => {
  alarmModalShow.value = false;
}
const handleImageError = (event) => {
  const img = event.target;
  img.status = 'error';
  img.src = getSnImage('alarm-default.png');
};
</script>
<style lang="less" scoped>
.alarm-list {
  margin-top: 8px;
  .alarm-item {
    padding: 4px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(90deg, rgba(0, 34, 61, 0.00), #002a56 50%, #002a56 51%, rgba(9, 49, 114, 0.00));
    cursor: pointer;
    background: url("/resource/v1/ue5-sn-migrate/assets/images/sn/xs-bg.png") no-repeat;
    background-size: 100% 100%;
    margin-bottom: 6px;
    .alarm-item-left {
      display: flex;
      align-items: center;
      flex: 1;

      img {
        width: 62px;
        height: 62px;
      }

      .alarm-item-left-content {
        margin-left: 14px;

        .alarm-item-left-content-top {
          display: flex;
          align-items: center;

          .alarm-item-left-content-title {
            font-size: 15px;
            color: #d9e5ff;
            max-width: 150px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis; 
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
            padding: 0 4px;
            font-size: 13px;
            border-radius: 4px;
            flex-shrink: 0;
          }
        }

        .alarm-item-left-content-bottom {
          display: flex;
          align-items: center;

          .alarm-item-left-content-time {
            font-size: 14px;
            color: #8d98b0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis; 
            width: 100px; 
          }

          .alarm-item-left-content-status {
            font-size: 14px;
            color: #8d98b0;
            margin-left: 24px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
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
}
.more {
  color:#93AADB;
  font-size: 14px;
  text-align: right;
  margin:0 4px;
  cursor: pointer;
}
</style>