<template>
  <div>
    <a-form ref="searchFormRef" id="searchForm" :model="state.searchForm" layout="inline">
      <a-form-item label="">
        <a-cascader v-model:value="state.searchForm.typeCode" placeholder="类型"
          :options="state.deviceCenter" 
          change-on-select
          :show-search="{ filter }"
          />
      </a-form-item>
      <a-form-item label="">
        <a-select allowClear ref="select" placeholder="维护部门" v-model:value="state.searchForm.maintenanceDepId"
          style="width: 100px">
          <a-select-option v-for="item in state.deptCenter" :value="item.id">{{ item.name }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="">
        <a-select allowClear ref="select" placeholder="使用部门" v-model:value="state.searchForm.receiveDepId"
          style="width: 100px">
          <a-select-option v-for="item in state.deptCenter" :value="item.id">{{ item.name }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="">
        <a-select allowClear ref="select" placeholder="状态" v-model:value="state.searchForm.status" style="width: 100px">
          <a-select-option v-for="item in statusList" :value="item.id">{{ item.name }}</a-select-option>
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
    <a-table :loading="tableLoading" rowKey="id" :scroll="{y:400}" :dataSource="dataSource" :columns="columns"
      :rowSelection="{ selectedRowKeys: selectedKeys, onChange: onChange,onSelect:onSelect,onSelectAll:onSelectAll }"
      :pagination="false" />
    <a-pagination style="text-align: right; margin-top: 10px" :default-current="1"  :pageSizeOptions="['10','50','100','500']"
      :total="state.searchForm.total" @change="getData" @showSizeChange="getData" v-model:pageSize="state.searchForm.pageSize"
      v-model:current="state.searchForm.pageNumber" showSizeChanger
      :show-total="() => `共 ${state.searchForm.total} 条数据`"></a-pagination>
  </div>
</template>

<script setup>
import {
  ref, reactive, onMounted, getCurrentInstance, computed, unref
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
const tableLoading = ref(true)
const selectedItems = ref([]);
const state = reactive({
  searchForm: {
    status: undefined,
    keyword: undefined,
    maintenanceDepId: undefined,
    receiveDepId: undefined,
    typeCode: [],
    pageNumber: 1,
    pageSize: 10,
    total: 0,
  },
  deviceCenter: [],
  deptCenter: [],
})
const statusList = ref([
  {
    id: 'EXPIRE',
    name: '已过期'
  },
  {
    id: 'NORMAL',
    name: '未过期'
  },
])
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
    title: '风险源编码',
    dataIndex: 'serialNumber',
    key: 'serialNumber',
    align: 'center',
  }, {
    title: '风险源名称',
    dataIndex: 'name',
    key: 'name',
    align: 'center',
  }, {
    title: '风险源分类',
    dataIndex: 'typeName',
    key: 'typeName',
    align: 'center',
  }, {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
  }, {
    title: '所属区域',
    dataIndex: 'areaName',
    key: 'areaName',
    align: 'center',
  }, {
    title: '维护部门',
    dataIndex: 'maintenanceDepName',
    key: 'maintenanceDepName',
    align: 'center',
  }, {
    title: '使用部门',
    dataIndex: 'receiveDepName',
    key: 'receiveDepName',
    align: 'center',
  }
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
  proxy.$api.getCascadeDictionaryItem({ itemCode: 'risk-source-type', pageNumber: 1, pageSize: 999 }).then((res) => {
    state.riskTreeOptions = res;
    state.spinning = false;
    res = JSON.parse(JSON.stringify(res).replace(/"name"/g, '"label"'))
    res = JSON.parse(JSON.stringify(res).replace(/"code"/g, '"value"'))
    res = JSON.parse(JSON.stringify(res).replace(/"nextList"/g, '"children"'))
    state.deviceCenter = res
  });
}
const getDeptList = () => {
  proxy.$api.deptList().then((res) => {
    state.deptCenter = res
  });
}
const getData = async () => {
  const params = {
    ...state.searchForm,
    typeCode: state.searchForm?.typeCode ? state.searchForm.typeCode[state.searchForm.typeCode.length - 1] : ''
  }
  tableLoading.value = true
  proxy.$api.sourceLedgerPage(params).then(res => {
    state.searchForm.total = res.total
    dataSource.value = res.records.map((e, i) => {
      return {
        ...e,
        status: e.status === 'EXPIRE' ? '已过期' : '未过期',
        index: i + 1,
        targetType:e.typeCode
      }
    })
    tableLoading.value = false
  }).catch(err => {
    tableLoading.value = false
  })
}
const reset = () => {
  Object.assign(state, {
    searchForm: {
      status: undefined,
      keyword: undefined,
      maintenanceDepId: undefined,
      receiveDepId: undefined,
      typeCode: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    },
  })
  getData()
}
onMounted(async () => {
  await getDeptList()
  await getEquipmentCategory()
  await getData()
  selectedKeys.value = props.propSelectedKeys.length ? JSON.parse(JSON.stringify(props.propSelectedKeys)) : []
  selectedItems.value = props.propSelectedItems.length ? JSON.parse(JSON.stringify(props.propSelectedItems)) : []
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
<style lang="less" scoped></style>