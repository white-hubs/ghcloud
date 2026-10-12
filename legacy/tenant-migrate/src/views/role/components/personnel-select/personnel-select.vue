<template>
  <a-modal
    v-model:visible="visible"
    wrapClassName="role-person-modal"
    title="关联人员"
    centered="centered"
    @ok="save"
    @cancel="cancel"
    width="800px"
  >
    <div class="role-user">
      <div class="pb2">
        <a-form ref="formRef" layout="inline">
          <a-form-item label="部门">
            <a-select
              v-model:value="state.organizationId"
              style="width: 140px"
              :options="departmentOptions"
              placeholder="请选择"
              allowClear
            />
          </a-form-item>
          <a-form-item label="姓名">
            <a-input v-model:value="state.keyword" placeholder="请输入" />
          </a-form-item>
          <a-form-item>
            <a-space :size="16">
              <a-button type="primary" @click="onSearch">查询</a-button>
              <a-button type="default" @click="handleReset">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>
      <a-table :columns="columns" :dataSource="state.dataSource" size="small" :pagination="false" rowKey="id" :row-selection="rowSelection">
      </a-table>
      <a-pagination
        show-size-changer
        v-model:current="pagination.pageNumber"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        @showSizeChange="getData"
        @change="getData"
      />
    </div>
    <template #footer>
      <a-button key="submit" type="primary" @click="save">确定</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { reactive, toRefs, onMounted, computed, watch, ref } from "vue";

import { organizationsList, tenantUserList } from "@/api/index";
const props = defineProps({
  ids: {
    type: Array,
    default: () => [],
  },
  show: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["close", "save"]);
const visible = ref(props.show);
const departmentOptions = ref([]);
const pagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  total: 0,
});
const selectedRowKeys = ref([]);
const normalizeIds = (ids) => (Array.isArray(ids) ? [...ids] : []);

watch(
  () => props.show,
  () => {
    visible.value = props.show;
    if (props.show) {
      selectedRowKeys.value = normalizeIds(props.ids);
      getData();
    }
  },
);
const getData = async () => {
  const result = await tenantUserList({
    keyword: state.keyword,
    organizationId: state.organizationId,
    ...pagination,
  });
  state.dataSource = result.records;
  pagination.total = result.total;
};
const getOrganizationsList = async () => {
  const result = await organizationsList();
  departmentOptions.value = result.map((e) => {
    return {
      label: e.name,
      value: e.id,
    };
  });
};

const mergeSelectedKeys = (keys) => {
  selectedRowKeys.value = Array.from(new Set([...selectedRowKeys.value, ...keys]));
};

const removeSelectedKeys = (keys) => {
  const keySet = new Set(keys);
  selectedRowKeys.value = selectedRowKeys.value.filter((key) => !keySet.has(key));
};

const getRecordKey = (record) => record?.id;

const getValidKeys = (records = []) => records.map(getRecordKey).filter((key) => key !== undefined && key !== null);

const onSelect = (record, selected) => {
  const key = getRecordKey(record);
  if (key === undefined || key === null) return;
  if (selected) {
    mergeSelectedKeys([key]);
  } else {
    removeSelectedKeys([key]);
  }
};

const onSelectAll = (selected, _selectedRows, changeRows = []) => {
  const changeKeys = getValidKeys(changeRows);
  if (selected) {
    mergeSelectedKeys(changeKeys);
  } else {
    removeSelectedKeys(changeKeys);
  }
};

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onSelect,
  onSelectAll,
}));

const onSearch = () => {
  pagination.pageNumber = 1;
  getData();
};
const handleReset = () => {
  state.keyword = "";
  state.organizationId = undefined;
  state.dataSource = [];
  pagination.pageNumber = 1;
  getData();
};
const save = () => {
  emit("save", [...selectedRowKeys.value]);
};
const cancel = () => {
  emit("close");
};
/**
 * 数据部分
 */
const state = reactive({
  dataSource: [],
  organizationId: undefined,
  keyword: "",
});
const columns = [
  {
    title: "名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "联系电话",
    dataIndex: "mobile",
    key: "mobile",
  },
  {
    title: "部门",
    dataIndex: "organizations",
    key: "organizations",
    slots: {
      customRender: "organizations",
    },
    customRender: ({ text, record }) => {
      if (window.config.feature?.usePersonal) {
        return record.organizationName;
      }
      return text && text.length > 0 ? text.map((e) => e.name).join("/") : "--";
    },
  },
  {
    title: "性别",
    dataIndex: "gender",
    key: "gender",
    slots: {
      customRender: "gender",
    },
    customRender: ({ text, record }) => {
      if (window.config.feature?.usePersonal) {
        return record.gender;
      }
      const genderObj = {
        NONE: "保密",
        MALE: "男",
        FEMALE: "女",
      };
      return genderObj[text] ?? "--";
    },
  },
];
onMounted(() => {
  getOrganizationsList();
});
defineExpose({
  ...toRefs(state),
});
</script>
<style lang="less">
.role-user {
  .ant-pagination {
    margin: 0;
    padding: 10px;
  }
}

.role-person-modal {
  .ant-modal-body {
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 0;
  }
}
</style>
<style scoped lang="less"></style>
