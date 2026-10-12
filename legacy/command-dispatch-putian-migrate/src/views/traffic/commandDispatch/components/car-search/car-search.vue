<template>
  <div class="alarmDetail-wrap car-search">
    <div class="alarmDetail-modal">
      <div class="alarmDetail-modal-header">
        <div class="header-title">
          <span>车辆查询</span>
        </div>
        <div class="header-close" @click="closeModal">
          <CloseOutlined />
        </div>
      </div>
      <div class="alarmDetail-modal-content flex-column">
        <!-- <div class="content-tabs"></div> -->
        <div class="conent-body">
          <div class="content-search">
            <a-space :size="16">
              <a-input v-model:value="pagination.vehicleNo" placeholder="请输入车牌号"></a-input>
              <a-button class="searchBtn" @click="search">查询</a-button>
              <a-button class="searchBtn" @click="reset">重置</a-button>
            </a-space>
          </div>
          <div class="content-table">
            <custom-table :columns="columns" :dataSource="dataSource"></custom-table>
          </div>
          <div class="pagination">
            <a-pagination v-model:current="pagination.pageNumber" size="small" :total="pagination.total"
              v-if="pagination.total > 0" @change="changePagination" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted } from "vue";
import {
  CloseOutlined,
} from "@ant-design/icons-vue";

import customTable from '../custom-table/index.vue'
export default defineComponent({
  props: {
    value: {
      type: String,
      default: ""
    }
  },
  components: { CloseOutlined, customTable },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      pagination: {
        vehicleNo: '',
        pageNumber: 1,
        pageSize: 10,
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
          key: 'customerName'

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
    return {
      closeModal,
      changePagination,
      search,
      reset,
      ...toRefs(state)
    }
  }
})
</script>
<style scoped lang="less">
.alarmDetail-wrap {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
}

.pagination {
  padding: 23px 0;
  text-align: center;
  position: relative;
}

.alarmDetail-modal {
  width: 1250px;
  height: 545px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(4, 14, 38, 0.96);
  border: 1px solid rgba(41, 137, 255, 1);

  &.full {
    width: 100%;
    height: 100%;
  }

  .content-search {
    margin-bottom: 16px;

    :deep(.ant-input) {
      color: #ffffff;
      background-color: transparent;
      border-color: #2989ff;

      &:hover {
        border-color: #2989ff;
      }
    }

    .searchBtn {
      background: #2989ff;
      color: #ffffff;
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
        margin-left: 4px;
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
    height: 495px;
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
        overflow-y: scroll;
        flex: 1;
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