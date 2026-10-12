<template>
  <div ref="ctrRef" class="ctr">
    <div class="pb2" ref="searchRef" v-if="searchLength > 0">
      <a-form ref="formRef" :model="form" layout="inline" class="mb2">
        <template v-for="item in search" :key="item.value">
          <a-form-item :label="item.label" :name="item.value">
            <component
              :is="item.component ? item.component : 'a-input'"
              v-model:value="form[item.value]"
              :placeholder="item.placeholder"
              :url="item.url ? item.url : ''"
              :params="item.params ? item.params : {}"
              :options="item?.options ? item.options : null"
              :field="item?.field ? item.field : null"
              @pressEnter="searchForm"
              style="width: 180px"
            ></component>
          </a-form-item>
        </template>
        <a-form-item>
          <a-space :size="16">
            <a-button type="primary" @click="searchForm">查询</a-button>
            <a-button
              type="default"
              v-if="searchLength > 1"
              @click="resetSearch"
              >重置</a-button
            >
          </a-space>
        </a-form-item>
      </a-form>
    </div>
    <a-table
      :loading="loading"
      :columns="columns"
      :dataSource="dataSource"
      :rowKey="rowKey"
      :pagination="false"
      :scroll="{ x: scrollX, y: scrollY }"
      :rowSelection="rowSelection ? selection : null"
      :size="size"
    >
      <template #action="{ record }">
        <a-button
          type="link"
          v-if="btns.includes('detail')"
          @click="detailItem(record)"
          >详情</a-button
        >
        <a-button
          type="link"
          v-if="btns.includes('edit')"
          @click="editItem(record)"
          >编辑</a-button
        >
        <slot name="actionBtn" :record="record"></slot>
        <a-popconfirm
          title="是否删除当前项？"
          @confirm="deleteItem(record)"
          v-if="btns.includes('deleteSingle') && api?.deleteSingle"
        >
          <a-button type="link" danger>删除</a-button>
        </a-popconfirm>
      </template>
    </a-table>
    <div v-if="pagination" class="pagi" ref="pagiRef" :style="pageStyle">
      <!-- :style="pagination && page.total <= 0 ? { height: 32 + 'px' } : null" -->
      <div v-if="pagination && page.total > 0">
        <a-pagination
          :show-size-changer="sizeChanger"
          v-model:current="page.pageNumber"
          v-model:pageSize="page.pageSize"
          :total="page.total"
          :default-current="1"
          :show-total="() => `共 ${page.total} 条数据`"
          @change="onShowSizeChange"
          :size="size"
        ></a-pagination>
      </div>
    </div>
  </div>
</template>

<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  createVNode,
  onMounted,
  reactive,
  computed,
  toRefs,
  watch,
  ref,
  unref,
  nextTick,
} from "vue";

import { useRouter } from "vue-router";
import _ from "lodash";
export default defineComponent({
  name: "TableInModal",
  props: {
    title: {
      type: String,
      default: "列表名称",
    },
    rowKey: {
      type: String,
      default: "id",
    },
    api: {
      type: Object,
      default: () => {
        return {
          list: "",
          deleteSingle: "",
          dellete: "",
          edit: "",
          add: "",
        };
      },
    },
    url: String,
    columns: Array,
    btns: {
      type: Array,
      default: () => {
        return ["detail", "edit", "deleteSingle", "delete"];
      },
    },
    rowSelection: { type: Boolean, default: true },
    search: { type: Array, default: () => [] },
    disabledKeys: { type: Array },
    searchLength: {
      type: Number,
      default: 0,
    },
    scrollX: {
      type: Number,
      default: 600,
    },
    sly: [Number, String],
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    selectType: {
      type: String,
      default: "radio",
    },
    value: {
      type: Boolean,
      default: false,
    },
    pagination: {
      type: Boolean,
      default: true,
    },
    selectedKeys: {
      type: Array,
      default: () => [],
    },
    selectedRows: {
      type: Array,
      default: () => [],
    },
    sizeChanger: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: "small",
    },
    isInModal: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();
    const ctrRef = ref();
    const pagiRef = ref();
    const searchRef = ref();
    const formRef = ref();
    const visible = ref(false);
    const { proxy } = getCurrentInstance();
    const alreadySelected = ref(props.selectedKeys || []);
    const state = reactive({
      dataSource: [],
      dataSourceAll: [],
      form: {},
      page: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      },
      loading: false,
      selectedItem: [],
      disabledList: [],
      scrollY: 100,
      pageStyle: {
        width: "100%",
        textAlign: "right",
        position: props.isInModal ? "relative" : "absolute",
        bottom: "0",
        right: "12px",
        borderTop: props.isInModal ? "none" : "1px solid #f3f3f3",
      },
    });

    const getHeight = () => {
      nextTick(() => {
        state.scrollY = props.sly
          ? props.sly
          : ctrRef.value.clientHeight -
            pagiRef.value.clientHeight -
            searchRef.value.clientHeight;
      });
    };

    const setSearch = () => {
      props.search.forEach((item) => {
        if (!item?.component || item?.component !== "span") {
          Object.assign(state.form, {
            [item.value]:
              item.defaultValue || item.defaultValue === false
                ? item.defaultValue
                : null,
          });
        }
      });
    };

    const getData = () => {
      if (props?.api.list) {
        state.loading = true;
        const params = {
          ...props.params,
          ...state.form,
          pageNumber: state.page.pageNumber,
          pageSize: state.page.pageSize,
        };
        proxy.$api[props.api.list](params, "get")
          .then((res) => {
            if (res && res.records) {
              state.page.total = res.total;
              state.dataSource = res.records;
            } else {
              state.dataSource = res;
            }
          })
          .finally(() => {
            state.loading = false;
          });
      }
    };

    const searchForm = () => {
      state.page.pageNumber = 1;
      getData();
    };

    const onShowSizeChange = (current, pageSize) => {
      state.page.pageNumber = current;
      state.page.pageSize = pageSize;
      getData();
    };

    const getAllData = () => {
      if (props?.api.list) {
        const params = {
          ...props.params,
          pageNumber: 1,
          pageSize: 5000,
        };
        proxy.$api[props.api.list](params, "get").then((res) => {
          if (res && res.records) {
            state.dataSourceAll = res.records;
          } else {
            state.dataSourceAll = res;
          }
        });
      }
    };

    const changeSelected = (selectedRowKeys, selectedRow) => {
      alreadySelected.value = selectedRowKeys; //当前选中的表格keys
      state.selectedItem = selectedRow; //当前选中的表格项
    };

    const onSelectAll = (selected, selectedRows, changeRows) => {
      if (selected) {
        state.selectedItem = state.selectedItem.concat(changeRows);
        alreadySelected.value = state.selectedItem.map(
          (item) => item[props.rowKey]
        );
      } else {
        const changeKeys = changeRows.map((item) => item[props.rowKey]);
        alreadySelected.value = _.difference(alreadySelected.value, changeKeys);
        // state.selectedItem = _.differenceWith(state.selectedItem, changeRows, _.isEqual)
        state.selectedItem = state.selectedItem.filter((item) =>
          alreadySelected.value.includes(item[props.rowKey])
        );
      }
    };

    const onSelect = (record, selected) => {
      if (props.selectType === "checkbox") {
        if (selected) {
          alreadySelected.value.push(record[props.rowKey]);
          // state.selectedItem.push(record);
          // 去重
          alreadySelected.value = _.uniq(alreadySelected.value);
          // state.selectedItem = _.uniqBy(state.selectedItem, "id");
          state.selectedItem = state.dataSourceAll.filter((item) =>
            alreadySelected.value.includes(item[props.rowKey])
          );
        } else {
          alreadySelected.value = alreadySelected.value.filter(
            (item) => item !== record[props.rowKey]
          );
          // state.selectedItem = state.selectedItem.filter(
          //   (item) => item[props.rowKey] !== record[props.rowKey]
          // );
          state.selectedItem = state.dataSourceAll.filter((item) =>
            alreadySelected.value.includes(item[props.rowKey])
          );
        }
      } else {
        state.selectedItem = [record];
        alreadySelected.value = [record[props.rowKey]];
      }
    };

    const selection = computed(() => {
      return {
        type: props.selectType,
        selectedRowKeys: unref(alreadySelected),
        // onChange: changeSelected,
        // 解决翻页数据丢失
        onSelectAll: onSelectAll,
        onSelect: onSelect,
        getCheckboxProps: (record) => ({
          disabled: state.disabledList?.length
            ? state.disabledList?.includes(record[props.rowKey])
            : false,
        }),
        // getCheckboxProps: (record) => {
        //   if (state.disabledList?.length) {
        //     if (state.disabledList.includes(record[props.rowKey])) {
        //       Object.assign(record, { disabled: true });
        //     }
        //     return {
        //       disabled: state.disabledList.includes(
        //         record[props.rowKey] ? true : false
        //       ),
        //     };
        //   }
        //   return {
        //     disabled: state.disabledList.includes(
        //       record[props.rowKey] ? true : false
        //     ),
        //   };
        // },
      };
    });

    const save = () => {
      emit("modal-save", alreadySelected.value, state.selectedItem);
      cancel();
    };

    const cancel = async () => {
      alreadySelected.value = [];
      state.selectedItem = [];
      state.page = { pageSize: 10, pageNumber: 1, total: 0 };
      // 筛选条件清空
      if (formRef?.value) {
        await formRef?.value.resetFields();
      }
      emit("update:value", false);
    };

    const deleteItem = (record) => {
      proxy.$api[props.api.deleteSingle](record[props.rowKey], "delete").then(
        () => {
          proxy.$message.success("操作成功");
          getData();
        }
      );
    };

    const resetSearch = () => {
      setSearch();
      getData();
    };

    const detailItem = (record) => {
      if (props.api?.path) {
        router.push({
          path: props.api.path,
          query: {
            [props.rowKey]: record[props.rowKey] ? record[props.rowKey] : null,
            type: "detail",
          },
        });
      }
    };
    const editItem = (record) => {
      if (props.api?.path) {
        router.push({
          path: props.api.path,
          query: {
            [props.rowKey]: record[props.rowKey] ? record[props.rowKey] : null,
            type: "edit",
          },
        });
      }
    };

    onMounted(() => {
      getData();
      getAllData();
      setSearch();
      getHeight();
      window.onresize = () => {
        getHeight();
      };
    });

    watch(
      () => props.value,
      (n) => {
        visible.value = props.value;
        if (n) {
          alreadySelected.value = _.cloneDeep(props.selectedKeys);
          state.selectedItem = _.cloneDeep(props.selectedRows);
          state.page = { pageSize: 10, pageNumber: 1, total: 0 };
          getData();
        }
      }
    );

    watch(
      () => props.disabledKeys,
      (n) => {
        state.disabledList = n;
      }
    );

    watch(
      () => props.selectedKeys,
      (n) => {
        alreadySelected.value = _.cloneDeep(n);
      }
    );

    return {
      ctrRef,
      formRef,
      pagiRef,
      visible,
      searchRef,
      selection,
      alreadySelected,
      ...toRefs(state),
      onShowSizeChange,
      resetSearch,
      searchForm,
      deleteItem,
      detailItem,
      editItem,
      getData,
      cancel,
      save,
    };
  },
});
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box;
}
.ctr {
  width: 100%;
  height: 100%;
  position: relative;
}
.pagi {
  width: 100%;
  text-align: right;
  position: absolute;
  bottom: 0;
  right: 12px;
  border-top: 1px solid #f3f3f3;
  padding-top: 16px;
}
.ant-input {
  width: 180px;
}
.ant-input-select {
  width: 180px;
}
</style>
