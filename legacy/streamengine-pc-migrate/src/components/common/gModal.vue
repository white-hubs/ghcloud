<template>
  <a-modal v-model:visible="props.visible" width="1000px" :title="title + '列表'" @cancel="close" @ok="close('ok')" centered
    class="org-picker-modal">
    <!-- <a-form layout="inline" :model="state.form" class="modal-form" v-if="search.length > 0">
      <a-form-item v-for="(item, index) in search" :label="item.label" :key="index">
        <component v-model:value="state.form[item.value]" :is="item.component ? item.component : 'a-input'"
          :placeholder="item.placeholder ? item.placeholder : '请输入'" :options="item.options ? item.options : []"
          :field="item.field ? item.field : null" :url="item.url ? item.url : null"
          :params="item.params ? item.params : null" :style="{ width: '218px !important' }" allowClear></component>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="getData">查询</a-button>
      </a-form-item>
      <a-form-item>
        <a-button @click="reset">重置</a-button>
      </a-form-item>
    </a-form> -->
    <a-table rowKey="id" :dataSource="state.dataSource" :columns="columns" :row-selection="rowSelection"
      :pagination="state.pagination" size="middle" @change="changePage">
    </a-table>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, unref, reactive, watch } from "vue";
import { getStaffPage } from '@/api/staff'
const props = withDefaults(defineProps<{
  visible: boolean;
  activeId?: string[];
  title?: string;
  url?: string;
  selectionType?: string;
  search?: { label: string, component: string, options: any, placeholder: string, field: any, params: any, url: string, value: string }[];
  columns: any[];
  defaultParams?: object
}>(), {
  visible: false,
  activeId: () => { return [] },
  title: '',
  url: '',
  selectionType: '',
  search: () => { return [] },
  columns: () => { return [] },
  defaultParams: () => { return {} }
});

const emits = defineEmits(['close'])

const state = reactive({
  modalVisible: false,
  dataSource: [],
  selectedRows: [],
  selectedRowKeys: props.activeId,
  selected: null,
  form: {},
  pagination: {
    total: 0,
    position: "bottom",
    pageSize: 10,
    current: 1,
  },
});

const rowSelection = computed(() => {
  return {
    selectedRowKeys: unref(state.selectedRowKeys),
    type: props.selectionType,
    onChange: (keys: any, selectedRows: any) => {
      state.selectedRowKeys = keys;
      selectedRows.forEach((item: any) => {
        //@ts-ignore
        const index = state.selectedRows.findIndex((s) => s.id === item.id);
        if (index === -1) {
          //@ts-ignore
          state.selectedRows.push(item);
        }
      });
    },
  };
});
//@ts-ignore
watch(() => props.visible, (n) => {
  if (n) {
    state.selectedRowKeys = props.activeId;
    getData();
  }
});
const getFilter = () => {
  //@ts-ignore
  state.selected = [];
  //@ts-ignore
  state.selected = state.selectedRows.filter((item) => {
    //@ts-ignore
    if (state.selectedRowKeys.indexOf(item.id) > -1) {
      return item;
    }
  });
};
const getData = () => {
  props.search.forEach((item) => {
    if (item.component === "a-range-picker") {
      //@ts-ignore
      if (item.defaultDate) {
        //@ts-ignore
        const date = state.form.date && state.form.date.length > 0 ? [timeFormat(state.form.date[0], false), timeFormat(state.form.date[1], false),] : [];
        if (date.length > 0) {
          //@ts-ignore
          state.form[item.defaultDate] = date.join(",");
        } else {
          //@ts-ignore
          state.form[item.defaultDate] = null;
        }
      }
    }
  });
  const apiContext = {
    'getStaffPage': getStaffPage
  }
  const formParams = {
    ...state.form,
    ...props.defaultParams,
    date: null,
    pageNumber: state.pagination.current,
    pageSize: state.pagination.pageSize,
  };

  if (props.url) {
    //@ts-ignore
    apiContext[props.url](formParams).then((res) => {
      state.dataSource = res.records;
      state.pagination.total = res.total;
      getFilter();
    });
  }
};
const show = () => {
  state.selectedRowKeys = props.activeId;
  state.modalVisible = true;
  getData()
};
const close = (data: string) => {
  if (data === "ok") {
    getFilter();
    emits("close", state.selected);
  } else {
    emits("close");
  }
};
const changePage = (e: { current: number, pageSize: number }) => {
  state.pagination.current = e.current;
  state.pagination.pageSize = e.pageSize;
  getData();
};
const reset = () => {
  props.search.forEach((item) => {
    //@ts-ignore
    state.form[item.value] = item.defaultValue ? item.defaultValue : null;
  });
  getData();
};

</script>

<style lang="less" scoped>
.modal-form {
  margin-bottom: 20px;
}

:deep(.template-form-inline .template-form-item) {
  margin-bottom: 10px;
}
</style>
<style lang="less">
.modal-form {
  .template-form-item {
    margin-bottom: 10px !important;
  }
}
</style>
