<template>
  <Modal :title="title" :show="showModal">
    <div class="modal-layout">
      <div class="top">
        <div class="top_left">
          <div class="title">
            <div>占地面积</div>
            <div>楼栋数量</div>
            <div>商户数量</div>
          </div>
          <div class="title">
            <div class="pf">202350㎡</div>
            <div><span class="num">10</span> 栋</div>
            <div><span class="num">10</span> 栋</div>
          </div>
          <div>
          </div>
        </div>
        <div class="top_right">
          <div>
            <div><shop-outlined />档位: 100个</div>
            <div><snippets-outlined />档位: 100个</div>

          </div>
          <div>
            <div>已租: 90</div>
            <div>在线: 23</div>

          </div>
          <div>
            <div>未租: 100</div>
            <div>离线: 33</div>

          </div>
        </div>
      </div>
      <div class="content">
        <Tabs v-model:activeKey="activeKey">
          <TabPane key="1" tab="蔬菜区(6)">
            <div class="content_detail" v-for="item in dataSource">
              <div class="left">
                蔬菜区0
              </div>
              <div class="right">
         
                <div class="top_right">
                  <div>
                    <div>占地: 200㎡</div>
                    <div>商户: 10户</div>

                  </div>
                  <div>
                    <div><shop-outlined />档位: 100个</div>
                    <div><snippets-outlined />档位: 100个</div>

                  </div>
                  <div>
                    <div>已租: 90</div>
                    <div>在线: 23</div>

                  </div>
                  <div>
                    <div>未租: 100</div>
                    <div>离线: 33</div>

                  </div>
                </div>
              </div>

            </div>
      

          </TabPane>
          <TabPane key="2" tab="办公区(3)">
            <div class="content_detail" v-for="item in dataSource">
              <div class="left">
                办公区0
              </div>
              <div class="right">
         
                <div class="top_right">
                  <div>
                    <div>占地: 200㎡</div>
                    <div>商户: 10户</div>

                  </div>
                  <div>
                    <div><shop-outlined />档位: 100个</div>
                    <div><snippets-outlined />档位: 100个</div>

                  </div>
                  <div>
                    <div>已租: 90</div>
                    <div>在线: 23</div>

                  </div>
                  <div>
                    <div>未租: 100</div>
                    <div>离线: 33</div>

                  </div>
                </div>
              </div>

            </div>
          </TabPane>
          <TabPane key="3" tab="停车区(3)">
            <div class="content_detail" v-for="item in dataSource">
              <div class="left">
                停车区0
              </div>
              <div class="right">
         
                <div class="top_right">
                  <div>
                    <div>占地: 200㎡</div>
                    <div>商户: 10户</div>

                  </div>
                  <div>
                    <div><shop-outlined />档位: 100个</div>
                    <div><snippets-outlined />档位: 100个</div>

                  </div>
                  <div>
                    <div>已租: 90</div>
                    <div>在线: 23</div>

                  </div>
                  <div>
                    <div>未租: 100</div>
                    <div>离线: 33</div>

                  </div>
                </div>
              </div>

            </div>
          </TabPane>
        </Tabs>
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
import {ShopOutlined,SnippetsOutlined} from '@ant-design/icons-vue'
const UE5_SN_MEAT_IMG = '/resource/v1/ue5-sn-migrate/components/businessPanel/meat-trading/img'
const qua_blue = `${UE5_SN_MEAT_IMG}/qwa_blue.png`
const qua_yellow = `${UE5_SN_MEAT_IMG}/qua_yellow.png`
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

  .top_right {
    width: 49%;
    display: flex;
    justify-content: space-between;

    div {

      color: #fff;
      font-size: 18px
    }
  }

  .top_left {
    width: 49%;

    .title {

      display: flex;
      color: #FFFFFF;


      justify-content: space-between;

      .num {
        font-size: 24px;
        font-weight: 400;
        color: #2989FF;
      }

      .pf {
        font-size: 24px;
      }
    }
  }

}

.content {
  width: 100%;

  .content_detail {
    margin-top: 10px;
    display: flex;
    align-items: center;
    padding: 0 15px;
    height: 80px;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0px 1px 0px 0px rgba(108, 128, 151, 0.5);
    border-radius: 0px 0px 0px 0px;
    opacity: 1;

    .left {
      width: 50%;
      color: #fff;
      font-size: 18px;
    }

    .right {
      display: flex;
      justify-content: space-between;
      width: 50%;
    }

  

    .top_right {
      width: 100%;
      display: flex;
      justify-content: space-between;

      div {

        color: #fff;
        font-size: 18px
      }
    }
  }
}

:deep(.ant-tabs-tab-btn) {
  color: #fff
}
</style>