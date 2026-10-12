<template>
  <a-modal
    v-model:visible="state.modalVisible" width="1200px" :title="title + '列表'" centered
    class="org-picker-modal"
    @cancel="close" @ok="close('ok')"
  >
    <a-form v-if="props.search.length > 0" layout="inline" :model="state.form" class="modal-form">
      <a-form-item v-for="(item, index) in search" :key="index" :label="item.label">
        <component
          :is="item.component ? item.component : Input" v-model:value="state.form[item.value]"
          :placeholder="item.placeholder ? item.placeholder : '请输入'"
          :options="item.options ? item.options : []"
          :tree-data="item.options ? item.options : []"
          :field="item.field ? item.field : null"
          :field-names="item.fieldNames ? item.fieldNames : null"
          :url="item.url ? item.url : null"
          :params="item.params ? item.params : null" :style="{ width: '218px !important' }" allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="query">查询</a-button>
      </a-form-item>
      <a-form-item>
        <a-button @click="reset">重置</a-button>
      </a-form-item>
    </a-form>
    <a-table
      row-key="id" :data-source="state.dataSource" :columns="columns" :row-selection="rowSelection"
      :pagination="state.pagination" :scroll="{ y: 450 }" size="middle" @change="changePage"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { getCancelAskFromPage } from '@/api/attendance'
import { Input } from 'ant-design-vue'
import type { TablePaginationConfig, TableRowSelection } from 'ant-design-vue/es/table/interface'
import type { Key } from 'ant-design-vue/es/vc-tree-select/interface'
import type { ColumnsType } from 'ant-design-vue/lib/table'
import type { RowSelectionType } from 'ant-design-vue/lib/table/interface'
import { computed, reactive, unref, type Component } from 'vue'

const props = withDefaults(defineProps<{
  activeId?: string[];
  selectedRows?:{id:string;}[];
  title?: string;
  url?: string;
  selectionType?: RowSelectionType;
  search?: { label?: string; component?: string|Component; options?: unknown[]; placeholder?: string; field?: unknown; params?: unknown; url?: string; value: string; defaultValue?: string;fieldNames?:unknown; }[];
  searchParams?:{key:string; value:string|number;}[];
  columns: ColumnsType;
  disabledId?: string[];
}>(), {
  activeId: () => [],
  selectedRows: () => [],
  title: '',
  url: '',
  selectionType: 'radio',
  search: () => [],
  searchParams: () => [],
  columns: () => [],
  disabledId: () => []
});

const emits = defineEmits(['close'])

const state = reactive<{
  modalVisible:boolean;
  dataSource:unknown[];
  selectedRows:{id:string;}[];
  selectedRowKeys:unknown[];
  selected:{id:string;}[];
  form:Record<string, string|undefined>;
  pagination:TablePaginationConfig;
}>({
  modalVisible: false,
  dataSource: [],
  selectedRows: [],
  selectedRowKeys: props.activeId,
  selected: [],
  form: {},
  pagination: {
    total: 0,
    pageSize: 10,
    current: 1
  }
});

const rowSelection = computed(():TableRowSelection => {
  return {
    preserveSelectedRowKeys: true,
    selectedRowKeys: unref(state.selectedRowKeys) as Key[],
    type: props.selectionType,
    onChange: (keys: unknown[], selectedRows: {id:string;}[]) => {
      state.selectedRowKeys = keys;
      selectedRows.forEach((item) => {
        if (item) {
          const index = (state.selectedRows as {id:string;}[]).findIndex(s => s.id === item.id);
          if (index === -1) {
            (state.selectedRows).push(item);
          }
        }
      });
    },
    getCheckboxProps: (row: {id:string;}) => ({
      disabled: props.disabledId.includes(row.id)
    })
  };
});

const getFilter = () => {
  state.selected = []
  state.selectedRows.forEach((item:{id:string;}) => {
    if (state.selectedRowKeys.includes(item.id)) {
      state.selected.push(item)
    }
  });
};

const getData = async () => {
  const searchParams:Record<string, unknown> = {}
  props.searchParams.forEach(e => {
    searchParams[e.key] = e.value
  })
  const formParams = {
    ...state.form,
    ...searchParams,
    date: null,
    pageNumber: state.pagination.current,
    pageSize: state.pagination.pageSize
  };

  const res = await getCancelAskFromPage(formParams)
  if (res?.records) {
    state.dataSource = res?.records ?? [];
    state.pagination.total = res?.total ?? 0;
  } else {
    state.dataSource = res as unknown as unknown[] ?? [];
    state.pagination.total = (res as unknown as unknown[]).length ?? 0;
  }
  getFilter();
};

const show = () => {
  state.selectedRowKeys = props.activeId;
  state.selectedRows = props.selectedRows;
  state.modalVisible = true;
  getData()
};

const close = (data: unknown) => {
  if (data === 'ok') {
    getFilter();
    emits('close', state.selected);
  } else {
    emits('close');
  }
  reset()
  state.modalVisible = false
};
const changePage = (e:TablePaginationConfig) => {
  state.pagination.current = e.current!;
  state.pagination.pageSize = e.pageSize!;
  getData();
};
const reset = () => {
  state.pagination.pageSize = 10
  state.pagination.current = 1
  props.search.forEach((item) => {
    state.form[item.value] = item.defaultValue ? item.defaultValue : undefined;
  });
  getData();
};

const query = () => {
  state.pagination.current = 1;
  getData();
}

defineExpose({
  show
})
</script>

<style lang="less" scoped>
.modal-form {
  margin-bottom: 20px;
}

:deep(.ant-form-inline .ant-form-item) {
  margin-bottom: 10px;
}
</style>
<style lang="less">
.modal-form {
  .ant-form-item {
    margin-bottom: 10px !important;
  }
}

.org-picker-modal {
  .ant-modal-body {
    padding-bottom: 0;
  }
}
</style>
