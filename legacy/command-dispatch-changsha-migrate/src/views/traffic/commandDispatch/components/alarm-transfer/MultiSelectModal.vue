<template>
  <a-modal :visible="visible" :title="title" @cancel="handleCancel" @ok="handleOk" class="modalBody" width="1100px">
    <personList v-if="type === 'USER'" :id="id" :personalList="personalList" @close="close" @submit="submit" />
    <div v-else>
      <div class="search-bar">
        <a-input v-model:value="searchTerm" placeholder="请输入关键词搜索" @search="onSearch" />
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
import { defineComponent, ref, computed, watch, getCurrentInstance, onMounted } from "vue";

import personList from "../../person.vue";

export default defineComponent({
  components: {
    personList,
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

    id: {
      type: String,
      default: "",
    },
    selectData: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:visible", "confirm"],
  setup(props, { emit }) {
    const personalList = ref([]);
    const title = ref("选择人员");
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
      },
    ];
    const close = () => {
      emit("update:visible", false);
    };
    const submit = (data) => {
      personalList.value = data;
    };
    const data = ref([]);
    const searchTerm = ref("");
    const currentPage = ref(1);
    const pageSize = ref(10);
    const selectedRowKeys = ref([]);
    const { proxy } = getCurrentInstance();

    const filteredData = computed(() => {
      if (!searchTerm.value) {
        return data.value;
      }
      return data.value.filter((item) =>
        Object.values(item).some((val) => String(val).toLowerCase().includes(searchTerm.value.toLowerCase())),
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
      emit("update:visible", false);
    };

    const handleOk = () => {
      if (props.type === "USER") {
        emit("confirm", personalList.value);
      } else {
        const selectedItems = data.value.filter((item) => selectedRowKeys.value.includes(item.id));
        emit("confirm", selectedItems);
      }

      emit("update:visible", false);
    };

    const rowSelection = {
      onChange: (keys) => {
        selectedRowKeys.value = keys;
      },
      selectedRowKeys,
    };
    onMounted(async () => {
      selectedRowKeys.value = props.selectData?.map((item) => item.id);
      personalList.value = props.selectData;
      title.value = "选择人员";
      if (props.type === "DEPARTMENT") {
        data.value = await proxy.$api.getOrganizations();
        title.value = "选择部门";
      }
      if (props.type === "POSITION") {
        data.value = await proxy.$api.getPositionList();
        title.value = "选择职位";
      }
      if (props.type === "ROLE") {
        data.value = await proxy.$api.getRole();
        title.value = "选择角色";
      }
    });
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
      personalList,
    };
  },
});
</script>

<style lang="less">
.search-bar {
  margin-bottom: 16px;
}
.modalBody {
  --alarm-transfer-table-text: #000000;
  --alarm-transfer-table-muted: #666666;

  .ant-modal-content {
    background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
    border: 1px solid var(--dispatch-border, #dbe4ef);
    box-shadow: var(--dispatch-shadow-strong, 0 12px 32px rgba(26, 54, 93, 0.18));
  }
  .ant-modal-header {
    background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
    border-bottom: 1px solid var(--dispatch-border, #dbe4ef);
    .ant-modal-title {
      color: #000000;
    }
  }
  .ant-modal-footer {
    border: none;
  }
  .ant-modal-body {
    .search-bar {
      color: #000000;
      background-color: var(--dispatch-input-bg, #ffffff);
      border-color: var(--dispatch-map-blue-border, #cfe0f3);
    }
    &:hover {
      border-color: #216cc3;
    }
    .ant-table-thead {
      th {
        color: #000000 !important;
        background: #f6f9ff !important;
        border-color: var(--dispatch-border, #dbe4ef);
        font-weight: 600;
      }
    }
    .ant-table-body {
      max-height: 380px;
      overflow-y: auto;
      color: var(--alarm-transfer-table-text);
      background: var(--dispatch-panel-bg-solid, #ffffff) !important;
      border-color: var(--dispatch-map-blue-border, #cfe0f3);
      td,
      .ant-table-cell {
        color: var(--alarm-transfer-table-text) !important;
        font-weight: 500;
      }
      .ant-table-row-selected {
        background: var(--dispatch-panel-bg-active, #eaf4ff) !important;
      }
      .ant-table-row:hover {
        td {
          background: var(--dispatch-panel-bg-active, #eaf4ff) !important;
        }
      }
      tr.ant-table-row-selected td {
        background: var(--dispatch-panel-bg-active, #eaf4ff) !important;
      }
    }
  }
  .ant-input {
    color: var(--alarm-transfer-table-text);
    background-color: var(--dispatch-input-bg, #ffffff);
    border-color: var(--dispatch-map-blue-border, #cfe0f3);

    &:hover {
      border-color: #216cc3;
    }
  }
  .ant-input::placeholder {
    color: var(--alarm-transfer-table-muted) !important;
  }
  .ant-table,
  .ant-table-tbody > tr > td,
  .ant-table-thead > tr > th,
  .ant-table-cell,
  .ant-table-row,
  .ant-table-row-level-0,
  .ant-table-row td,
  .ant-table-row td span,
  .ant-table-row td div,
  .ant-table-row .ant-table-cell span,
  .ant-table-row .ant-table-cell div,
  .ant-table-tbody .ant-table-cell,
  .ant-table-tbody .ant-table-cell *,
  .ant-checkbox-wrapper,
  .ant-radio-wrapper {
    color: var(--alarm-transfer-table-text) !important;
  }
  .ant-table-tbody > tr > td {
    opacity: 1 !important;
    font-weight: 500;
  }
  .ant-table-placeholder {
    background: var(--dispatch-panel-bg-solid, #ffffff) !important;
    .ant-empty-description {
      color: var(--alarm-transfer-table-muted);
    }
  }
}
.alarmDetail-pagination {
  .ant-pagination {
    color: var(--alarm-transfer-table-text) !important;
  }

  .ant-pagination-item-active {
    background: var(--dispatch-panel-bg-active, #e6f2ff) !important;
    border-color: var(--dispatch-map-blue, #1976d2) !important;
  }

  .ant-pagination-item {
    border-color: #d1d1d1;
    color: var(--alarm-transfer-table-text) !important;

    a {
      color: var(--alarm-transfer-table-text) !important;
    }
  }

  .ant-pagination.mini .ant-pagination-prev,
  .ant-pagination.mini .ant-pagination-next {
    color: var(--alarm-transfer-table-text) !important;
  }

  .ant-pagination-prev a,
  .ant-pagination-next a {
    color: var(--alarm-transfer-table-text) !important;
  }
}
.alarmDetail-pagination {
  padding: 23px 0;
  text-align: center;
  position: relative;
}
</style>
