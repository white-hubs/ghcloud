<template>
  <g-layout title="访问端角色配置">
    <template #content-search>
      <a-form :model="formState" layout="inline">
        <a-form-item>
          <a-input placeholder="角色名称查询" v-model:value="formState.keyword" />
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
				<template #name="{ text, record }">
					<div>
						<a-input
							v-if="tableConfig.dataSource['isEdit']"
							v-model:value="tableConfig.dataSource['name']"
							style="margin: -5px 0"
							placeholder="请输入别名"
						></a-input>
						<template v-else>
							<div class="rowText">{{ text }}</div>
						</template>
					</div>
				</template>
        <template #operate="{record}">
          <span v-if="record['isEdit']">
            <a-space :size="16">
              <a @click.stop="saveRecord(record)">保存</a>
              <a-popconfirm
                title="是否取消修改"
                cancelText="取消"
                okText="确定"
                @confirm.stop="cancelRecord(record)"
              >
                <a @click.stop="">取消</a>
              </a-popconfirm>
            </a-space>
          </span>
          <span v-else>
            <a-button type="link" @click="editRow(record)">编辑</a-button>
            <a-button type="link" @click="setRole(record)">默认角色</a-button>
          </span>
        </template>
      </a-table>
    </template>
    <template #footer-page>
      <a-pagination v-model:pageSize="pagination.pageSize" v-model:current="pagination.pageNumber" :total="pagination.total" show-less-items
        :show-total="(total: number) => `共 ${total} 条数据`" @change="getTableData" />
    </template>
    <role-modal ref="roleModaRef" @ok="getTableData"></role-modal>
  </g-layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted,getCurrentInstance} from 'vue'
import { useRouter } from "vue-router";
import roleModal from "./components/role-modal.vue";
const { proxy } = getCurrentInstance();
const router = useRouter();
const roleModaRef = ref<{ openModal: (id: string) => void; }>()
const tableConfig = reactive({
  columns:[
  {
    title: "访问端名称",
    dataIndex: "name",
    customRender: ({ text }) => {
      return <PopOver content={text}>{text}</PopOver>
    },
  },
  {
    title: "访问端编码",
    dataIndex: "product.name",
    customRender: ({ text }) => {
      return <PopOver content={text}>{text}</PopOver>
    },
  },
  {
    title: "访问端别名",
    dataIndex: "remark",
    customRender: ({ text }) => {
      return <PopOver content={text}>{text}</PopOver>
    },
  },
  {
    title: "角色",
    dataIndex: "remark",
    width: 220,
    customRender: ({ text }) => {
      return <PopOver content={text}>{text}</PopOver>
    },
  },
  {
    title: '操作',
    dataIndex: 'operate',
    ellipsis: true,
    align: 'center',
    slots: { customRender: 'operate' },
  },
  ],
  dataSource:[],
  loading:false
})

const formState = reactive({
  keyword:'',
})
const pagination = reactive({
  pageSize: 6,
  pageNumber: 1,
  total: 0
})
const getTableData = async()=>{
  tableConfig.loading = true
  const res = await proxy.$api.roles("get", {
    name: formState.keyWord,
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize,
  });
  tableConfig.dataSource = res.records
  pagination.total = res.total
  tableConfig.loading = false
}
const saveRecord = (record) => {
}
const cancelRecord = (record) => {
  record.isEdit = false
}
const editRow = (val)=>{
  record.isEdit = false
}
const setRole = (val)=>{
  roleModaRef.value?.openModal(val.id)
}
const reset = ()=>{
  formState.applicationCode=''
  formState.keyword=''
  getTableData()
}
onMounted(async() => {
 await getTableData()
})
</script>
<style scoped lang="less">
:deep(.content-data) {
  text-align: left;
}
</style>