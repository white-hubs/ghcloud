<template>
    <NotificationBox :noticeArr="noticeData"></NotificationBox>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import {cubeAnnouncementService} from '@/api/service'
import  NotificationBox from "./components/notification-box.vue";
const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '楼栋简介'
})
const noticeData = ref<any>(
  {
    title:'',
    levelName:'',
    typeName:'',
    noticeTime:'',
  }
)
const getData = async() => {
 const res = await cubeAnnouncementService.listAnnouncement({
      pageNumber: 1,
      pageSize: 10,
      status: 'DISPLAY',
    })
 const noticeArr = res.records.filter(e=>{
    return e.firstType === 'ANNOUNCEMENT'
  })
  noticeData.value = noticeArr[0]??null
}
onMounted(()=>{
  getData()
})
</script>
<style lang="less" scoped>

</style>