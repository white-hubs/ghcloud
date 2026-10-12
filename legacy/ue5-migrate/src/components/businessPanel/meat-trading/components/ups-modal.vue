<template>
  <Modal :title="title" :show="showModal">
    <div class="modal-layout">
      <div class="top">
        <div :class="bstatus=='all'?'click button':'button'" @click="getlist('all')">全部(100)</div>
        <div :class="bstatus=='online'?'click button':'button'" class="button" @click="getlist('online')">在线(90)</div>
        <div :class="bstatus=='ontline'?'click button':'button'" class="button" @click="getlist('ontline')">离线(10)</div>
      </div>
      <div class="content">
        <div class="device" v-for="item in dataSource">
          <div class="top">
            <div>白条交易大厅</div>
            <div>地址</div>
          </div>
          <div class=" top bottom">
            <div>在线</div>
            <div>ups1</div>
          </div>
        </div>
      </div>


    </div>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "../../../../components/modal-table/modal.vue";
import tableData from './tableData.vue';
import type { TableColumnType } from 'ant-design-vue';
import {Tabs,TabPane,Table} from 'ant-design-vue'
import { onMounted, ref } from "vue";
import {CaretUpOutlined} from '@ant-design/icons-vue'

interface Props {
  title:string,
  showModal:boolean,

}
const activeKey=ref('1')
const dataSource=ref([{

t:"2022-07-23",
k:'15534.00'

},{

t:"2022-07-23",
k:'15534.00'

},{

t:"2022-07-23",
k:'15534.00'

},{

t:"2022-07-23",
k:'15534.00'

},{

t:"2022-07-23",
k:'15534.00'

}])
const columns=ref<TableColumnType[]>([
{
    title: '时间',
    dataIndex: 't',
    sorter: true,
   
  },
{
    title: '重量(kg)',
    dataIndex: 'k',
    sorter: true,
   
  },


])
const props = withDefaults(defineProps<Props>(),{
  title:'报警记录',
  showModal:false,

})


const getTableData = () =>{
  // props.requestData(selectForm.value.onSubmit())
}
const bstatus=ref<string>('all')
const getlist=(status:string)=>{
  bstatus.value=status
}
onMounted(() => {
  getTableData()
})
</script>

<style lang="less" scoped>
.top {
  display: flex;
  justify-content: space-between;
  width: 300px;



  .button {
    text-align: center;
    cursor: pointer;
    color: #fff;
    width: 96px;
    height: 23px;
    background: rgba(255, 255, 255, 0.1992);
    border-radius: 2px 2px 2px 2px;
    opacity: 1;
  }

  .click {
    background: #2989FF;
    border-radius: 2px 2px 2px 2px;
    border: 1px solid #2989FF;
  }
}

.content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  

  .device {
    margin-top: 10px;
    position: relative;
    width: 300px;
    height: 250px;
    background-color: #000000;
    border-radius: 0px 0px 0px 0px;
    opacity: 1;

    .top , .bottom{
      position: absolute;
      padding: 0 5px;
      color: #fff;
      z-index: 999;
      width: 100%;
      height: 25px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 0px 0px 0px 0px;
    
    }
    .bottom{
    bottom: 0;}

  }
}

:deep(.ant-tabs-tab-btn) {
  color: #fff
}</style>