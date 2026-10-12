<template>
  <Modal :title="title" :show="showModal">
    <div class="modal-layout">
      <div class="top">
        <div class="top_content">
          <div>批次总数</div>
          <div style="font-size: 24px; color: #2989ff">
            {{ total }}<img :src="qua_blue" />
          </div>
        </div>
        <div class="top_content">
          <div>检疫不合格</div>
          <div style="font-size: 24px; color: #ffab10">
            {{ props.seven }}<img :src="qua_yellow" />
          </div>
        </div>
      </div>
      <Tabs v-model:activeKey="activeKey" @change="changetabs">
        <TabPane v-for="item in tabslist" :key="item.key" :tab="item.time">
          <tableData :dataSource="dataSource" :columns="columns"></tableData>
          <div style="margin-top:10px;text-align: right;">
            <Pagination v-model:current="tablparams.pageNumber" v-model:pageSize="tablparams.pageSize" show-size-changer
            :total="tablparams.total"  @showSizeChange="onShowSizeChange"></Pagination>
          </div>
        </TabPane>

      </Tabs>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "../../../../components/modal-table/modal.vue";
import {Pagination} from 'ant-design-vue';
import tableData from "./tableData.vue";
import type { TableColumnType } from "ant-design-vue";
import { Tabs, TabPane, Table } from "ant-design-vue";
import { onMounted, ref, watch } from "vue";
const UE5_MEAT_IMG = '/resource/v1/ue5-migrate/components/businessPanel/meat-trading/img'
const qua_blue = `${UE5_MEAT_IMG}/qwa_blue.png`
const qua_yellow = `${UE5_MEAT_IMG}/qua_yellow.png`
import { pratiqueregister, statdate } from "@/api/slide";
import { setTimeType } from "@/utils/common";
import { ModelValueItf } from "../../public/types";
import moment from "moment";
interface Props {
  title: string;
  total: number;
  type: ModelValueItf;
  seven: number;
  showModal: boolean;
}
const activeKey = ref(0);
const dataSource = ref([
  {
    name: "成农批",
  },
]);
const columns = ref<TableColumnType[]>([
  {
    title: "商家名称",
    dataIndex: "supplierName",
    sorter: true,
  },
  {
    title: "批次号",
    dataIndex: "porkReportCode",
    sorter: true,
  },
  {
    title: "理货片数",
    dataIndex: "slices",
    sorter: true,
  },
  {
    title: "检疫票数",
    dataIndex: "pratiqueTickets",
    sorter: true,
  },

  {
    title: "品类名称",
    dataIndex: "goodsCategoryName",
    sorter: true,
  },
  {
    title: "登记员",
    dataIndex: "registerName",
    sorter: true,
  },
]);
const props = withDefaults(defineProps<Props>(), {
  title: "报警记录",
  showModal: false,
});
const tablparams=ref({
  period:'',
  pageSize:10,
  pageNumber:1,
  total:0

})

const tabslist = ref([]);
const getTime = async () => {
  let data = await statdate({ type: setTimeType(props.type) });

  tabslist.value = [
    {
      key: 0,
      time:
        formaterTime(data.currentDate.begin) + "," + formaterTime(data.currentDate.end),
    },
    {
      key: 1,
      time: formaterTime(data.lastDate.begin) + "," + formaterTime(data.lastDate.end),
    },
  ];
  tablparams.value.period=formaterTime(data.currentDate.begin) + "," + formaterTime(data.currentDate.end)
  getlist()
  // props.requestData(selectForm.value.onSubmit())
};
const onShowSizeChange = (current: number, pageSize: number) => {
  tablparams.value.pageSize=pageSize
  tablparams.value.pageNumber=current
  getlist()
};
const getlist=async()=>{
  const pratiqueregisterdata=await   pratiqueregister(tablparams.value)
 dataSource.value=pratiqueregisterdata.records
 tablparams.value.total=pratiqueregisterdata.total
}
const formaterTime = (time) => {
  return moment(time).format("YYYY-MM-DD HH:mm:ss");
};
const changetabs=(n)=>{
  tablparams.value.period=tabslist.value[n].time
  getlist()

}
watch(
  () => props.showModal,
  (n) => {
    if (n) {
      getTime();
    }
  }
);
defineExpose({});
onMounted(() => {
  // getTableData()
});
</script>

<style lang="less" scoped>
.top {
  display: flex;
  justify-content: space-between;

  .top_content {
    width: 49%;
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

    img {
      margin-left: 10px;
    }
  }
}

:deep(.ant-tabs-tab-btn) {
  color: #fff;
}
</style>
