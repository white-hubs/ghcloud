<template>
  <custom-modal
    v-model:visible="visible"
    :isMinimized="isMinimized"
    @changeIsMinimized="changeIsMinimized"
    title="车辆查询"
    className="car-search-modal car-search"
    @close="closeModal"
  >
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
          <a-pagination
            v-model:current="pagination.pageNumber"
            v-model:pageSize="pagination.pageSize"
            size="small"
            :total="pagination.total"
            @change="changePagination"
          />
        </div>
      </div>
    </div>
  </custom-modal>
</template>

<script>
import { CloseOutlined } from "@ant-design/icons-vue";
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted } from "vue";

import customModal from "../custom-modal/index.vue";
import customTable from "../custom-table/index.vue";
export default defineComponent({
  props: {
    visible: {
      Boolean,
      default: false,
    },
    value: {
      type: String,
      default: "",
    },
    isMinimized: {
      type: Boolean,
      default: false,
    },
  },
  components: { CloseOutlined, customTable, customModal },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      pagination: {
        vehicleNo: "",
        pageNumber: 1,
        pageSize: 5,
        total: 1,
      },
      columns: [
        {
          title: "车牌号",
          dataIndex: "vehicleNo",
          key: "vehicleNo",
        },
        {
          title: "车主",
          dataIndex: "customerName",
          key: "customerName",
          ellipsis: true,
        },
        {
          title: "联系电话",
          dataIndex: "customerMobile",
          key: "customerMobile",
        },
        {
          title: "车辆类型",
          dataIndex: "vehicleTypeName",
          key: "vehicleTypeName",
        },
      ],
      dataSource: [],
    });
    const getList = async () => {
      const params = {
        ...state.pagination,
      };
      const result = await proxy.$api.getVehicleList(params);
      state.pagination.total = result.total;
      state.dataSource = result.records;
    };
    onMounted(() => {
      getList();
    });
    const search = () => {
      state.pagination.pageNumber = 1;
      getList();
    };
    const reset = () => {
      state.pagination.vehicleNo = "";
      state.pagination.pageNumber = 1;
      getList();
    };
    const changePagination = (pageNumber, pageSize) => {
      state.pagination.pageNumber = pageNumber;
      getList();
    };
    const closeModal = () => {
      emit("close");
    };
    const changeIsMinimized = (bol) => {
      emit("update:isMinimized", bol);
    };
    return {
      closeModal,
      changePagination,
      search,
      reset,
      ...toRefs(state),
      changeIsMinimized,
    };
  },
});
</script>
<style lang="less">
.car-search-modal {
  width: 500px;
  position: fixed;
  top: calc(100vh - 570px);
  left: 570px;
  box-sizing: border-box;
  z-index: 100;
  background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
  border: 1px solid var(--dispatch-border, #dbe4ef);
  box-shadow: var(--dispatch-shadow-strong, 0 12px 32px rgba(26, 54, 93, 0.18));
  color: var(--dispatch-text, #1f2d3d);

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
      background: var(--dispatch-input-bg, #ffffff);
      border: 1px solid var(--dispatch-map-blue-border, #cfe0f3);
      color: var(--dispatch-text, #1f2d3d);
    }

    .searchBtn {
      background: #216cc3;
      color: #ffffff;
      border-color: #216cc3;
    }

    .reset {
      color: #216cc3;
      background: var(--dispatch-panel-bg-solid, #ffffff);
      border-color: #216cc3;
    }
  }

  .alarmDetail-modal-header {
    height: 50px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--dispatch-border, #dbe4ef);

    .header-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      > span {
        font-size: 16px;
        font-family: PingFang SC-Medium;
        font-weight: 500;
        color: var(--dispatch-text, #1f2d3d);
      }

      &::before {
        height: 15px;
        width: 3px;
        content: "";
        position: absolute;
        left: 8px;
        background: #216cc3;
        margin-right: 6px;
      }
    }

    .header-close {
      width: 24px;
      height: 24px;
      background: var(--dispatch-map-blue-soft, #eaf4ff);
      color: var(--dispatch-map-blue, #216cc3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 1px solid var(--dispatch-map-blue-border, #cfe0f3);
      border-radius: 4px;
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

      > div {
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

        > span {
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
          background: #216cc3;

          > span {
            color: var(--dispatch-map-blue, #1976d2);
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
