<template>
  <g-layout title="访问端角色配置">
    <template #content-search>
      <a-form layout="inline">
        <a-form-item>
          <a-input placeholder="角色名称查询" v-model:value="keyword" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="getTableData">查询</a-button>
        </a-form-item>
        <a-form-item>
          <a-button style="margin-left: 10px" @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
    </template>
    <template #content-table>
      <a-table :pagination="false" :dataSource="tableConfig.dataSource" :columns="tableConfig.columns"
        :loading="tableConfig.loading" record="id">
				<template #terminalName="{ text, record }">
          <a-popover :content="text">{{ text || '--' }}</a-popover>
				</template>
				<template #code="{ text, record }">
          <a-popover :content="text">{{ text || '--' }}</a-popover>
				</template>
				<template #alias="{ text, record }">
					<div>
						<a-input
							v-if="record['isEdit']"
							v-model:value="record['aliasNew']"
							style="margin: -5px 0"
							placeholder="请输入访问端别名"
              :maxlength="200"
              allowClear
						></a-input>
						<template v-else>
              <a-popover :content="text">{{ text || '--' }}</a-popover>
						</template>
					</div>
				</template>
				<template #defaultRole="{ text, record }">
					<div>
						<a-select
							v-if="record['isEdit']"
							v-model:value="record['defaultRoleNew']"
							style="margin: -5px 0; width: 100%;"
							placeholder="请选择默认角色"
              :options="roleList"
              allowClear
              :filter-option="false"
              show-search
              @search="handleRoleSearch"
						></a-select>
						<template v-else>
              <a-popover :content="record.defaultRoleName || '--'">{{ record.defaultRoleName || '--' }}</a-popover>
						</template>
					</div>
				</template>
        <template #operate="{record}">
          <span v-if="record['isEdit']">
            <a-space :size="16">
              <a @click.stop="saveRecord(record)">保存</a>
              <a @click="cancelRecord(record)">取消</a>
            </a-space>
          </span>
          <span v-else>
            <a-button type="link" @click="editRow(record)">编辑</a-button>
          </span>
        </template>
      </a-table>
    </template>
  </g-layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, h} from 'vue'
import { useRouter } from "vue-router";
import { type TableColumnType } from 'ant-design-vue'
import { debounce } from 'lodash-es';

const { proxy } = getCurrentInstance();
const router = useRouter();
const roleModaRef = ref<{ openModal: (id: string) => void; }>()
const tableConfig = reactive({
  columns:[
  {
    title: "访问端名称",
    dataIndex: "terminalName",
    width: '220px',
    slots: { customRender: 'terminalName' },
  },
  {
    title: "访问端编码",
    dataIndex: "code",
    width: '220px',
    slots: { customRender: 'code' },
  },
  {
    title: "访问端别名",
    dataIndex: "alias",
    width: '250px',
    slots: { customRender: 'alias' },
  },
  {
    title: "默认角色",
    dataIndex: "defaultRole",
    width: '250px',
    slots: { customRender: 'defaultRole' },
  },
  {
    title: '操作',
    dataIndex: 'operate',
    ellipsis: true,
    fixed: 'right',
    width: '180px',
    align: 'center',
    slots: { customRender: 'operate' },
  },
  ],
  dataSource:[],
  loading:false
})

const keyword = ref('')
const getTableData = async()=>{
  tableConfig.loading = true
  const res = await proxy.$api.terminalConfigList("get", {
    keyword: keyword.value
  });
  tableConfig.dataSource = res.map(i => {
    return {
      ...i,
      aliasNew: i.alias,
      defaultRoleNew: i.defaultRole,
      defaultRoleNameNew: i.defaultRoleName,
    }
  })
  tableConfig.loading = false
}
const roleList = ref([])
const filteredOptions = ref([])
const getRoleList = async (name?: string) => {
  roleList.value = []
  const data = await proxy.$api.roles("get", {
    enabled: true,
    pageNumber: 1,
    pageSize: 1000,
    name
  });
  if(data.records.length > 0){
    roleList.value = data.records.map(i => {
      return {
        label: i.name,
        value: i.id
      }
    })
  }
}
const handleRoleSearch = debounce((value: string | undefined) => {
  getRoleList(value)
},300);
const saveRecord = async (record) => {
  try {
    if(record.id){
      await proxy.$api.updateTerminalConfig("put", {
        id: record.id,
        code: record.code,
        alias: record.aliasNew,
        defaultRole: record.defaultRoleNew
      })
    }else{
      await proxy.$api.addTerminalConfig("post", {
        code: record.code,
        alias: record.aliasNew,
        defaultRole: record.defaultRoleNew
      })
    }
    proxy.$message.success("操作成功")
    record.isEdit = false
    getTableData()
  } catch (error) {
    proxy.$message.success("操作失败")
  }
}
const cancelRecord = async (record) => {
  record.isEdit = false
  record.aliasNew = record.alias
  record.defaultRoleNew = record.defaultRole
  record.defaultRoleNameNew = record.defaultRoleName
}
const editRow = (record)=>{
  record.isEdit = true
}
const reset = ()=>{
  keyword.value = ''
  getTableData()
}
onMounted(async() => {
 await getTableData()
 getRoleList()
})
</script>
<style scoped lang="less">
:deep(.content-data) {
  text-align: left;
}
</style>