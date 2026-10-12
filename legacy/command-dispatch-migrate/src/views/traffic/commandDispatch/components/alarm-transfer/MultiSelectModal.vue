<template>
  <a-modal
    :visible="visible"
    :title="title"
    @cancel="handleCancel"
    @ok="handleOk"
    class="modalBody"
    width="1100px"
  >
  <personList v-if="type === 'USER'" :id="id" :personalList="personalList" @close="close" @submit="submit"/>
  <div v-else>
      <div class="search-bar">
        <a-input
          v-model:value="searchTerm"
          placeholder="请输入关键词搜索"
          @search="onSearch"
        />
      </div>
      <a-table
        :columns="columns"
        :data-source="paginatedData"
        :row-selection="rowSelection"
        :pagination="false"
        childrenColumnName="ttt"
        row-key="id"
      >
      </a-table>
      <div class="alarmDetail-pagination">
        <a-pagination
          v-model:current="currentPage"
          :total="filteredData.length"
          :page-size="pageSize"
          @change="onPageChange"
          size="small"
        />
      </div>
    </div>
  </a-modal>
</template>

<script>
import { defineComponent, ref, computed, watch,getCurrentInstance,onMounted } from 'vue';
import personList from "../../person.vue";

export default defineComponent({
   components: {
    personList
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    type: {
      type: Boolean,
      required: true,
    },

    id:{
      type: String,
      default: ''
    },
    selectData:{
      type: Array,
      default: () => [],
    }
  },
  emits: ['update:visible', 'confirm'],
  setup(props, { emit }) {
    const personalList = ref([])
    const title = ref('选择人员')
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      }
    ]
    const close = ()=>{
      emit('update:visible', false);
    }
    const submit = (data) =>{
      personalList.value = data
    }
    const data = ref([])
    const searchTerm = ref('');
    const currentPage = ref(1);
    const pageSize = ref(10);
    const selectedRowKeys = ref([]);
    const { proxy } = getCurrentInstance();



    const filteredData = computed(() => {
      if (!searchTerm.value) {
        return data.value;
      }
      return data.value.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(searchTerm.value.toLowerCase())
        )
      );
    });

    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return filteredData.value.slice(start, end);
    });

    const onSearch = () => {
      currentPage.value = 1;
    };

    const onPageChange = (page) => {
      currentPage.value = page;
    };

    const handleCancel = () => {
      emit('update:visible', false);
    };

    const handleOk = () => {
      if(props.type === 'USER'){
        emit('confirm', personalList.value);
      }else{
      const selectedItems = data.value.filter(item => selectedRowKeys.value.includes(item.id));
      emit('confirm', selectedItems);
      }
      
      emit('update:visible', false);
    };

    const rowSelection = {
      onChange: (keys) => {
        selectedRowKeys.value = keys;
      },
      selectedRowKeys,
    };
    onMounted(async()=>{
      selectedRowKeys.value = props.selectData?.map(item => item.id);
      personalList.value = props.selectData
      title.value = '选择人员'
      if(props.type === 'DEPARTMENT'){
        data.value  = await proxy.$api.getOrganizations();
        title.value = '选择部门'
      }
      if(props.type === 'POSITION'){
        data.value  = await proxy.$api.getPositionList();
        title.value = '选择职位'
      }
      if(props.type === 'ROLE'){
        data.value  = await proxy.$api.getRole();
        title.value = '选择角色'
      }
    })
    return {
      searchTerm,
      currentPage,
      pageSize,
      paginatedData,
      filteredData,
      onSearch,
      onPageChange,
      handleCancel,
      handleOk,
      rowSelection,
      submit,
      close,
      columns,
      data,
      title,
      personalList
    };
  },
});
</script>

<style  lang="less"> 
.search-bar {
  margin-bottom: 16px;
}
.modalBody{
  .ant-modal-content{
    background: rgb(5, 15, 37) ;
   
  }
  .ant-modal-header{
 background:rgb(5, 15, 37) ;
  border: none;
    .ant-modal-title{
      color: #fff;
     
    }
  }
  .ant-modal-footer{
    border: none;
  }
  .ant-modal-body{
    .search-bar{
      color: #ffffff;
      background-color: transparent;
      border-color: #2989ff;
      } &:hover {
        border-color: #2989ff;
      }
    .ant-table-thead{
      th{
      color: #ffffff;
      background: #285487 !important;
      border-color: #285487;
      }
     
    }
    .ant-table-body{
      max-height: 380px;
      overflow-y: auto;
      color: #ffffff;
      background: rgb(5, 15, 37) !important;
      border-color: #2989ff;
      .ant-table-row-selected{
        background: rgb(5, 15, 37) !important;
      }
      .ant-table-row:hover{
        td{
            background: rgb(5, 15, 37) !important;
        }
      }
      tr.ant-table-row-selected td{
        background: rgb(5, 15, 37) !important;
      }
    }
  } 
   .ant-input {
    color: #ffffff;
    background-color: transparent;
    border-color: #2989ff;

    &:hover {
      border-color: #2989ff;
    }
  }
  .ant-table-placeholder{
    background: rgb(5, 15, 37) !important;
    .ant-empty-description{
      color: #ffffff;
    }
  }
}
.alarmDetail-pagination {
  .ant-pagination {
    color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-item-active {
    background: transparent !important;
  }

  .ant-pagination-item {
    border-color: #d1d1d1;
    color: rgba(228, 228, 228, 1) !important;

    a {
      color: rgba(228, 228, 228, 1) !important;
    }
  }

  .ant-pagination.mini .ant-pagination-prev,
  .ant-pagination.mini .ant-pagination-next {
    color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-prev a,
  .ant-pagination-next a {
    color: rgba(228, 228, 228, 1) !important;
  }
}
  .alarmDetail-pagination {
    padding: 23px 0;
    text-align: center;
    position: relative;
  }
</style>