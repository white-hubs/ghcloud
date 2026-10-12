<template>
  <div>
    <a-form ref="searchFormRef" id="searchForm" :model="state.searchForm" layout="inline">
      <a-form-item label="">
        <a-cascader change-on-select v-model:value="state.searchForm.areaId" placeholder="区域" :options="state.areaCenter" />
      </a-form-item>
      <a-form-item label="">
        <a-select allowClear ref="select" placeholder="部门" v-model:value="state.searchForm.receiveDepId"
          style="width: 120px">
          <a-select-option v-for="item in state.deptCenter" :value="item.id">{{ item.name }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="">
        <a-select allowClear ref="select" placeholder="类型" v-model:value="state.searchForm.typeId"
          style="width: 120px">
          <a-select-option v-for="item in state.typeIds" :value="item.id">{{ item.name }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="">
        <a-button @click="reset">重置</a-button>
        <a-button type="primary" style="margin-left: 10px;" @click="getData">查询</a-button>
      </a-form-item>
    </a-form>
    <a-table :loading="loading" rowKey="id" :scroll="{y:400}" :dataSource="dataSource" :columns="columns"
      :rowSelection="{ selectedRowKeys: selectedKeys, onChange: onChange,onSelect:onSelect,onSelectAll:onSelectAll }"
      :pagination="false" >
      <template #riskData="{ record }">
        <a-popover placement="top" trigger="hover">
          <template #content>
            <span>{{ record.riskData.length ? record.riskData.map(e=>e.name).join(',') : '无' }}</span>
          </template>
          <span>
            {{ record.riskData.length ? record.riskData.map(e=>e.name).join(',') : '无'}}
          </span>
        </a-popover>
      </template>
    </a-table>
    <div class="bottom-operate">
      <a-checkbox v-model:checked="associationChecked">现场点关联的对象是否同步添加到巡检计划中</a-checkbox>
      <a-pagination style="text-align: right; margin-top: 10px" :default-current="1"
        :pageSizeOptions="['10','50','100','500']" :total="state.searchForm.total" @change="getData"
        @showSizeChange="getData" v-model:pageSize="state.searchForm.pageSize"
        v-model:current="state.searchForm.pageNumber" showSizeChanger
        :show-total="() => `共 ${state.searchForm.total} 条数据`"></a-pagination>
    </div>
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
const associationChecked = ref(false)
const state = reactive({
  searchForm: {
    areaId: [],
    typeId:'',
    receiveDepId: null,
    pointName: '',
    pageNumber: 1,
    pageSize: 10,
    total: 0,
  },
  areaCenter: [],
  deptCenter: [],
  typeIds:[]
})

const dataSource = ref([])
const selectedKeys = ref([])
const columns = [
  {
    title: '编码',
    dataIndex: 'codeNum',
    key: 'codeNum',
    align: 'center',
  }, {
    title: '现场点名称',
    dataIndex: 'name',
    key: 'name',
    align: 'center',
  }, {
    title: '类型',
    dataIndex: 'typeName',
    key: 'typeName',
    align: 'center',
  },  {
    title: '管理部门',
    dataIndex: 'depName',
    key: 'depName',
    align: 'center',
  }, {
    title: '所属区域',
    dataIndex: 'areaName',
    key: 'areaName',
    align: 'center',
  }, {
    title: '具体地址',
    dataIndex: 'location',
    key: 'location',
    align: 'center',
  }, {
    title: '关联对象',
    dataIndex: 'riskData',
    key: 'riskData',
    ellipsis: true,
    align: 'center',
    slots: { customRender: 'riskData' },
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

const getAreaList = () => {
  proxy.$api.getAreaList().then((res) => {
    state.areaCenter = JSON.parse(JSON.stringify(res).replace(/"name"/g, '"label"'))
    state.areaCenter = JSON.parse(JSON.stringify(res).replace(/"id"/g, '"value"'))
    changeId(state.areaCenter, "name", "label")
  });
}
const getDeptList = () => {
  proxy.$api.deptList({pageNumber: 1,pageSize: 999,}).then((res) => {
    state.deptCenter = res    
  });
}
const getTypeList = () => {
  proxy.$api.geiSiteTypeList({pageNumber: 1,pageSize: 999,}).then((res) => {
    state.typeIds = res
  });
}
const getData = async () => {
  const params = JSON.parse(JSON.stringify(state.searchForm))
  params.areaId = params.areaId[params.areaId.length - 1]
  loading.value = true
  dataSource.value = []
  const res = await proxy.$api.geiSitePointList(params)
  const ids = res.records.map(item => item.id)
  if (ids.length) {
    const data = await proxy.$api.stallPoint({printIdList:ids})
    for (const i in data) {
      data[i].forEach(e=>{
        e.targetParentId = i
      })
    }
    dataSource.value = res.records.map(item=>{
      return {
        ...item,
        riskData:data[item.id]||[]
      }
    })
  }
  state.searchForm.total = res.total
  loading.value = false
}
const reset = () => {
  Object.assign(state, {
    searchForm: {
      areaId: '',
      type: '',
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
},{ immediate: true, deep: true })

onMounted(async () => {
  await getDeptList()
  await getAreaList()
  await getTypeList()
})

const getSelectedData = () => {
  return {
    selectedItems: selectedItems.value,
    selectedKeys: selectedKeys.value,
    associationChecked:associationChecked.value
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
<style lang="less" scoped>
.bottom-operate{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>