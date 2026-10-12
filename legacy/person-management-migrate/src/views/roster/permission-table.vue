<template>
  <div class="wrapper">
    <div class="header">
      <div class="title">{{title}}权限</div>
      <a-button type="primary" @click="handleAdd">新增</a-button>
    </div>
    <a-table :columns="columns" :scroll="{ y: scrollY }" :dataSource="currentData" :pagination="false">
      <template #operate="{index}">
        <a-button type="link" @click="handleDelete(index)">删除</a-button>
      </template>
    </a-table>
    <a-pagination v-model:current="pagination.current" v-model:pageSize="pagination.pageSize" :total="pagination.total"
      :show-total="() => `共 ${pagination.total} 条 第${pagination.current}/${pagination.pages}页`"
      @change="pageChange" style="text-align: right;margin: 10px 0px;" />
    <association-modal v-if="searchAssociated.visible" :visible="searchAssociated.visible" :title="`${title}设备列表`"
      :type="type"
      :columns="columns"
      :searchForm="searchForm"
      :selected="permissionData"
      @close="closeModal">
    </association-modal>
  </div>
</template>
<script setup>
import { ref, reactive ,watch,onMounted} from 'vue';
import { message } from 'ant-design-vue';
import associationModal from './association-modal.vue';
const props = defineProps({
  title: "",
  type:'',
  columns: Array,
  dataSource: Array
});
const emits=defineEmits('update:dataSource')
const permissionData = ref([])
const currentData=ref([])
const scrollY=ref(200)
/*获取table高度*/
const getScrollY = () => {
  const layoutContentHeight = document.getElementsByClassName('layout-content')[0]
  const contentSearchHeight = document.getElementsByClassName('content-search')[0]
  scrollY.value = (layoutContentHeight.offsetHeight - contentSearchHeight.offsetHeight - 400)/2
}
onMounted(() => {
  getScrollY()
  window.onresize = () => {
    getScrollY()
  }
})
const pagination = reactive({
  total: 0,
  pages: 1,
  pageSize: 10,
  current: 1,
})
watch(()=>props.dataSource,()=>{
  permissionData.value=props.dataSource
  pagination.total = permissionData.value.length
  pagination.pages = Math.ceil(pagination.total / pagination.pageSize)
  currentData.value=props.dataSource.slice(0,10)
},{immediate:true,deep:true})

pagination.total = permissionData.value.length
pagination.pages = Math.ceil(pagination.total / pagination.pageSize)
const searchAssociated = reactive({
  visible: false,
  search: [
    {
      component: "span",
      value: "applicationCode",
      defaultValue: "SECURITY_MONITORING",
    }
  ],
  columns: [
    {
      dataIndex: "codea",
      title: "编码",
    },
    {
      dataIndex: "name",
      title: "设备名称",
    },
    {
      dataIndex: "genreName",
      title: "产品分类",
      customRender: ({ record }) => {
        return record.productInfo.productCategory.name;
      },
    },
    {
      dataIndex: "modelName",
      title: "设备型号",
      customRender: ({ record }) => {
        return record.productInfo.modelName;
      },
    },
    {
      dataIndex: "brandName",
      title: "设备品牌",
      customRender: ({ record }) => {
        return record.productInfo.brandName;
      },
    },
    {
      dataIndex: "areaName",
      title: "所属区域",
    },
  ]
})
const handleAdd = () => {
  searchAssociated.visible = true
}
const handleDelete = (index) => {
  permissionData.value.splice(index+((pagination.current-1)*10), 1)
  pagination.current = 1;
  pagination.total = permissionData.value.length
  pagination.pages = Math.ceil(pagination.total / pagination.pageSize)
  currentData.value = permissionData.value.slice(pagination.current * pagination.pageSize - pagination.pageSize, pagination.current * pagination.pageSize)
  emits('update:dataSource',permissionData.value)
}
const pageChange = (current, pageSize) => {
  pagination.current = current;
  pagination.pageSize = pageSize;
  pagination.pages = Math.ceil(pagination.total / pagination.pageSize)
  currentData.value = permissionData.value.slice(pagination.current * pagination.pageSize - pagination.pageSize, pagination.current * pagination.pageSize)
}
const closeModal = async (data) => {
  searchAssociated.visible = false;
  if (data.length === 0) return
  const ids = data.map((x) => x.id)
  const isExist = permissionData.value.length > 0 ? permissionData.value.some((x) => ids.some((i) => i === x.id)) : false
  if (isExist) {
    message.error("设备已存在");
    return
  }
  permissionData.value = permissionData.value.length > 0 ? [...permissionData.value,...data] : data;
  pagination.total = permissionData.value.length
  pagination.pages = Math.ceil(pagination.total / pagination.pageSize)
  emits('update:dataSource',permissionData.value)
};
</script>
<style lang="less" scoped>
.wrapper {
  margin-bottom: 10px;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  .title {
    font-size: 15px;
    font-weight: 500;
  }
}
</style>
