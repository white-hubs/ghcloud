<template>
  <div class="ue-modal-control" :class="{show:initStatus}">
    <a-button class="item" @click="up">
      <UpOutlined />
    </a-button>
    <a-button class="item" @click="down">
      <DownOutlined />
    </a-button>
  </div>
</template>
<script setup lang="ts">
import { UeClient } from '@ghcloud/cube-visual-sdk';
import { onMounted, ref } from 'vue';
import { DownOutlined,UpOutlined } from '@ant-design/icons-vue';
const ueClient = UeClient.getInstance();
const initStatus = ref(false)
onMounted(()=>{
  setTimeout(() => {
    initStatus.value = true
  }, 0);
})
function up(){
  ueClient.send('floorUp')
}
function down(){
  ueClient.send('floorDown')
}
</script>
<style scoped lang="less">
.ue-modal-control {
  position: fixed;
  right: 30px;
  top: 50%;
  transform: translate(150px, -50%);
  transition: all 1s ease-in-out;

  .item {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30px;
    background-color: rgba(6, 6, 6, 0.7);
    margin-bottom: 30px;
    color: #FFFFFF;
    user-select: none;
    .anticon{
      transform: scale(1.5);
    }
  }
}

.show {
  transform: translate(0, -50%) !important;
}
</style>