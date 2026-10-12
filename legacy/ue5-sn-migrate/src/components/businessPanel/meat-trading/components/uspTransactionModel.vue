<template>
  <Modal :title="title" :show="showModal">
    <div class="model-title">
      <span class="model-title-left">白条交易大厅</span>
      <span class="model-title-middle">详细地址信息</span>
      <span class="model-title-right">在线</span>
    </div>
    <div class="model-column">
      <div class="model-column-drop"></div>
      <div class="model-column-name">基本信息</div>
    </div>
    <div class="transaction-info">
      <div class="transaction-info-data">
        <span>设备名称：</span>
        <span>设备01</span>
      </div>
      <div class="transaction-info-data">
        <span>设备编码：</span>
        <span>45189573</span>
      </div>
      <div class="transaction-info-data">
        <span>品牌型号：</span>
        <span>—</span>
      </div>
      <div class="transaction-info-data">
        <span>设备类型：</span>
        <span>消防栓</span>
      </div>
      <div class="transaction-info-data">
        <span>运维部门：</span>
        <span>成都白家市场</span>
      </div>
      <div class="transaction-info-data">
        <span>安装时间：</span>
        <span>2022-03-25 13:23:34</span>
      </div>
      <div class="transaction-info-data">
        <span>过期时间：</span>
        <span>2022-03-25 13:23:34</span>
      </div>
    </div>
    <div class="model-column">
      <div class="model-column-drop"></div>
      <div class="model-column-name">设备数据</div>
    </div>
    <div class="device-data-list">
      <div class="device-data-box" v-for="item in [0,0,0,0,0]">
        <div class="device-data-title">电池参数</div>
        <div class="flex">
          <div class="device-data-name">电压</div>
          <div>240.0V</div>
          <div>240.0V</div>
          <div>240.0V</div>
        </div>
        <div class="flex">
          <div class="device-data-name">电压</div>
          <div>24A</div>
          <div>24A</div>
          <div>24A</div>
        </div>
        <div class="flex">
          <span>温度</span>
          <span>20℃</span>
        </div>
        <div class="flex">
          <span>后备时间</span>
          <span>100分钟</span>
        </div>
        <div class="flex">
          <div >电流容量 &nbsp;</div>
          <a-progress :percent="30" stroke-linecap="square" />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted} from 'vue'
import Modal from "../../../../components/modal-table/modal.vue";
interface Props {
  title:string,
  showModal:boolean,
}
const props = withDefaults(defineProps<Props>(),{
  title:'UPS',
  showModal:false,
})
</script>
<style scoped lang="less">
.model-title {
  font-size: 14px;
  color: #fff;

  span {
    margin-right: 10px;
  }

  .model-title-left {
    font-size: 16px;
  }

  .model-title-right {
    color: #2989FF;
  }
}

.model-column {
  height: 20px;
  background: rgba(41, 137, 255, 0.2);
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 14px;
  padding-left: 10px;
  margin: 18px 0;

  .model-column-drop {
    margin-right: 5px;
    width: 4px;
    height: 4px;
    background: #FFAB10;
    border-radius: 50%;
  }
}

.transaction-info {
  color: #fff;
  display: flex;

  .transaction-info-data {
    margin-right: 30px;
  }
}

.device-data-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  .device-data-box {
    white-space:nowrap;
    padding: 10px 12px;
    width: 222px;
    height: 162px;
    background: rgba(238, 241, 247, 0.1);
    border: 1px solid rgba(41, 137, 255, 0.2);
    font-size: 12px;
    color: #fff;

    .device-data-title {
      color: #3F90F7;
      font-size: 12px;
    }

    .device-data-name {
      margin-top: 10px;
      width: 32px;
      height: 17px;
      background: #FF5400;
      text-align: center;
      line-height: 17px;
    }
  }
}

.flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep(.ant-progress-text) {
  color: #fff;
}
</style>