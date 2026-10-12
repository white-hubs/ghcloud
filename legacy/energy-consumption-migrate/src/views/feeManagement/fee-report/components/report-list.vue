<template>
  <div>
    <div style="margin-bottom: 20px;">
      <Form layout="inline" :model="params">
        <FormItem label="选择日期">
          <RangePicker
          v-model:value="params.period"
          :placeholder="['开始时间', '结束时间']"
        />
        </FormItem>
        <FormItem>
          <Button  type="primary" @click="handleSearch">查询</Button>
          <Button style="margin-left: 10px;" @click="reset">重置</Button>
        </FormItem>
      </Form>
    </div>
    <div id="myTable">
      <Table :columns="listColumns" :data-source="tableList" :scroll="{y:scrollY }" :pagination="false" :loading="listLoading">
      </Table>
    </div>
    <Pagination 
      :total="params.total" 
      v-model:current="params.pageNumber" 
      v-model:pageSize="params.pageSize" 
      :show-total="(total: any) => `共 ${total} 条 第${params.pageNumber}/${params.pages}页`"
      show-size-changer 
      @change="tableChange" 
      style="margin-top: 10px;float: right;">
    </Pagination>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'
import { getEnergyReportElectricity, getEnergyReportOther, getEnergyReportTotal } from '@/api/feeManage'
const emit=defineEmits(['search'])
const scrollY = ref<number>(100)
const scrollHandle = () => {
  let tableHeight=0
  const clientHeight = document.querySelector('.layout-content')?.clientHeight
  if (clientHeight) {
    tableHeight = clientHeight -220
  }
  scrollY.value = tableHeight
}
onMounted(async()=>{
  // 设置表格滚动
  scrollHandle()
  window.addEventListener('resize', function () {
    scrollHandle()
  })
})
interface Props {
  activeKey:string;
  refresh?:boolean;
  columns?:{ title: string; dataIndex: string; ellipsis: boolean; customRender: ({ text }: { text: string; }) => string | null; }[]
}
const props = withDefaults(defineProps<Props>(), {
  activeKey:'classify',
  refresh:false
})
interface FeeResults {
  period: [Dayjs, Dayjs];
  total:number;
  pageSize:number;
  pages:number,
  pageNumber:number;
}
const params = reactive<FeeResults>({
  period: [dayjs().startOf('month'), dayjs()],
  total: 0,
  pages:1,
  pageSize: 10,
  pageNumber: 1,
});
const listLoading=ref(false)
const tableList = ref([{}]);
const listColumns = ref();
const tableChange = (current: number, pageSize: number) => {
  params.pageNumber = current;
  params.pageSize = pageSize;
  getTableList();
};
const getTableList = async () => {
  listLoading.value=true
  const timeArr=params.period?[params.period[0].startOf('days').format('YYYY-MM-DD HH:mm:ss'),params.period[1].endOf('days').format('YYYY-MM-DD HH:mm:ss')]:[]
  if(props.activeKey==='total'){
    const { data } = await getEnergyReportTotal({
      ...params,
      period:timeArr.join(',')??''
    });
    tableList.value = data.records;
    params.total=data.total
    params.pages=data.pages;
  }else if(props.activeKey==='electric'){
    const { data } = await getEnergyReportElectricity({
      ...params,
      period:timeArr.join(',')??''
    });
    tableList.value = data.records;
    params.total=data.total
    params.pages=data.pages;
  }else if(props.activeKey==='water'){
    const { data } = await getEnergyReportOther({
      ...params,
      instrumentTypeList:'water_meter',
      period:timeArr.join(',')??'',
    });
    tableList.value = data.records;
    params.total=data.total
    params.pages=data.pages;
  }else{
    const { data } = await getEnergyReportOther({
      ...params,
      instrumentTypeList:'gas_meter',
      period:timeArr.join(',')??''
    });
    tableList.value = data.records;
    params.total=data.total
    params.pages=data.pages;
  }
  emit('search',{period:timeArr.join(',')??'',tableLength:tableList.value.length})
  listLoading.value=false
};
const handleSearch=()=>{
  getTableList()
}
const reset=()=>{
  Object.assign(params,{
    period: undefined,
    total: 0,
    pageSize: 10,
    pageNumber: 1,
  })
  getTableList()
}
watch(()=>props.columns,()=>{
  listColumns.value=props.columns
  getTableList()
},{immediate:true,deep:true})
watch(()=>props.activeKey,()=>{
  getTableList()
})
watch(()=>props.refresh,()=>{
  getTableList()
})
</script>