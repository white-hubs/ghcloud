<template>
  <g-layout title="租户字典树">
    <template #header-btn>
      <a-button type="primary" @click="handleAdd">新增</a-button>
    </template>
    <template #content-left>
      <div class="left">
        <LeftDict @change-select="handleSelectDict" v-if="tenantCode" />
      </div>
    </template>
    <template #content-search>
      <div class="table-search">
        <a-input v-model:value="params.keyword" placeholder="请输入" />
        <a-select style="width: 200px;" show-search :filter-option="filterOption" @change="handleSearch"
          v-model:value="tenantCode" placeholder="请选择" :options="tenantOptions" />
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button @click="handleReset">重置</a-button>
      </div>
    </template>
    <template #content-table>
      <div class="table-content">
        <a-table :dataSource="treeDataSource" :loading="loading" rowKey='id' childrenColumnName='nextList'
          :pagination="false" :columns="columns" bordered size="small" />
      </div>
    </template>
    <template #footer-page>
      <a-pagination v-model:current="params.pageNumber" v-model:pageSize="params.pageSize" :total="params.total" />
    </template>
    <EditModal v-model:visible="editVisible" :dictTreeData="treeDataSource" dictType='tree' :editState="editDict"
      :type="editType" @confirm="handleConfirm" />
  </g-layout>
</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
  toRaw,
  onBeforeMount,
  onMounted,
} from "vue";
import { tableColumns, timeFormat } from "@/utils/common";
import { enabled, gender } from "@/utils/enumerate";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import LeftDict from "../components/left-dict.vue";
import EditModal from '../edit-modal/index.vue';
import { Popconfirm } from 'ant-design-vue'
export default defineComponent({
  components: {
    EditOutlined,
    LeftDict,
    DeleteOutlined,
    EditModal
  },
  setup() {
    const tableRef = ref();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      columns: [
        {
          dataIndex: "itemCode",
          title: "字典项",
          align: 'center',
          width: 200,
          customRender: ({ text }) => {
            return (
              <PopOver content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "name",
          title: "名称",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "code",
          title: "编号",
          align: 'center',
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "remarks",
          title: "备注",
          align: 'center',
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "version",
          title: "版本号",
          ellipsis: true,
          align: 'center',
          customRender: ({ text }) => {
            return (
              <PopOver content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "variable",
          title: "变量",
          ellipsis: true,
          align: 'center',
          customRender: ({ text }) => {
            return (
              <PopOver content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "operate",
          title: "操作",
          align: 'center',
          customRender: ({ record }) => {
            return (
              <>
                <a-button type="link" onClick={() => handleAddNext(record)}>新增下级</a-button>
                <a-button type="link" onClick={() => handleEdit(record)}>编辑</a-button>
                <Popconfirm title='是否确认删除当前数据字典?' onConfirm={() => handleDelete(record.id)} okText='确认' cancelText='取消'>
                  <a-button type="link" danger>删除</a-button>
                </Popconfirm>
              </>
            );
          },
        },
      ],
      scrollY: 500,
      loading: false,
      tenantCode: '',
      tenantOptions: [],
      editDict: {
        name: '',
        code: '',
        variable: '',
        remarks: ''
      },
      params: {
        keyword: '',
        itemCode: ''
      },
      treeDataSource: [],
      editVisible: false,
      dictItemsDataSource: [{}],
      editType: 'add',
      dataSource: []
    });
    onBeforeMount(async () => {
      await getTenantOptions()
    });
    const getDictTree = async () => {
      try {
        state.loading = true
        const result = await proxy.$api.getTenantDictionaryTree({ itemCode: state.params.itemCode, keyword: state.params.keyword }, state.tenantCode)
        state.treeDataSource = result
      } catch (error) {

      } finally {
        state.loading = false
      }

    }
    const getScrollY = () => {
      const contentContainer = document.querySelector('.layout-content')
      const searchContainer = document.querySelector('.content-search')
      const contentHeight = contentContainer ? contentContainer.clientHeight : 0
      const searchHeight = searchContainer ? searchContainer.clientHeight : 0
      if (contentHeight) {
        state.scrollY = contentHeight - searchHeight - 32
      }
    }
    onMounted(() => {
      getScrollY()
    })
    const handleEdit = (record) => {
      state.editType = 'edit'
      state.editDict = {
        ...record,
        superiorsId: record.superiorsId ? record.superiorsId : '',
      }
      state.editVisible = true
    }
    const handleAdd = () => {
      state.editType = 'add'
      state.editDict = {
        name: '',
        code: '',
        variable: '',
        level: 1,
        superiorsId: '',
        remarks: ''
      }
      state.editVisible = true
    }
    const handleAddNext = (record) => {
      state.editType = 'add'
      state.editDict = {
        name: '',
        code: '',
        variable: '',
        level: record.level + 1,
        superiorsId: record.id,
        remarks: ''
      }
      state.editVisible = true
    }
    const handleSelectDict = (item) => {
      state.params.itemCode = item.code
      getDictTree()
    }
    const handleReset = () => {
      state.params = {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        name: '',
        itemCode: state.params.itemCode
      }
      getDictTree()
    }
    const getTenantOptions = async () => {
      const result = await proxy.$api.getTenants('get', {
        pageNumber: 1,
        pageSize: 1000,
        enabled: true
      })
      if (result.records.length === 0) return
      const usuallyTenantCode = 58197260
      state.tenantOptions = result.records.map(item => {
        return {
          label: item.name,
          value: item.code
        }
      })
      const index = state.tenantOptions.findIndex(item => item.value === usuallyTenantCode)
      state.tenantCode = index !== -1 ? usuallyTenantCode : result.records[0].code
    }
    const filterOption = (input, option) => {
      return (option.label || '').toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
    const handleConfirm = async (formState) => {
      // if (state.editType === 'add') {
      //   await proxy.$api.addTenantDictionaryTree({
      //     ...formState,
      //     itemCode: state.params.itemCode,
      //   }, state.tenantCode)
      // } else if (state.editType === 'edit') {
      //   await proxy.$api.updateTenantDictionaryTree({
      //     ...formState,
      //     itemCode: state.params.itemCode,
      //   }, state.tenantCode)
      // }
      state.editType === 'add' ?
        await proxy.$api.addTenantDictionaryTree({
          ...formState,
          itemCode: state.params.itemCode,
        }, state.tenantCode) : await proxy.$api.updateTenantDictionaryTree({
          ...formState,
          itemCode: state.params.itemCode,
        }, state.tenantCode)
      proxy.$message.success('操作成功')
      state.editDict = {
        name: '',
        code: '',
        variable: '',
        level: 1,
        superiorsId: '',
        remarks: ''
      }
      state.editVisible = false
      getDictTree()
    }
    const handleDelete = async (id) => {
      await proxy.$api.deleteTenantDictionaryTree(id, state.tenantCode)
      getDictTree()
      proxy.$message.success('删除成功')
    }
    const handleSearch = () => {
      state.params.pageNumber = 1
      getDictTree()
    }


    return {
      tableRef,
      ...toRefs(state),
      handleConfirm,
      handleReset,
      handleSearch,
      filterOption,
      handleSelectDict,
      handleAdd,
    };
  },
});
</script>
<style scoped lang="less">
:deep(.content-left) {
  padding-top: 0px !important;
}

.left {
  width: 256px;
  height: 100%;
}

@import url("@/styles/searchTable/index.less");


.table-search {
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 12px;

  :deep(.ant-input) {
    width: 200px;
  }
}



.table-content {
  padding: 12px;

  :deep(.ant-btn) {
    padding: 4px;
  }
}
</style>