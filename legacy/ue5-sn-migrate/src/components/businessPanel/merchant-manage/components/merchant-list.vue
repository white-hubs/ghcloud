<template>
  <div class="merchant-box">
    <a-input @change="getData" placeholder="请输入商户名称" v-model:value="keyword" />
    <div class="flex-between merchant-title">
      <div>名称</div>
      <div>档位数</div>
      <div>操作</div>
    </div>
    <div class="merchant-list">
      <div v-for="item in merchantList" class="flex-between tableClass">
        <div>{{ item.name }}</div>
        <div>{{ item.spaces.length }}</div>
        <div class="details-box" @click="details(item)"><span>详情</span> </div>
      </div>
    </div>
  </div>
  <gearPositionModel @ok="showGear=true" :show-modal="showGear" @close="showGear=false" :data-source="currentItem">
  </gearPositionModel>
  <gearDetailsModel :show="showGearDetails" @close="showGearDetails=false" :id="gearId"></gearDetailsModel>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import { companiesPage } from "../../../../api/merchant";
import gearPositionModel from "./gear-position-model.vue"
import {UeClient} from "@ghcloud/cube-visual-sdk";
import gearDetailsModel from "./gear-details-model.vue"
const ueClient = UeClient.getInstance();

const keyword = ref('')
const merchantList = ref([])
const showGear = ref(false)
const showGearDetails = ref(false)
const currentItem = ref([])
const gearId = ref()
const getData = async()=>{
  let param = {
    pageSize: 1000,
    pageNum: 1,
    sort: 'sendTime,desc',
    orderby: 'sendTime,desc',
    search:keyword.value
  }
 let res = await companiesPage(param)
 merchantList.value = res.records
}
const details = (item)=>{
  if (item.spaces.length===0)return
  if (item.spaces.length===1) {
    ueClient.send('focusActor', {id: item.spaces[0].bimId});
    gearId.value = item.spaces[0].id
    showGearDetails.value = true
  }else{
    showGear.value = true
    currentItem.value = item.spaces
  }
}

onMounted(()=>{
  getData()
 
})
</script>
<style lang="less" scoped>
.details-box {
  cursor: pointer;
  color: cornflowerblue;
}

.merchant-title {
  font-size: 16px;
  color: #fff;
  height: 0.15625rem;
  color: #ffffff;
  background: rgba(97, 148, 247, 0.2);
  margin-top: 10px;
  div {
    width: 33%;
    text-align: center;
  }
}

.merchant-list {
  width: 100%;
  height: 260px;
  overflow-y: scroll;
  text-align: center;
  color: #fff;

  div {
    margin-top: 10px;
  }

  .tableClass {
    div {
      width: 33%;
    }
  }
}</style>