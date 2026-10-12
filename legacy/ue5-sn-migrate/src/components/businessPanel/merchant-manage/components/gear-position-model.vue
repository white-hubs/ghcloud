<template>
  <div class="gear-model">
    <Modal @cancel="gearClose"  @close="gearClose" :title="title" :show="showModal">
      <div class="gear-box">
        <div class="flex-between head">
          <div>名称</div>
          <div>管理部门</div>
          <div>创建时间</div>
          <div>操作</div>
        </div>
        <div v-for="item in dataSource" class="flex-between itemData">
          <div>{{ item.name }}</div>
          <div>{{ item.deptName }}</div>
          <div>{{ item.createTime }}</div>
          <div class="details-box" @click="details(item)">详情</div>
        </div>
      </div>
    </Modal>
  </div>
  <gearDetailsModel :id="gearId" :show="showGear" @close="showGear=false"></gearDetailsModel>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import Modal from "../../../../components/modal-table/modal.vue";
import {UeClient} from "@ghcloud/cube-visual-sdk";
import gearDetailsModel from "./gear-details-model.vue"
const ueClient = UeClient.getInstance();
interface Props {
  title:string,
  showModal:boolean,
  dataSource:any
}
const emit = defineEmits(["close","ok"]);
const props = withDefaults(defineProps<Props>(),{
  title:'档位记录',
  showModal:false,
  dataSource:[]
})
const gearId = ref()
const showGear = ref(false)
const details = async(item)=>{
    ueClient.send('focusActor', {id: item.bimId});
    gearId.value = item.id
    showGear.value = true
    gearClose()
}

const gearClose = ()=>{
  emit('close')
}
</script>
<style lang="less" scoped>
.gear-box {
  color: #fff;

  .head {
    margin: 20px 0;

    div {
      width: 25%;
      text-align: center;
    }
  }

  .itemData {
    margin-bottom: 10px;

    div {
      width: 25%;
      text-align: center;
    }

    .details-box {
      cursor: pointer;
      color: cornflowerblue;
    }
  }
}
</style>
<style>
.modal-width{
  width: 800px !important;
}
</style>