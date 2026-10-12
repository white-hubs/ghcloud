<template>
  <div>
    <a-form ref="searchFormRef" id="searchForm" :model="state.searchForm" layout="inline">
      <a-form-item label="">
        <a-cascader v-model:value="state.searchForm.categoryCode" placeholder="类型" :options="state.deviceCenter" 
          change-on-select
          :show-search="{ filter }"
          />
      </a-form-item>
      <a-form-item label="">
        <a-cascader v-model:value="state.searchForm.anyMatchedAreaId" placeholder="区域" :options="state.areaCenter" />
      </a-form-item>
      <a-form-item label="">
        <a-select allowClear ref="select" placeholder="部门" v-model:value="state.searchForm.departmentId"
          style="width: 120px">
          <a-select-option v-for="item in state.deptCenter" :value="item.id">{{ item.name }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="">
        <a-input v-model:value="state.searchForm.keyword" placeholder="名称" />
      </a-form-item>
      <a-form-item label="">
        <a-button @click="reset">重置</a-button>
        <a-button type="primary" style="margin-left: 10px;" @click="getData">查询</a-button>
      </a-form-item>
    </a-form>
    <a-table :loading="loading" rowKey="id" :scroll="{y:400}" :dataSource="dataSource" :columns="columns"
      :rowSelection="{ selectedRowKeys: selectedKeys, onChange: onChange,onSelect:onSelect,onSelectAll:onSelectAll }"
      :pagination="false" >
      <template #onlineState="{ record }">
        <a-tag color="success" v-if="record.onlineState === '在线'">{{ record.onlineState }}</a-tag>
        <a-tag color="default" v-else>{{ record.onlineState }}</a-tag>
      </template>
    </a-table>
    <a-pagination style="text-align: right; margin-top: 10px" :default-current="1"
      :pageSizeOptions="['10','50','100','500']" :total="state.searchForm.total" @change="getData"
      @showSizeChange="getData" v-model:pageSize="state.searchForm.pageSize"
      v-model:current="state.searchForm.pageNumber" showSizeChanger
      :show-total="() => `共 ${state.searchForm.total} 条数据`"></a-pagination>
  </div>
</template>

<script setup>
import {
  ref, reactive, onMounted, getCurrentInstance, computed, unref, watch
} from 'vue'
import { cubeDeviceCenterService } from "@/api/service";

const props = defineProps({
  propSelectedKeys: {
    type: Array,
    required: true
  },
  propSelectedItems: {
    type: Array,
    required: true
  },
})
const { proxy } = getCurrentInstance();
const searchFormRef = ref();
const loading = ref(false)
const selectedItems = ref([]);
const state = reactive({
  searchForm: {
    categoryCode: '',
    anyMatchedAreaId: '',
    departmentId: null,
    keyword: '',
    pageNumber: 1,
    pageSize: 10,
    total: 0,
  },
  deviceCenter: [],
  areaCenter: [],
  deptCenter: [],
})

const dataSource = ref([])
const selectedKeys = ref([])
const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60,
    align: 'center',
  }, {
    title: '编码',
    dataIndex: 'code',
    key: 'code',
    align: 'center',
  }, {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    align: 'center',
  }, {
    title: '品类',
    dataIndex: 'productCategory',
    key: 'productCategory',
    align: 'center',
  }, {
    title: '所属部门',
    dataIndex: 'department',
    key: 'department',
    align: 'center',
  }, {
    title: '所属区域',
    dataIndex: 'pathName',
    key: 'pathName',
    align: 'center',
  }, {
    title: '状态',
    dataIndex: 'onlineState',
    key: 'onlineState',
    align: 'center',
    slots: { customRender: 'onlineState' },
  },
]

const onChange = (record) => {
  selectedKeys.value = record;
}
const onSelect = (record, selected) => {
  if (selected) {
    selectedItems.value.push(record);
  } else {
    selectedItems.value = selectedItems.value.filter(
      (item) => item.id !== record.id
    );
  }
}
const onSelectAll = (selected, selectedRows, changeRows) => {
  if (selected) {
    selectedItems.value = selectedItems.value.concat(changeRows);
  } else {
    const changeKeys = changeRows.map((item) => item.id);
    selectedItems.value = selectedItems.value.filter(
      (item) => !changeKeys.includes(item.id)
    );
  }
}
const changeId = (objAry, key, newkey) => {
  if (objAry != null) {
    objAry.forEach((item) => {
      Object.assign(item, {
        [newkey]: item[key],
      });
      // delete item[key];
      changeId(item.children, key, newkey);
    });
  }
}
const getEquipmentCategory = async () => {
  let res = await cubeDeviceCenterService.getIotProductCategoryTree()
  res = JSON.parse(JSON.stringify(res).replace(/"categoryName"/g, '"label"'))
  res = JSON.parse(JSON.stringify(res).replace(/"categoryCodeConcat"/g, '"value"'))
  state.deviceCenter = res
}
const getAreaList = () => {
  proxy.$api.getAreaList().then((res) => {
    state.areaCenter = JSON.parse(JSON.stringify(res).replace(/"name"/g, '"label"'))
    state.areaCenter = JSON.parse(JSON.stringify(res).replace(/"id"/g, '"value"'))
    changeId(state.areaCenter, "name", "label")
  });
}
const getDeptList = () => {
  proxy.$api.deptList().then((res) => {
    state.deptCenter = res
  });
}
const getData = async () => {
  const params = JSON.parse(JSON.stringify(state.searchForm))
  params.categoryCode = params.categoryCode ? params.categoryCode[params.categoryCode.length - 1] : ''
  loading.value = true
  const res = await cubeDeviceCenterService.getDeviceInstancePageAll(params)
  state.searchForm.total = res.total
  dataSource.value = res.records.map((item, index) => {
    return {
      ...item,
      index: index + 1,
      code: item.code,
      name: item.name,
      productCategory: item.productInfo?.productCategory?.name,
      department: item.department?.name,
      pathName: item.area?.pathName,
      onlineState: item.status.onlineState ? '在线' : '离线'
    }
  })
  loading.value = false
}
const reset = () => {
  Object.assign(state, {
    searchForm: {
      categoryCode: '',
      anyMatchedAreaId: '',
      departmentId: null,
      keyword: '',
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    },
  })
  getData()
}
watch(() => props.propSelectedKeys, (val) => {
  selectedKeys.value = props.propSelectedKeys.length ? JSON.parse(JSON.stringify(props.propSelectedKeys)) : []
  selectedItems.value = props.propSelectedItems.length ? JSON.parse(JSON.stringify(props.propSelectedItems)) : []
})
onMounted(async () => {
  await getDeptList()
  await getEquipmentCategory()
  await getAreaList()
})
const getSelectedData = () => {
  return {
    selectedItems: selectedItems.value,
    selectedKeys: selectedKeys.value
  }
}
const filter = (inputValue, path) => {
  return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
}
defineExpose({
  getData,
  reset,
  selectedItems: selectedItems.value,
  selectedKeys: selectedKeys.value,
  getSelectedData
})
</script>
<style lang="less" scoped>

</style>