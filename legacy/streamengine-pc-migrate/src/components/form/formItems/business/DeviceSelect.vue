<template>
  <div class="object-select">
    <a-select
      :value="state.selected.map((e) => e.id)"
      mode="multiple"
      @change="handleChange"
      :open="false"
      v-if="!props.readonly"
    >
      <a-select-option :value="item.id" v-for="item in state.selected" :key="item.id">{{
        item.name
      }}</a-select-option>
    </a-select>
    <span v-else>{{
      props.modelValue && props.modelValue.length && (props.modelValue[0].name || "--")
    }}</span>
    <a-button type="primary" @click="open" v-if="!props.readonly">请选择</a-button>
    <a-modal
      v-model:visible="modalVisible"
      :width="1200"
      title="选择对象"
      @cancel="modalVisible = false"
      @ok="ok"
      centered
      class="org-picker-modal"
      v-if="!props.readonly && props.outSource"
    >
      <a-form
        layout="inline"
        class="modal-form"
        v-if="modalSearch.length > 0"
        style="margin-bottom: 15px"
      >
        <a-form-item
          v-for="(item, index) in modalSearch"
          :label="item.label"
          :key="index"
        >
          <component
            v-model:value="formState[item.value]"
            :is="item.component ? item.component : 'a-input'"
            :placeholder="item.placeholder ? item.placeholder : '请输入'"
            :options="item.options ? item.options : []"
            :treeData="item.options ? item.options : []"
            :field="item.field ? item.field : null"
            :url="item.url ? item.url : null"
            :fieldNames="item.fieldNames ? item.fieldNames : null"
            :params="item.params ? item.params : null"
            :disabled="item.disabled ? item.disabled : false"
            :style="{ width: '218px !important' }"
            allowClear
          ></component>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="query">查询</a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
      <a-table
        rowKey="id"
        :dataSource="dataSource"
        :columns="!outSource ? modalColumnsO : modalColumns"
        :row-selection="rowSelection"
        :pagination="pagination"
        :scroll="{ y: 450 }"
        size="small"
        @change="changePage"
        :loading="loading"
      >
      </a-table>
    </a-modal>
    <DeviceModalTable
      ref="deviceModalTableRef"
      @ok="deviceModalOnOk"
      :value="state.selected"
      :multiple="false"
    />
  </div>
</template>
<script lang="tsx" setup>
import { deptList } from "@/api/ouaa";
import { computed, onMounted, reactive, ref, unref } from "vue";
import PopOver from "@/components/common/PopOver.vue";
import { getODeviceList } from "@/api/device/index";
import { getAreaList } from "@/api/mdata";
import { DeviceModalTable } from "@ghcloud/generic-component";

type IdName = {
  id: string;
  name: string;
};
const emits = defineEmits(["update:modelValue", "clearValidate"]);
const props = withDefaults(
  defineProps<{
    modelValue?: IdName[] | null;
    readonly?: boolean;
    params: string;
    outSource: boolean;
    formData: Record<string, any>;
  }>(),
  {
    modelValue: null,
    readonly: false,
    outSource: false,
  }
);
const deviceModalTableRef = ref();

const modalVisible = ref(false);
const depSelectOptions = ref([]);
const areaOptions = ref([]);
const deviceTypeOptions = ref<IdName[]>([]);

const loading = ref(false);
const formState = ref<Record<string, any>>({});
const dataSource = ref([]);
const pagination = ref({
  total: 0,
  position: "bottom",
  pageSize: 10,
  current: 1,
});
const state = reactive<{
  selectedRows: IdName[];
  selectedRowKeys: string[];
  selected: IdName[];
}>({
  selectedRows: [],
  selectedRowKeys: [],
  selected: [],
});

const modalSearch = computed(() => {
  const res: any[] = [];

  if (!props.outSource) {
    res.push({
      label: "设备类型",
      placeholder: "请选择",
      value: "genreId",
      component: "a-select",
      options: deviceTypeOptions.value,
      fieldNames: { label: "name", value: "id", children: "children" },
    });
    res.push({
      label: "部门",
      placeholder: "请选择",
      value: "departmentId",
      component: "a-tree-select",
      options: depSelectOptions.value,
      fieldNames: { label: "name", value: "id", children: "children" },
    });
  }
  res.push({
    label: "",
    placeholder: "请输入名称",
    value: "keyword",
  });
  return res;
});
const modalColumns = computed(() => {
  const typeName = {
    title: "类别2",
    dataIndex: "deviceCategory",
    align: "left",
    customRender: ({ text }: any) => {
      return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
    },
  };
  const areaName = {
    title: "区域",
    dataIndex: "areaName",
    align: "left",
    customRender: ({ text }: any) => {
      return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
    },
  };

  typeName.dataIndex = "genreName";
  const res = [
    {
      title: "序号",
      dataIndex: "key",
      align: "center",
      customRender: ({ index }: any): string => {
        return index + 1;
      },
      width: 100,
    },
    {
      title: "名称",
      dataIndex: "deviceName",
      align: "left",
      customRender: ({ text }: any) => {
        return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
      },
    },
    {
      title: "类别",
      dataIndex: "deviceCategory",
      align: "left",
      customRender: ({ text }: any) => {
        return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
      },
    },

    areaName,
  ];
  return res;
});
const modalColumnsO = computed(() => {
  const dep = {
    title: "部门",
    dataIndex: "receiveDepName",
    align: "left",
    customRender: ({ text }: any) => {
      return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
    },
  };
  const typeName = {
    title: "类别",
    dataIndex: "typeName",
    align: "left",
    customRender: ({ text }: any) => {
      return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
    },
  };
  const areaName = {
    title: "区域",
    dataIndex: "areaName",
    align: "left",
    customRender: ({ text }: any) => {
      return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
    },
  };

  dep.dataIndex = "departmentName";
  typeName.dataIndex = "genreName";
  const res = [
    {
      title: "序号",
      dataIndex: "key",
      align: "center",
      customRender: ({ index }: any): string => {
        return index + 1;
      },
      width: 100,
    },
    {
      title: "名称",
      dataIndex: "name",
      align: "left",
      customRender: ({ text }: any) => {
        return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
      },
    },
    typeName,
    dep,
    areaName,
  ];
  return res;
});
const rowSelection = computed(() => {
  return {
    preserveSelectedRowKeys: true,
    selectedRowKeys: unref(state.selectedRowKeys),
    type: "radio",
    onChange: (keys: any, selectedRows: any) => {
      state.selectedRowKeys = keys;
      selectedRows.forEach((item: any) => {
        if (item) {
          const index = state.selectedRows.findIndex(
            (s: { id: string }) => s.id === item.id
          );
          if (index === -1) {
            state.selectedRows.push(item as never);
          }
        }
      });
    },
  };
});

const getFilter = () => {
  state.selected = [];
  state.selected = state.selectedRows.filter((item: { id: string }) => {
    if (state.selectedRowKeys.indexOf(item.id as never) > -1) {
      return item;
    }
  });
};
const getData = async () => {
  const formParams: Record<string, string | number | boolean> = {
    ...formState.value,
    pageNumber: pagination.value.current,
    pageSize: pagination.value.pageSize,
    enabled: true,
  };

  try {
    loading.value = true;
    if (props.outSource) {
      await getODeviceList({ ...formParams }).then((res: any) => {
        dataSource.value =
          res.records.map(
            (item: { deviceId: string; deviceCode: string; deviceName: string }) => {
              return {
                ...item,
                id: item.deviceId,
                code: item.deviceCode,
                name: item.deviceName,
              };
            }
          ) ?? [];
        pagination.value.total = res.total;
      });
    }

    getFilter();
  } catch (error) {
    loading.value = false;
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 300);
  }
};
const changePage = (e: { current: number; pageSize: number }) => {
  pagination.value.current = e.current;
  pagination.value.pageSize = e.pageSize;
  getData();
};
const reset = () => {
  modalSearch.value.forEach((item) => {
    formState.value[item.value] = item.defaultValue ? item.defaultValue : null;
  });
  pagination.value.current = 1;
  pagination.value.pageSize = 10;
  getData();
};
const query = () => {
  pagination.value.current = 1;
  getData();
};

const open = () => {
  if (props.outSource) {
    state.selectedRowKeys = state.selected.map((e) => e.id);
    state.selectedRows = state.selected;
    modalVisible.value = true;
    reset();
  } else {
    deviceModalTableRef.value?.openModal();
  }
};
const emitValue = () => {
  const value = state.selected.map((e: { id: string; name: string }) => {
    return {
      id: e.id,
      name: e.name,
    };
  });
  emits("update:modelValue", value);
  emits("clearValidate");
};
// 弹窗确定事件
const ok = () => {
  getFilter();
  emitValue();
  modalVisible.value = false;
};
const deviceModalOnOk = (values: { id: string; name: string }[]) => {
  state.selected = values;
  emitValue();
};

const handleChange = (val: string) => {
  state.selected = state.selected.filter(
    (item: { id: string }) => val.indexOf(item.id) > -1
  );
  emitValue();
};

onMounted(async () => {
  if (props.outSource && !props.readonly) {
    deptList({}).then((res) => {
      depSelectOptions.value = res;
    });
    getAreaList().then((res) => {
      areaOptions.value = res;
    });
  }
  if (props.modelValue) {
    state.selected = props.modelValue;
  }
});
</script>
<style lang="less">
.object-select {
  display: flex;
}
</style>
