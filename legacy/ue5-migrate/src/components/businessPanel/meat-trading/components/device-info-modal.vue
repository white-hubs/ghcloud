<template>
  <Modal :title="title" :show="showModal">
    <div class="modal-layout">
      <div class="top">
        <div class="top_content">
          <div><span style="font-size:18px">白条交易大厅</span>  <span> 详细地址信息</span>
          <Tag color="#58FAB6">在线</Tag></div>
       
        </div>
      </div>
      <div class="content">
       <div class="info">基本信息</div>
       <div class="content_info">
       <div>
       <div>设备名称: <span>设备01</span></div>
       <div>所属区域: <span>成都白家市场</span></div>
       <div>过期时间: <span>2022-03-2513:23:34</span></div>
       </div>
       <div>
       <div>设备编码: <span>45189573</span></div>
       <div>所属区域: <span>成都白家市场</span></div>
    
       </div>
       <div>
       <div>品牌型号: <span>--</span></div>
    
       <div>安装时间： <span>2022-03-2513:23:34</span></div>
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
import {Tag} from 'ant-design-vue'
import { onMounted, ref } from "vue";
import {CaretUpOutlined} from '@ant-design/icons-vue'
const UE5_MEAT_IMG = '/resource/v1/ue5-migrate/components/businessPanel/meat-trading/img'
const qua_blue = `${UE5_MEAT_IMG}/qwa_blue.png`
const qua_yellow = `${UE5_MEAT_IMG}/qua_yellow.png`
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
onMounted(() => {
  getTableData()
})
</script>

<style lang="less" scoped>
.top {
  display: flex;
  justify-content: space-between;

  .top_content {
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    height: 52px;
    display: flex;
    justify-content: space-between;
    line-height: 52px;
    padding: 0 16px;
    box-sizing: border-box;

    div {

      color: #fff;
    }

  
  }
}

.content {
.info{
  color: #fff;
  font-size: 18px;
  background: rgba(41,137,255,0.2);

}
.content_info{
color: #fff;
display: flex;
justify-content: space-between;
div{
margin-top: 10px;
font-size: 18px;
color: #D0DEEE;
span{
font-size: 16px;
color: #fff;
} 
}

}
}

:deep(.ant-tabs-tab-btn) {
  color: #fff
}</style>