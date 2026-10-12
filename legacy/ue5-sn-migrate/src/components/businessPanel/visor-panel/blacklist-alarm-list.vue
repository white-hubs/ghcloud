<template>
  <SubPanelTemplate title="黑名单预警">
    <template #extra>
      <DateInlineForm v-model:modelValue="timeFrame" @search="getAlarmLevel"></DateInlineForm>
    </template>
    <vue3-seamless-scroll :list="listData" :step="0.5" hover :singleHeight="36">
      <div class="alarm-item" v-for="(item, index) in listData" :key="index" @click="openAlarmModal(item)">
       <div class="alarm-item-left">
         <a-image  :src="item.pictures??getAssetsImage('overView45.png')"></a-image>
       </div>
        <div class="alarm-item-right">
          <div class="alarm-item-name alarm-item-row">
            <div>{{ item.businessSnapshot.name || '--' }}</div>
            <div>{{ item.alarmTime }}</div>
          </div>
          <div class="alarm-item-row">性别：{{ item.businessSnapshot.sex || '--' }}</div>
          <div class="alarm-item-row">联系方式：{{ item.businessSnapshot.phone }}</div>
        </div>
      </div>
    </vue3-seamless-scroll>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import { alarmrecords } from '@/api/alarm'
import usrCommon from "@/components/hooks/useCommon";
import moment from 'moment'
import bus from '@/utils/bus'
  import { getAssetsImage } from "@/utils/getImage";
import { cubeFileService } from "@/api/service";

const {
  piniaStoreArea,
  piniaStoreMenu,
} = usrCommon();
const timeFrame = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const listData = ref([]);

const getAlarmLevel = async ()=>{
  let params = {
    applicationCode: 'VISITOR_MANAGEMENT',
    period:timeFrame.value.dateRange.join(","),
    pageSize: 50,
    pageNumber: 1,
  };
  let res: any = await alarmrecords(params);
  listData.value = res.records.map((item) => {
    return {
      ...item,
      alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
      businessSnapshot:item.businessSnapshot?JSON.parse(item.businessSnapshot):item.businessSnapshot
    };
  });
  for (let i = 0; i < listData.value.length; i++) {
    if (listData.value[i].businessSnapshot?.pictures) {
      const id = listData.value[i].businessSnapshot?.pictures.split(",")[0]
      const res = await cubeFileService.getFileInfo(id)
      listData.value[i].pictures = res.path
}
  }
  
}
const openAlarmModal = (item) => {
  if (window.config.entry === 'views') {
    bus.emit("setOpenAlarmModal", {...item,hidePanel:true});
  }else{
    bus.emit("openAlarmModal", item);
  }
};
</script>
<style lang="less" scoped>
.alarm-item{
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 16px;
  color:#fff;
  justify-content: space-around;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  height: 100px;
  .alarm-item-left{
    width: 100px;
  }
  .alarm-item-right{
    width: 150px;
    .alarm-item-name{
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
    .alarm-item-row{
      margin-bottom: 5px;
    }
  }
}

</style>