<template>
  <div ref="ctrRef" class="ctr">
    <div class="addBtn" v-if="btns.includes('add')" ref="addBtnRef">
      <a-button type="primary" @click="editItem('')">新增</a-button>
    </div>
    <div class="pb2" ref="searchRef">
      <a-form
        ref="formRef"
        :model="form"
        layout="inline"
        class="mb2"
        v-if="searchLength > 0"
      >
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
        >
          详情
        </a-button>
        <a-button
          type="link"
          v-if="btns.includes('edit')"
          @click="editItem(record)"
        >
          编辑
        </a-button>
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
    <div
      v-if="pagination || rowSelection"
      class="pagi flex-between"
      ref="pagiRef"
      :style="pageStyle"
    >
      <!-- :style="pagination && page.total <= 0 ? { height: 32 + 'px' } : null" -->
      <div class="flex-start" v-if="batchBtn">
        <span>已选{{ alreadySelected?.length }}项</span>
        <div class="pl1">
          <a-space :size="8">
            <slot name="batch-btn" :record="alreadySelected"></slot>
          </a-space>
        </div>
      </div>
      <div v-else></div>
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
    <a-modal
      v-model:visible.sync="modalVisi"
      centered
      :title="(modalTitle ? modalTitle : '') + modalType"
      @ok="saveModal"
      @cancel="cancelModal"
    >
      <a-form ref="modalFormRef" :model="modalForm" :rules="rules">
        <template v-for="f in modal" :key="f.value">
          <a-form-item :label="f.label" :name="f.value">
            <component
              v-model:value="modalForm[f.value]"
              v-model:checked="modalForm[f.value]"
              :imageData="modalForm[f.value]"
              :is="f?.component ? f.component : 'a-input'"
              :placeholder="f.placeholder ? f.placeholder : '请输入'"
              :options="f.options ? f.options : []"
              :format="f.format ? f.format : ''"
              :valueFormat="f.format ? f.format : ''"
              :showTime="f.showTime ? f.showTime : false"
              :showCheckedStrategy="
                f.showCheckedStrategy ? f.showCheckedStrategy : false
              "
              :field="f.field ? f.field : null"
              :url="f.url ? f.url : null"
              :disabled="f.disabled ? f.disabled : false"
              :checked-children="f.checkedValue ? f.checkedValue : '启用'"
              :un-checked-children="
                f.unCheckedValue ? f.unCheckedValue : '禁用'
              "
              :mode="f.mode ? f.mode : false"
              :params="f.params ? f.params : false"
              :suffix="f.suffix ? f.suffix : null"
              :prefix="f.prefix ? f.prefix : null"
              :file="
                f.fileList
                  ? modalForm[f.fileList]
                  : f?.detailValue
                  ? modalForm[f?.detailValue]
                  : []
              "
              :max="f.max ? f.max : 1"
              :maxlength="f?.maxlength"
              :api="f?.api"
              :style="f?.style"
              :labelInValue="f?.labelInValue"
              @change-check="
                (value, option) => f?.changeLabel(value, option, modalForm)
              "
              allowClear
            />
          </a-form-item>
        </template>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
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
    modalTitle: String,
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
    modal: { type: Array, default: () => [] },
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
    rules: Object,
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
    batchBtn: {
      type: Boolean,
      default: false,
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
    editMode: {
      type: String,
      default: "modal",
    },
    isInModal: {
      type: Boolean,
      default: false,
    },
    beforeGet: Boolean,
  },
  setup(props, { emit }) {
    const router = useRouter();
    const ctrRef = ref();
    const pagiRef = ref();
    const searchRef = ref();
    const addBtnRef = ref();
    const modalFormRef = ref();
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
      modalVisi: false,
      modalForm: {},
      modalType: "",
    });

    const getHeight = () => {
      nextTick(() => {
        const tableHead =
          document.getElementsByClassName("ant-table-header")[0];
        state.scrollY = props.sly
          ? props.sly
          : (ctrRef.value ? ctrRef.value?.clientHeight : 0) -
            (pagiRef.value ? pagiRef.value?.clientHeight : 0) -
            (addBtnRef.value ? addBtnRef.value?.clientHeight : 0) -
            (searchRef.value ? searchRef.value?.clientHeight : 0) -
            (tableHead ? tableHead?.clientHeight : 0);
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

    const saveModal = () => {
      modalFormRef.value.validate().then(() => {
        state.modalForm?.id
          ? proxy.$api[props.api.edit](state.modalForm, "put").then(() => {
              proxy.$message.success("操作成功");
              getData();
              cancelModal();
            })
          : proxy.$api[props.api.add](state.modalForm, "post").then(() => {
              proxy.$message.success("操作成功");
              getData();
              cancelModal();
            });
      });
    };
    const cancelModal = async () => {
      await modalFormRef.value.resetFields();
      state.modalVisi = false;
    };

    const setModal = () => {
      props?.modal.forEach((item) => {
        state.modalForm[item.value] =
          item.defaultValue || item.defaultValue === false
            ? item.defaultValue
            : null;
      });
    };

    const getData = (obj) => {
      if (props?.api.list) {
        state.loading = true;
        let params = {
          ...props.params,
          ...state.form,
          pageNumber: state.page.pageNumber,
          pageSize: state.page.pageSize,
          ...obj,
        };
        if (props.beforeGet) {
          params = props.beforeGet(params);
        }
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
          alreadySelected.value = alreadySelected.value.length
            ? alreadySelected.value.filter(
                (item) => item !== record[props.rowKey]
              )
            : [];
          getData();
        }
      );
    };

    const resetSearch = () => {
      setSearch();
      getData();
    };

    const detailItem = (record) => {
      if (props.editMode === "modal") {
        if (props.api.detail === "record") {
          state.modalForm = record;
        } else {
          proxy.$api[props.api.detail](record[props.rowKey], "get").then(
            (res) => {
              state.modalForm = res;
            }
          );
        }
        state.modalVisi = true;
        return;
      }
      if (props.api?.path) {
        function getPushPath() {
          const pathname_arr = location.pathname.split('/')
          pathname_arr[pathname_arr.length - 1] = props.api.path
          const pathname = pathname_arr.join('/').replaceAll('//', '/')
          const query = {
            [props.rowKey]: record[props.rowKey] ? record[props.rowKey] : null,
            type: "detail",
          }
          let queryString = ''
          for (const key in query) {
            if (Object.hasOwnProperty.call(query, key)) {
              const element = query[key];
              if (element) {
                queryString += `${queryString ? '&' : ''}${key}=${element}`
              }
            }
          }
          return `${pathname}${queryString ? '?' + queryString : ''}`
        }
        history.pushState({ current: location.pathname + location.search }, "", getPushPath())
      }
    };

    const editItem = (record) => {
      if (props.editMode === "modal") {
        state.modalType = record ? "编辑" : "新增";
        if (props.api.detail === "record") {
          if (record) {
            state.modalForm = _.cloneDeep(record);
          } else {
            state.modalForm = {};
            setModal();
          }
        } else {
          proxy.$api[props.api.detail](record[props.rowKey], "get").then(
            (res) => {
              state.modalForm = res;
            }
          );
        }
        state.modalVisi = true;
        return;
      }
      if (props.api?.path) {
        function getPushPath() {
          const pathname_arr = location.pathname.split('/')
          pathname_arr[pathname_arr.length - 1] = props.api.path
          const pathname = pathname_arr.join('/').replaceAll('//', '/')
          const query = {
            [props.rowKey]: record[props.rowKey] ? record[props.rowKey] : null,
            type: "edit",
          }
          let queryString = ''
          for (const key in query) {
            if (Object.hasOwnProperty.call(query, key)) {
              const element = query[key];
              if (element) {
                queryString += `${queryString ? '&' : ''}${key}=${element}`
              }
            }
          }
          return `${pathname}${queryString ? '?' + queryString : ''}`
        }
        history.pushState({ current: location.pathname + location.search }, "", getPushPath())
      }
    };

    onMounted(() => {
      getData();
      getAllData();
      setSearch();
      getHeight();
      setModal();
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
      addBtnRef,
      searchRef,
      selection,
      modalFormRef,
      alreadySelected,
      ...toRefs(state),
      onShowSizeChange,
      cancelModal,
      resetSearch,
      searchForm,
      deleteItem,
      detailItem,
      saveModal,
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
  .addBtn {
    text-align: right;
  }
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
