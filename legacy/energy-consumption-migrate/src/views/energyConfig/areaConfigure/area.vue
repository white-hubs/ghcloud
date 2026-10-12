<template>
  <GLayout title="区域配置">
    <template #header-btn>
      <Button type="primary" @click="openModel(null,'add')">新增区域</Button>
    </template>
    <template #content-table>
      能耗分类：<Select placeholder="请选择仪表类型" style="width: 180px" v-model:value="currentClassify"
        :options="classifyList" :field-names="{label: 'categoryName',value: 'categoryCode',}" @change="changeClassify"></Select>
        <Table :columns="columns" rowKey="id" :data-source="tableList" :pagination="false" :loading="spinning">
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'action'">
                <div>
                  <a v-if="record.level !== 3" @click="openModel(record,'add')">新增下级</a>
                  <a class="ml-10px" @click="openModel(record,'edit')">编辑</a>
                  <a class="ml-10px" @click="toDetail( record)">关联设备</a>
                  <Popconfirm
                    title="确定删除该区域？"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="deleteData(record)"
                  >
                    <a class="ml-10px color-red">删除</a>
                  </Popconfirm>
                </div>
              </template>
            </template>
          </Table>
    </template>
  </GLayout>
  <Modal v-model:visible="isVisible" @ok="submitArea" :title="addType">
    <Form ref="formRef" :model="areaForm" layout="inline" :rules="rules">
      <FormItem name="areaName" label="区域名称：" style="width: 100%;margin-bottom: 10px;">
        <Input v-model:value="areaForm.areaName" />
      </FormItem>
    </Form>
  </Modal>
</template>
<script setup lang="ts">
import GLayout from "@/components/common/gLayout.vue";
import { Popconfirm } from 'ant-design-vue/es';
import { Modal } from 'ant-design-vue';
import { onMounted, ref } from "vue";
import { reactive } from 'vue';
import { AreaProjectTree,AreaProjectAdd, EnergyCollectConfigList, AreaProjectUpdate, AreaProjectDelete } from "@/api/energyOverview";
import type { ColumnsType } from 'ant-design-vue/es/table/Table'
onMounted(async () => {
  let { data }= await EnergyCollectConfigList()
  classifyList.value=data
  getAreaTreeList(currentClassify.value)
});

//查询===========================================================================================================
const classifyList=ref()
const currentClassify=ref('electricity_meter')
const changeClassify=()=>{
  getAreaTreeList(currentClassify.value)
}
//表格================================================================================================================
const spinning=ref(true)
const tableList = ref([]);
const isVisible=ref(false)
const columns:ColumnsType<any> = [
  {
    title:'区域名称',
    dataIndex: "areaName",
    ellipsis: true,
    align:'center',
  },
  {
    dataIndex:'deviceNum',
    title:'关联设备数',
    ellipsis: true,
    align:'center',
  },
  {
    dataIndex: "action",
    title: "操作",
    ellipsis: true,
    align:'center',
  },
];
const getAreaTreeList = async (type: string) => {
  spinning.value=true
  const { data } = await AreaProjectTree({
    instrumentType: type,
  });
  spinning.value=false
  tableList.value = data.records == undefined ? data : data.records;
};
const deleteData = async(data: { id: string }) => {
  await AreaProjectDelete(data.id);
  getAreaTreeList(currentClassify.value);
};

//弹窗===================================================================================================================
const addType=ref('新增区域')
const areaForm=reactive({
  areaName:'',
  parentId:'',
  id:''
})
const formRef = ref();
const openModel = (record?:any,type?:string) => {
  formRef.value?.resetFields()
  isVisible.value=true
  if(!record){
    //新增区域 
    areaForm.parentId=''
    addType.value='新增区域'
  }
  if(record&&type==='edit'){
    //编辑
    addType.value='编辑下级'
    areaForm.areaName=record.areaName
    areaForm.parentId=record.parentId
    areaForm.id=record.id
  }
  if(record&&type==='add'){
    //新增下级
    addType.value='新增下级'
    areaForm.parentId=record.id
  }
};

const submitArea=()=>{
  formRef.value.validate().then(async() => {
    const obj={
      areaName:areaForm.areaName,
      instrumentType:currentClassify.value,
      energyProjectItemParams:null,
      parentId:areaForm.parentId,
      id:areaForm.id
    }
    if(addType.value==='编辑下级'){
      await AreaProjectUpdate(obj)
    }else{
       await AreaProjectAdd(obj)
    }
    getAreaTreeList(currentClassify.value);
    isVisible.value=false
  })
}
const rules = ref({
  areaName: [{ required: true, message: "请输入区域名称" }],
});

//关联设备=============================================================================================================================
const toDetail = ( record: { id: string,areaName:string }) => {
  history.pushState(
    {},
    "",
    `/portal/energy-consumption/associated-devices?&id=${record.id}&page=area&name=${record.areaName}`  );
};

</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
</style>
