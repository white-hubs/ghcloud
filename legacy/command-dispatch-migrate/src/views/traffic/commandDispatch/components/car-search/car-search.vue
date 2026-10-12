<template>
  <custom-modal v-model:visible="visible" :isMinimized="isMinimized" @changeIsMinimized="changeIsMinimized" title="车辆查询"
    className="car-search-modal car-search" @close="closeModal">
    <div class="alarmDetail-modal-content flex-column">
      <div class="conent-body">
        <div class="content-search">
          <a-space :size="16">
            <a-input v-model:value="pagination.vehicleNo" placeholder="请输入车牌号"></a-input>
            <a-button class="searchBtn" @click="search">查询</a-button>
            <a-button class="searchBtn reset" @click="reset">重置</a-button>
          </a-space>
        </div>
        <div class="content-table">
          <custom-table :columns="columns" :dataSource="dataSource"></custom-table>
        </div>
        <div class="pagination" v-if="pagination.total > 0">
          <a-pagination v-model:current="pagination.pageNumber" v-model:pageSize="pagination.pageSize" size="small"
            :total="pagination.total" @change="changePagination" />
        </div>
      </div>
    </div>
  </custom-modal>
</template>

<script>
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted } from "vue";
import {
  CloseOutlined,
} from "@ant-design/icons-vue";
import customModal from '../custom-modal/index.vue'
import customTable from '../custom-table/index.vue'
export default defineComponent({
  props: {
    visible: {
      Boolean,
      default: false
    },
    value: {
      type: String,
      default: ""
    },
    isMinimized: {
      type: Boolean,
      default: false
    },
  },
  components: { CloseOutlined, customTable, customModal },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      pagination: {
        vehicleNo: '',
        pageNumber: 1,
        pageSize: 5,
        total: 1
      },
      columns: [
        {
          title: '车牌号',
          dataIndex: 'vehicleNo',
          key: 'vehicleNo'
        },
        {
          title: '车主',
          dataIndex: 'customerName',
          key: 'customerName',
          ellipsis: true
        },
        {
          title: '联系电话',
          dataIndex: 'customerMobile',
          key: 'customerMobile'
        },
        {
          title: '车辆类型',
          dataIndex: 'vehicleTypeName',
          key: 'vehicleTypeName'
        },
      ],
      dataSource: []
    })
    const getList = async () => {
      const params = {
        ...state.pagination
      }
      const result = await proxy.$api.getVehicleList(params)
      state.pagination.total = result.total
      state.dataSource = result.records
    }
    onMounted(() => {
      getList()
    })
    const search = () => {
      state.pagination.pageNumber = 1
      getList()
    }
    const reset = () => {
      state.pagination.vehicleNo = ''
      state.pagination.pageNumber = 1
      getList()

    }
    const changePagination = (pageNumber, pageSize) => {
      state.pagination.pageNumber = pageNumber
      getList()
    }
    const closeModal = () => {
      emit('close')
    }
    const changeIsMinimized = (bol) => {
      emit('update:isMinimized', bol)
    }
    return {
      closeModal,
      changePagination,
      search,
      reset,
      ...toRefs(state),
      changeIsMinimized
    }
  }
})
</script>
<style lang="less">
.car-search-modal {
  width: 500px;
  position: fixed;
  top: calc(100vh - 570px);
  left: 570px;
  box-sizing: border-box;
  z-index: 100;
  background: rgba(4, 14, 38, 0.96);
  border: 1px solid rgba(41, 137, 255, 1);

  .pagination {
    padding: 23px 0;
    text-align: center;
    position: relative;
  }

  &.full {
    width: 100%;
    height: 100%;
  }

  .content-search {
    margin-bottom: 16px;

    .ant-input {
      background: transparent;
      border: 1px solid rgba(183, 197, 211, 0.3);
      color: rgba(183, 197, 211, 1);
    }

    .searchBtn {
      background: #2989ff;
      color: #ffffff;
      border-color: #2989ff;
    }

    .reset {
      color: #2989ff;
      background: #000000;
      border-color: #2989ff;
    }
  }

  .alarmDetail-modal-header {
    height: 50px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    .header-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      >span {
        font-size: 16px;
        font-family: PingFang SC-Medium;
        font-weight: 500;
        color: #ffffff;
      }

      &::before {
        height: 15px;
        width: 3px;
        content: '';
        position: absolute;
        left: 8px;
        background: #2989ff;
        margin-right: 6px;
      }
    }

    .header-close {
      width: 24px;
      height: 24px;
      background: #101010;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }

  .alarmDetail-modal-content {
    height: 390px;
    width: 100%;
    padding: 16px 16px 0;
    overflow: hidden;

    .content-tabs {
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 14px;
      font-family: PingFang SC-Regular;
      font-weight: 400;
      color: #ffffff;

      >div {
        width: 84px;
        height: 26px;
        opacity: 1;
        border: 1px solid rgba(183, 197, 211, 0.3);
        margin-right: 12px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0px 0px 2px 0px rgba(56, 142, 243, 0.45);
        cursor: pointer;

        >span {
          display: inline-block;
          color: white;
          width: 12px;
          height: 12px;
          border-radius: 2px;
          margin-left: 2px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &.active {
          background: #2989ff;

          >span {
            color: rgba(4, 14, 38, 0.96);
            background: white;
          }
        }
      }
    }

    .conent-body {
      // height: calc(100% - 55px);
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      overflow-y: scroll;

      .content-table {
        flex: 1;
        overflow-y: scroll;
      }
    }
  }

  .vidiconcontent {
    height: 670px;
  }
}
</style>
<style lang="less">
.car-search {
  .ant-pagination {
    color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-item-active {
    background: transparent !important;
  }

  .ant-pagination-item-ellipsis {
    color: rgba(228, 228, 228, 1) !important;
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
</style>