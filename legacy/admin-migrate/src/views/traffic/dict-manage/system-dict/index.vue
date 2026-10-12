<template>
  <g-layout title="系统字典">
    <template #header-btn>
      <a-button type="primary" @click="handleAdd">新增</a-button>
    </template>
    <template #content-left>
      <div class="left">
        <LeftDict @change-select="handleSelectDict" />
      </div>
    </template>
    <template #content-search>
      <div class="table-search">
        <a-input v-model:value="params.name" placeholder="请输入" />
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button @click="handleReset">重置</a-button>
      </div>
    </template>
    <template #content-table>
      <div class="table-content">
        <a-table :scroll="{y:scrollY}" :loading="loading" :dataSource="dataSource" :pagination="false"
          :columns="columns" bordered size="small" />
      </div>
    </template>
    <template #footer-page>
      <a-pagination v-model:current="params.pageNumber" @change="handlePageChange" v-model:pageSize="params.pageSize"
        :total="params.total" />
    </template>
    <EditModal v-model:visible="editVisible" :editState="editDict" :type="editType" @confirm="handleConfirm" />
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
          dataIndex: "sort",
          title: "序号",
          width: 50,
          align: 'center',
          customRender: ({ text, index }) => {
            return index + 1;
          },
        },
        {
          dataIndex: "itemCode",
          title: "字典项",
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
          customRender: ({ record }) => {
            return (
              <>
                <a-button type="link" onClick={() => handleEdit(record)}>编辑</a-button>
                <Popconfirm title='是否确认删除当前数据字典?' onConfirm={() => handleDelete(record.id)} okText='确认' cancelText='取消'>
                  <a-button type="link" danger>删除</a-button>
                </Popconfirm>
              </>
            );
          },
        },
      ],
      editDict: {
        name: '',
        code: '',
        variable: '',
        remarks: ''
      },
      loading: false,
      scrollY: 500,
      params: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        name: '',
        itemCode: ''
      },
      editVisible: false,
      dictItemsDataSource: [{}],
      editType: 'add',
      dataSource: []
    });
    const handleEdit = (record) => {
      state.editType = 'edit'
      state.editDict = record
      state.editVisible = true
    }
    const handleAdd = () => {
      state.editType = 'add'
      state.editDict = {
        name: '',
        code: '',
        variable: '',
        remarks: ''
      }
      state.editVisible = true
    }
    const handlePageChange = (pageNumber, pageSize) => {
      state.params.pageNumber = pageNumber
      state.params.pageSize = pageSize
      getDictList()
    }
    const handleSelectDict = (item) => {
      state.params.itemCode = item.code
      getDictList()
    }
    const handleReset = () => {
      state.params = {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        name: '',
        itemCode: state.params.itemCode
      }
      getDictList()
    }
    const getScrollY = () => {
      const contentContainer = document.querySelector('.layout-content')
      const searchContainer = document.querySelector('.content-search')
      const contentHeight = contentContainer ? contentContainer.clientHeight : 0
      const searchHeight = searchContainer ? searchContainer.clientHeight : 0
      if(contentHeight){
        state.scrollY = contentHeight - searchHeight - 32
      }
    }
    onMounted(() => {
      getScrollY()
    })
    const handleConfirm = async (formState) => {
      state.editType === 'add' ?
        await proxy.$api.addSysDataDictionary({
          ...formState,
          itemCode: state.params.itemCode,
        }) : await proxy.$api.updateSysDictionary({
          ...formState,
          itemCode: state.params.itemCode,
        })
      proxy.$message.success('操作成功')
      state.editDict = {
        name: '',
        code: '',
        variable: '',
        remarks: ''
      }
      state.editVisible = false
      getDictList()
    }
    const handleDelete = async (id) => {
      await proxy.$api.deleteSysDictionary(id)
      getDictList()
      proxy.$message.success('删除成功')
    }
    const handleSearch = () => {
      state.params.pageNumber = 1
      getDictList()
    }
    const getDictList = async () => {
      try {
        state.loading = true
        const result = await proxy.$api.getSysDataDictPage(state.params)
        state.dataSource = result.records
        state.params.total = result.total
      } catch (error) {

      } finally {
        state.loading = false
      }
    }


    return {
      tableRef,
      ...toRefs(state),
      handleConfirm,
      handleReset,
      handlePageChange,
      handleSearch,
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