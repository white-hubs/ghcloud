<template>
  <SubPanelTemplate title="通知公告">
    <RollTable :column="columns" :data="noticeArr" :showLength="8">
      <template #details="{record}">
        <span class="details-but" @click="openDetails(record)">详情</span>
      </template>  
    </RollTable>
    <NotificationModal :showModal="showModal" @close="showModal = false" :noticeData="noticeData"></NotificationModal>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "../public/rollTable/index.vue";
import {cubeAnnouncementService} from '@/api/service'
import NotificationModal from "./components/notification-modal.vue";

const columns = [
  {
    title: "公告时间",
    dataIndex: "noticeTime",
    width: 120,
  },
  {
    title: "公告标题",
    dataIndex: "title",
  },
  {
    title: "详情",
    dataIndex: "details",
    slots: {
      customRender: "details",
    },
  },
]
const noticeArr = ref<any>([]);
const showModal = ref(false);
const noticeData = ref({})
const openDetails = (value)=>{
  showModal.value = true
  noticeData.value = value
}
const getData = async() => {
 const res = await cubeAnnouncementService.listAnnouncement({
      pageNumber: 1,
      pageSize: 100,
      status: 'DISPLAY',
    })
  noticeArr.value = res.records.filter(e=>{
    return e.firstType === 'ANNOUNCEMENT'
  })
  
}
onMounted(()=>{
  getData()
})
</script>
<style lang="less" scoped>
.details-but{
  color: #2989FF;
  cursor: pointer;
}
</style>