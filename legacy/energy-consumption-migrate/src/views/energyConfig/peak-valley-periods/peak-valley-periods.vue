
<template>
  <div style="margin-bottom: 20px;">
    <GLayout title="峰平谷设置">
      <template #content-data>
        <div style="height: calc(100vh - 200px);overflow:auto">
          <div class="period-of-time">
            <div>峰时段：<a style="margin-left: 10px;" @click="add('peak')">添加+</a></div>
            <div v-if="peakList.length>0">
              <div v-for="(item,index) in peakList" class="itemTime">
                <TimePicker v-model:value="item.start" format="HH:mm:ss" valueFormat="HH:mm:ss"/>到  
                <TimePicker v-model:value="item.end" format="HH:mm:ss" valueFormat="HH:mm:ss"/>
                <a style="margin-left: 10px;" @click="deleteItem('peak',index)">删除</a>
              </div>
            </div>
          </div>
          <div class="period-of-time">
            <div>平时段：<a style="margin-left: 10px;" @click="add('flat')">添加+</a></div>
            <div v-if="flatList.length>0">
              <div v-for="(item,index) in flatList" class="itemTime">
              <TimePicker v-model:value="item.start" format="HH:mm:ss" valueFormat="HH:mm:ss"/> 到 
              <TimePicker v-model:value="item.end" format="HH:mm:ss" valueFormat="HH:mm:ss"/>
              <a style="margin-left: 10px;" @click="deleteItem('flat',index)">删除</a>
            </div>
            </div>
          </div>
          <div class="period-of-time">
            <div>谷时段：<a style="margin-left: 10px;" @click="add('valley')">添加+</a></div>
            <div v-if="valleyList.length>0">
              <div v-for="(item,index) in valleyList" class="itemTime">
                <TimePicker v-model:value="item.start" format="HH:mm:ss" valueFormat="HH:mm:ss"/> 到 
                <TimePicker v-model:value="item.end" format="HH:mm:ss" valueFormat="HH:mm:ss"/>
                <a style="margin-left: 10px;" @click="deleteItem('valley',index)">删除</a>
              </div>
            </div>
          </div>
          <div class="period-of-time">
            <div>尖时段：<a style="margin-left: 10px;" @click="add('pointed')">添加+</a></div>
            <div v-if="pointedList.length>0">
              <div v-for="(item,index) in pointedList" class="itemTime">
                <TimePicker v-model:value="item.start" format="HH:mm:ss" valueFormat="HH:mm:ss"/> 到 
                <TimePicker v-model:value="item.end" format="HH:mm:ss" valueFormat="HH:mm:ss"/>
                <a style="margin-left: 10px;" @click="deleteItem('pointed',index)">删除</a>
              </div>
            </div>
          </div>
          <Button type="primary" @click="save">保存</Button>
          <Button style="margin-left: 10px;" @click="initialization">回到初始化</Button>
        </div>
      </template>
    </GLayout> 
  </div>
</template>
<script setup lang="ts">
import { 
  EnergyCollectPeriodItype,
   PeakValleyPeriods } from "@/api/energyOverview";
import GLayout from "@/components/common/gLayout.vue";
import { message } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
onMounted(()=>{
  EnergyCollectPeriodItype('default').then(res=>{
    const data=res.data
    peakList.value=data.filter((x: { code: string })=>x.code==='FV').map((x: { startTime: any; endTime: any })=>{
      return {start:x.startTime,end:x.endTime}
    })
    flatList.value=data.filter((x: { code: string })=>x.code==='PV').map((x: { startTime: any; endTime: any })=>{
      return {start:x.startTime,end:x.endTime}
    })
    valleyList.value=data.filter((x: { code: string })=>x.code==='GV').map((x: { startTime: any; endTime: any })=>{
      return {start:x.startTime,end:x.endTime}
    })
    pointedList.value=data.filter((x: { code: string })=>x.code==='JV').map((x: { startTime: any; endTime: any })=>{
      return {start:x.startTime,end:x.endTime}
    })
  })
})
const peakList=ref<any[]>([])
const flatList=ref<any[]>([])
const valleyList=ref<any[]>([])
const pointedList=ref<any[]>([])
//添加
const add=(type:string)=>{
  switch(type){
    case 'peak':
      peakList.value.push({start:'',end:''})
    break
    case 'flat':
      flatList.value.push({start:'',end:''})
    break
    case 'valley':
      valleyList.value.push({start:'',end:''})
    break
    case 'pointed':
      pointedList.value.push({start:'',end:''})
    break
  }
}
//删除 
const deleteItem=(type:string,index:number)=>{
  switch(type){
    case 'peak':
      peakList.value.splice(index,1)
    break
    case 'flat':
      flatList.value.splice(index,1)
    break
    case 'valley':
      valleyList.value.splice(index,1)
    break
    case 'pointed':
      pointedList.value.splice(index,1)
    break
  }
  
}
//保存
const save=async()=>{
  const peakPeriods=peakList.value.map((x,index)=>{
    return{
        code:'FV',
        startTime:x.start,
        endTime:x.end,
        sort:2+index*0.1
    }
  })
  const flatPeriods=flatList.value.map((x,index)=>{
    return{
        code:'PV',
        startTime:x.start,
        endTime:x.end,
        sort:3+index*0.1
    }
  })
  const valleyPeriods=valleyList.value.map((x,index)=>{
    return{
        code:'GV',
        startTime:x.start,
        endTime:x.end,
        sort:4+index*0.1
    }
  })
  const pointedPeriods=pointedList.value.map((x,index)=>{
    return{
        code:'JV',
        startTime:x.start,
        endTime:x.end,
        sort:1+index*0.1
    }
  })
  const query={
    instrumentType:'default',
    dataList:[...peakPeriods,...flatPeriods,...valleyPeriods,...pointedPeriods]
  }
  await PeakValleyPeriods(query)
  message.success('操作成功')
}
//回到初始化
const initialization=async()=>{
  const query={
    instrumentType:'default',
    dataList:[
      {
        code:'FV',
        startTime:'07:00:00',
        endTime:'22:59:00',
        sort:2
      },
      {
        code:'PV',
        startTime:'23:00:00',
        endTime:'06:59:00',
        sort:3
      },
      {
        code:'GV',
        startTime:'',
        endTime:'',
        sort:4
      },
      {
        code:'JV',
        startTime:'',
        endTime:'',
        sort:1
      }
    ]
  }
  await PeakValleyPeriods(query)
  peakList.value=[{start:'07:00:00',end:'22:59:00'}]
  flatList.value=[{start:'23:00:00',end:'06:59:00'}]
  valleyList.value=[{start:'',end:''}]
  pointedList.value=[{start:'',end:''}]
  message.success('操作成功')
}
</script>
<style lang="less" scoped>
.period-of-time{
  div{display:flex;flex-wrap: wrap; }
  margin: 10px;
  .itemTime{
    display: flex;
    margin: 10px;
    align-items: center;}
}
</style>