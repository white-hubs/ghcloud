<template>
  <div class="panel">
    <SubPanelTemplate title="设备数据" class="device_panel">
      <div class="device_list">
        <div class="header flex-between">
          <div class="table-th" v-for="(td, index) in column" :key="index" :style="styleItem(td)">
            {{ td.title }}
          </div>
        </div>
        <div class="device_item">
          <template v-for="(tr, index) in piniaRoamingDevices.roamingDevicesArr" :key="tr?.key || index">
            <div class="table-tr flex-between" >
              <div class="table-td" v-for="(td, j) in column" :key="index + '_' + j" :style="styleItem(td)">
                <template v-if="td.dataIndex === 'deviceStatus'">
                  <span v-show="tr[td.dataIndex] === 'NORMAL'" style="color: #58FAB6;">正常</span>
                  <span v-show="tr[td.dataIndex] === 'OFFLINE'" style="color: #D9E7FF;">离线</span>
                  <span v-show="tr[td.dataIndex] === 'TROUBLE'" style="color: #FFAB10">故障</span>
                  <span v-show="tr[td.dataIndex] === 'ALARM'" style="color: #F14545">报警</span>
                </template>
                <div style="color: #2989FF;justify-content: center;" v-else-if="td.dataIndex === 'operate'" class="flex-between">
                  <div @click="clickTableRow(tr)">
                    <profile-outlined />
                    <span>详情</span>
                  </div>
                </div>
                <span v-else>{{tr[td.dataIndex] }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
      <!-- <a-pagination class="pagination" @change="getData" v-model:current="deviceQuery.pageNumber"
        v-model:pageSize="deviceQuery.pageSize" :total="deviceQuery.total" show-less-items /> -->
     <Equ :id="equId" v-if="show" @close="closeModal" :isequ="true"></Equ>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, computed} from 'vue'
import Equ from "@/components/equipmentdetails/index.vue";
import SubPanelTemplate from '../public/subPanelTemplate.vue';
import { roamingDevices } from "@/piniaStore/roamingDevices";
import {UeClient} from "@ghcloud/cube-visual-sdk";
const ueClient = UeClient.getInstance();
import {
  ProfileOutlined,
} from '@ant-design/icons-vue';
const equId = ref("");
const show = ref(false);
const piniaRoamingDevices = roamingDevices();
const modal = reactive({
  visible:false,
  name:'设备名称',
  status:'NORMAL',
  code:'',
  areaName:''
})
const styleItem = computed(() => (item) => {
  let style = {};
  if (item?.width) {
    style = { ...style, width: item.width + "px" };
  }
  if (item?.align) {
    style = { ...style, textAlign: item.align };
  }
  return style;
});
const column = [
  {
    title:'设备名称',
    dataIndex:'name',
    width:100,
  },
  {
    title:'状态',
    dataIndex:'deviceStatus',
    width:100,
  },
  {
    title:'操作',
    dataIndex:'operate',
    width:90,
  },
]
const columnNum = computed(() => {
  return 100 / column.length;
});
const closeModal = () => {
  show.value = false;
  equId.value = ''
  piniaRoamingDevices.isRoaming = true
};
const clickTableRow = (data)=>{
  show.value = true;
  equId.value = data.id;
  piniaRoamingDevices.isRoaming = false
}
</script>
<style lang="less" scoped>
.device_list {
  margin-top: 10px;

  .header {
    padding: 0 10px;
    width: 100%;
    height: 30px;
    color: #ffffff;
    font-size: 14px;
    background: rgba(97, 148, 247, 0.20) // border: 1px solid rgba(86, 142, 255, 0.3);
  }
}

.device_item {
  cursor: pointer;
}

.table-tr {
  padding: 0 10px;
  background: rgb(83 82 82 / 15%);
  height: 35px;
  font-size: 12px;
  color: #d9e7ff;
  cursor: pointer;


  &:nth-child(2n) {
    background: transparent;
  }
}

.table-th,
.table-td {
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: calc(v-bind(columnNum) * 1%);
}

.device_panel {
  position: relative;
  height: 900px;

  .pagination {
    position: absolute;
    bottom: 0;
    right: 0;
  }
}

.alarmDetail-wrap {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: -10;
}

.alarmDetail-modal {
  width: 200px;
  position: fixed;
  top: 40%;
  left: 50%;
  z-index: 99999999;
  transform: translate(-50%, -50%);
  background: transparent;
  border-bottom: 2px solid rgba(41, 137, 255, 1);

  &.full {
    width: 100%;
    height: 100%;
  }

  .alarmDetail-modal-header {
    height: 26px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid rgba(41, 137, 255, 1);
    background-image: url('/resource/v1/ue5-sn-migrate/assets/images/modal-title.png');
    background-size: 100%95%;
    background-repeat: no-repeat;

    .header-title {
      font-size: 14px;
      font-weight: 400;
      color: #FFFFFF
    }

    .header-close {
      width: 24px;
      height: 24px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      span {
        font-size: 13px;
      }
    }
  }

  .alarmDetail-modal-content {
    max-height: 91px;
    width: 100%;
    padding: 0 16px;
    padding-bottom: 20px;
    overflow: hidden;
    background: rgba(1, 11, 23, 0.78);
    margin-top: 2px;

    .conent-body {
      min-height: 91px;
      font-size: 12px;
      color: #FFFFFF;
      line-height: 30px;

      :deep(.box .content) {
        margin-top: 15%;
      }

      .details {
        color: #2989FF;
        cursor: pointer;
      }
    }
  }
}
</style>