<template>
  <div>
    <a-form ref="searchFormRef" id="searchForm" :model="state.searchForm" layout="inline">
      <a-form-item label="">
        <a-select allowClear ref="select" placeholder="监管部门" v-model:value="state.searchForm.depId"
          style="width: 100px">
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
    <a-table :loading="tableLoading" rowKey="id" :scroll="{y:400}" :dataSource="dataSource" :columns="columns"
      :rowSelection="{ selectedRowKeys: selectedKeys, onChange: onChange,onSelect:onSelect,onSelectAll:onSelectAll }"
      :pagination="false" />
    <a-pagination style="text-align: right; margin-top: 10px" :default-current="1" :pageSizeOptions="['10','50','100','500']"
      :total="state.searchForm.total" @change="getData" @showSizeChange="getData"
      v-model:pageSize="state.searchForm.pageSize" v-model:current="state.searchForm.pageNumber" showSizeChanger
      :show-total="() => `共 ${state.searchForm.total} 条数据`"></a-pagination>
  </div>
</template>

<script setup>
import {
  ref, reactive, onMounted, getCurrentInstance, computed, unref,watch
} from 'vue'
import { cubeDeviceCenterService } from "@/api/service";
import { timeFormat } from "@/utils/common";

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
    depId: undefined,
    keyword: undefined,
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
    title: '工程编号',
    align: 'center',
    dataIndex: 'projectNum',
  }, {
    title: '小散工程名称',
    dataIndex: 'projectName',
    align: 'center'
  }, {
    title: '乙方',
    dataIndex: 'partyB',
    align: 'center',
  }, {
    title: '完成时限',
    dataIndex: 'completionTime',
    align: 'center',
  }, {
    title: '监管部门',
    dataIndex: 'depName',
    align: 'center',
  }, {
    title: '监管负责人',
    dataIndex: 'superviseUserName',
    align: 'center',
  }, {
    title: '工程状态',
    dataIndex: 'status',
    align: 'center',
  }, {
    title: '完成进度情况',
    dataIndex: 'schedule',
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
const getDeptList = () => {
  proxy.$api.deptList().then((res) => {
    state.deptCenter = res
  });
}
const getData = async () => {
  const params = {
    ...state.searchForm,
    status: 'UNDERWAY',
    total:undefined
  }
  tableLoading.value = true
  proxy.$api.projectList(params).then(res => {
    state.searchForm.total = res.total
    dataSource.value = res.records.map(e=>{
      return {
        ...e,
        completionTime: timeFormat(e.completionTime)
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
watch(() => props.propSelectedKeys, (val) => {
  selectedKeys.value = props.propSelectedKeys.length ? JSON.parse(JSON.stringify(props.propSelectedKeys)) : []
  selectedItems.value = props.propSelectedItems.length ? JSON.parse(JSON.stringify(props.propSelectedItems)) : []
})
onMounted(async () => {
  await getDeptList()
  await getData()
})
const getSelectedData = () => {
  return {
    selectedItems: selectedItems.value,
    selectedKeys: selectedKeys.value
  }
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