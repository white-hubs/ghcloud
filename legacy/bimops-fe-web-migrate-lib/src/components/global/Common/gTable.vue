<template>
  <gLayout :title="title">
    <template #content-left>
      <slot name="content-left" />
    </template>
    <template #content-data>
      <slot name="content-data" />
    </template>
    <template #header-btn>
      <slot
        name="header-btns"
        :record="{
          selectedRowKeys: selectedRowKeys,
          dataSource: dataSource,
        }"
      />
      <a-button type="primary" v-if="btns.indexOf('add') > -1" @click="operationRecord('add')"> 新增 </a-button>
    </template>
    <template #content-search>
      <a-form layout="inline" :model="form" v-if="search.length > 0">
        <slot name="pre-item" :record="form"></slot>
        <template v-for="(item, index) in search" :key="index">
          <a-form-item :label="item.label" v-if="((moreSearch || index < 4) && item.component !== 'span') || !isShowMore">
            <component
              v-model:value="form[item.value]"
              :is="item.component ? item.component : 'a-input'"
              v-bind="searchFieldAttrs(item)"
              @pressEnter="searchRecord"
            ></component>
          </a-form-item>
        </template>
        <slot name="behind-item" :record="form"></slot>
        <a-form-item>
          <a-button type="primary" @click="searchRecord">查询</a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="reset">重置</a-button>
        </a-form-item>
        <a-form-item>
          <slot name="behind" :record="form"></slot>
        </a-form-item>
      </a-form>
      <div class="more-search">
        <a-button type="link" @click="showMore" v-if="search.filter((f) => f.component !== 'span').length >= 4 && isShowMore">
          {{ !moreSearch ? "更多" : "收起" }}
          <UpOutlined v-if="moreSearch"></UpOutlined>
          <DownOutlined v-else></DownOutlined>
        </a-button>
      </div>
    </template>
    <template #statistic-data>
      <slot name="statistic-data" />
    </template>
    <template #content-table>
      <a-table
        :rowKey="rowKey"
        :row-selection="
          rowSelection
            ? {
                selectedRowKeys: selectedRowKeys,
                preserveSelectedRowKeys: preserveSelectedRowKeys,
                onChange: onSelectChange,
                getCheckboxProps: getCheckboxProps,
              }
            : null
        "
        :columns="dataColumns"
        :data-source="dataSource"
        :pagination="false"
        :loading="loading"
        size="small"
        :scroll="{ y: scrollY, x: calcScrollX }"
        id="listTable"
        @change="changeTable"
        class="g-table-legacy"
      >
        <template v-for="(item, index) in slots" #[item.slot]="{ record }" :key="index">
          <component
            :is="item.component ? item.component : 'a-input'"
            v-model:checked="record[item.slot]"
            @click="slotRecord(item.slot, record)"
            :checked-children="item.checkedValue ? item.checkedValue : '启用'"
            :un-checked-children="item.unCheckedValue ? item.unCheckedValue : '禁用'"
            :disabled="record[item.slot] == null ? true : false"
          ></component>
        </template>
        <template #action="{ record }">
          <slot name="beforeBtn" :record="record"></slot>
          <span class="action-btn">
            <a-button
              type="link"
              v-if="btns.indexOf('detail') > -1"
              @click="operationRecord('detail', record)"
              :disabled="btnDisabled.detail ? btnDisabled.detail(record) : false"
            >
              详情
            </a-button>
            <a-button
              type="link"
              v-if="btns.indexOf('edit') > -1"
              @click="operationRecord('edit', record)"
              :disabled="btnDisabled.edit ? btnDisabled.edit(record) : false"
            >
              编辑
            </a-button>
            <slot name="btn" :record="record" />
            <a-popconfirm
              title="是否删除当前选中？"
              cancelText="取消"
              okText="确定"
              @confirm.stop="deleteRecord(record)"
              v-if="api.deleteSingle && btns.indexOf('deleteSingle') > -1"
              :disabled="btnDisabled.deleteSingle ? btnDisabled.deleteSingle(record) : false"
            >
              <a-button class="deleteRow" type="link" danger @click.stop=""> 删除 </a-button>
            </a-popconfirm>
            <slot name="more" :record="record" />
          </span>
        </template>
      </a-table>
    </template>
    <template #footer-btn>
      <span v-if="rowSelection">已选{{ selectedRowKeys.length }}项</span>
      <a-button
        type="danger"
        v-if="rowSelection && btns.indexOf('delete') > -1"
        @click="deleteRecord(false)"
        :disabled="selectedRowKeys.length === 0"
      >
        删除
      </a-button>
      <slot name="batch" :record="selectedRowKeys"></slot>
      <slot
        name="table"
        :record="{
          selectedRowKeys: selectedRowKeys,
          dataSource: dataSource,
        }"
      ></slot>
    </template>
    <template #footer-page>
      <a-pagination
        show-size-changer
        v-if="page.total > 0"
        v-model:pageSize="page.pageSize"
        v-model:current="page.pageNumber"
        :total="page.total"
        :default-current="1"
        :show-total="(total) => `共 ${total} 条数据`"
        @change="onShowSizeChange"
        @showSizeChange="onShowSizeChange"
      ></a-pagination>
    </template>
    <a-modal
      v-model:visible.sync="modalVisible"
      width="600px"
      :title="modalName"
      @ok="submitModal"
      :confirm-loading="confirmLoading"
      centered
      @cancel="closeModal"
      :okButtonProps="okButtonProps"
    >
      <a-form :model="modalForm" :rules="rules" ref="formRef" :label-col="{ span: 4 }">
        <template v-for="item in modal">
          <a-form-item
            :label="item.label"
            :name="item.value"
            v-if="item.showCondition ? item.showCondition(modalForm) : true"
            :key="item.value"
          >
            <component
              v-model:value="modalForm[item.value]"
              v-model:checked="modalForm[item.value]"
              :is="item.component ? item.component : 'a-input'"
              v-bind="modalFieldAttrs(item)"
              :disabled="item.disabled ? item.disabled : operation === 'detail'"
              :checked-children="item.checkedValue ? item.checkedValue : '启用'"
              :un-checked-children="item.unCheckedValue ? item.unCheckedValue : '禁用'"
              :style="item?.style ? item?.style : null"
            ></component>
          </a-form-item>
        </template>
      </a-form>
    </a-modal>
    <CubeCustomTableColumnModal
      v-model:visible="tableColumnVisible"
      :columns="
        columns
          ? columns.map((e) => {
              return {
                ...e,
                code: e.dataIndex,
              };
            })
          : []
      "
      :applicationCode="applicationCode"
      :tableCode="tableCode"
      @save="getAliasConfig"
      @error="errorMsg"
    >
    </CubeCustomTableColumnModal>
  </gLayout>
</template>

<script>
import { UpOutlined, DownOutlined, SettingOutlined } from "@ant-design/icons-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import dayjs from "dayjs";
import moment from "moment";
import { createVNode, defineComponent, onMounted, computed, toRefs, getCurrentInstance, reactive, ref, nextTick, watch, h } from "vue";

import { initAliasManagePluginAuth, getAliasTableColumn, CubeCustomTableColumnModal } from "@ghcloud/cube-business-alias-manage-plugin";
import { queryParameter } from "@ghcloud/cube-utils";

import gLayout from "./gLayout.vue";

export default defineComponent({
  name: "gTable",
  components: {
    UpOutlined,
    DownOutlined,
    gLayout,
    CubeCustomTableColumnModal,
  },
  props: {
    title: {
      type: String,
      default: "列表名称",
    },
    /*新增/编辑/详情默认弹框名称*/
    modalTitle: {
      type: String,
      default: "",
    },
    /*表格行key的取值*/
    rowKey: {
      type: String,
      default: "id",
    },
    /*控制表格第一列选择框显示*/
    rowSelection: {
      type: Boolean,
      default: false,
    },
    /*数据刷新后是否保留已选行，支持跨页选择*/
    preserveSelectedRowKeys: {
      type: Boolean,
      default: false,
    },
    /*控制table组件新增/编辑/详情等操作,是通过默认弹框(modal),还是通过跳转新页面(page)或者自定义(custom)进行*/
    editMode: {
      type: String,
      default: "modal",
    },
    pagination: {
      type: Object,
      default: () => {
        return {
          pageNumber: 1,
          pageSize: 10,
        };
      },
    },
    // 批量处理参数名
    paramsKey: {
      type: String,
      default: "ids",
    },
    /*本组件需要用上的接口*/
    api: {
      type: Object,
      default: () => {
        return {
          list: null,
          delete: null,
          add: null,
          edit: null,
          detail: null,
          path: null, //详情页面路由
        };
      },
    },
    /*搜索表单{label:'a-form-item的label标签的文本',model:'用于查询传的参数',component:'a-form-item下组件,默认为a-input',placeholder:'component默认提示文字'}*/
    search: {
      type: Array,
      default: () => {
        return [];
      },
    },
    /*新增表单{label:'表单名称',value:'参数',component:'组件',placeholder:'文字提示'}*/
    modal: {
      type: Array,
      default: () => {
        return [];
      },
    },
    /*表格*/
    columns: {
      type: Array,
      default: () => {
        return [];
      },
    },
    /*新增表单验证规则*/
    rules: {
      type: Object,
      default: () => {
        return {};
      },
    },
    /*默认按钮的显示隐藏*/
    btns: {
      type: Array,
      default: () => {
        return ["add", "detail", "edit", "delete", "deleteSingle"];
      },
    },
    /*table中按钮点击状态*/
    btnDisabled: {
      type: Object,
      default: () => {
        return {
          detail: null,
          edit: null,
          deleteSingle: null,
        };
      },
    },
    /*table中的插槽组件*/
    slots: {
      type: Array,
      default: () => {
        return [];
      },
    },
    beforeGet: {
      type: Function,
      default: null,
    },
    beforeSave: {
      type: Function,
      default: null,
    },
    tableCheckbox: {
      type: Function,
      default: null,
    },
    scrollX: {
      type: Number,
      default: 1500,
    },
    // 是否展示更多
    isShowMore: {
      type: Boolean,
      default: true,
    },
    // 是否缓存搜索条件
    searchCache: {
      type: Boolean,
      default: true,
    },
    // 自定义搜索模型（例如 pre-item 插槽里手写的表单字段）
    // 传入后会与内置 search 一起参与缓存与回显
    extraSearchModel: {
      type: Object,
      default: null,
    },
    applicationCode: {
      type: String,
      default: JSON.parse(sessionStorage.getItem("GH-currentApplication")).code,
    },
    tableCode: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    /**
     * 弹层容器：必须留在 ConfigProvider 子树内。挂 document.body 时部分场景下 inject('localeData') 拿不到，
     * DatePicker 会得到 locale.lang 为 undefined，进而在 dayjs 的 parseLocale(undefined) 里触发 .split 报错。
     */
    const SEARCH_POPUP_HOST_COMPONENTS = new Set([
      "a-range-picker",
      "a-date-picker",
      "a-month-picker",
      "a-quarter-picker",
      "a-week-picker",
      "a-time-picker",
      "a-time-range-picker",
      "g-select",
      "gSelect",
      "a-select",
      "a-tree-select",
      "a-cascader",
      "g-cascader",
      "a-auto-complete",
    ]);
    const searchPopupContainer = (item) => {
      if (item.getPopupContainer) {
        return item.getPopupContainer;
      }
      const c = item.component;
      if (!c || !SEARCH_POPUP_HOST_COMPONENTS.has(c)) {
        return undefined;
      }
      return (triggerNode) => {
        if (!triggerNode || !triggerNode.closest) {
          return document.body;
        }
        return triggerNode.closest(".g-layout-container") || triggerNode.closest(".layout-content") || document.body;
      };
    };
    const searchFieldAttrs = (item) => {
      const c = item.component || "a-input";
      const widthStyle = { width: item.width ? item.width : "218px" };
      const popup = {};
      const gpc = searchPopupContainer(item);
      if (gpc) {
        popup.getPopupContainer = gpc;
      }
      if (c === "a-range-picker" || c === "a-date-picker") {
        const fmt = item.valueFormat || item.format || "YYYY-MM-DD";
        return {
          ...popup,
          style: widthStyle,
          placeholder: item.placeholder,
          dropdownStyle: item.dropdownStyle ?? {},
          format: item.format ?? fmt,
          valueFormat: item.valueFormat ?? fmt,
        };
      }
      if (c === "a-month-picker" || c === "a-quarter-picker" || c === "a-week-picker") {
        const fmt = item.valueFormat || item.format || (c === "a-month-picker" ? "YYYY-MM" : "YYYY-MM-DD");
        return {
          ...popup,
          style: widthStyle,
          placeholder: item.placeholder,
          dropdownStyle: item.dropdownStyle ?? {},
          format: item.format ?? fmt,
          valueFormat: item.valueFormat ?? fmt,
        };
      }
      if (c === "a-time-picker" || c === "a-time-range-picker") {
        return {
          ...popup,
          style: widthStyle,
          placeholder: item.placeholder,
          dropdownStyle: item.dropdownStyle ?? {},
        };
      }
      return {
        ...popup,
        style: widthStyle,
        maxlength: 40,
        placeholder: item.placeholder ? item.placeholder : "请输入",
        options: item.options ? item.options : [],
        field: item.field ? item.field : null,
        url: item.url !== null ? item.url : null,
        params: item.params ? item.params : {},
        dropdownStyle: item.dropdownStyle ?? {},
        showSearch: item.showSearch ?? false,
      };
    };
    /** 弹窗表单内动态组件：与查询区一致挂载弹层，并补齐日期类 valueFormat */
    const modalFieldAttrs = (item) => {
      const c = item.component || "a-input";
      const popup = {};
      const gpc = searchPopupContainer(item);
      if (gpc) {
        popup.getPopupContainer = gpc;
      }
      if (c === "a-range-picker" || c === "a-date-picker") {
        const fmt = item.valueFormat || item.format || "YYYY-MM-DD HH:mm:ss";
        return {
          ...popup,
          placeholder: item.placeholder,
          format: item.format ?? fmt,
          valueFormat: item.valueFormat ?? fmt,
        };
      }
      if (c === "a-month-picker" || c === "a-quarter-picker" || c === "a-week-picker") {
        const fmt = item.valueFormat || item.format || (c === "a-month-picker" ? "YYYY-MM" : "YYYY-MM-DD");
        return {
          ...popup,
          placeholder: item.placeholder,
          format: item.format ?? fmt,
          valueFormat: item.valueFormat ?? fmt,
        };
      }
      if (c === "a-time-picker" || c === "a-time-range-picker") {
        return {
          ...popup,
          placeholder: item.placeholder,
        };
      }
      return {
        ...popup,
        placeholder: item.placeholder != null ? item.placeholder : "请输入",
        options: item.options != null ? item.options : null,
        url: item.url != null ? item.url : null,
        field: item.field != null ? item.field : null,
        mode: item.mode != null ? item.mode : null,
        params: item.params != null ? item.params : null,
        maxlength: item.maxlength != null ? item.maxlength : 40,
        showCount: item.showCount != null ? item.showCount : null,
        autoSize: true,
      };
    };
    const dataColumns = ref([]);
    const formRef = ref();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      okButtonProps: {
        style: "",
      },
      dataSource: [],
      selectedRowKeys: [],
      confirmLoading: false,
      selectedRows: [],
      scrollY: 500,
      modalVisible: false,
      moreSearch: false,
      loading: false,
      operation: "add",
      modalName: "新增",
      form: {},
      modalForm: {},
      page: {
        pageSize: props.pagination.pageSize,
        pageNumber: 1,
        total: 0,
      },
      sorter: { item: null, sort: null },
      searchNum: 0,
      tableColumnVisible: false,
    });

    const getSearchItemMap = () => {
      const map = {};
      props.search.forEach((item) => {
        map[item.value] = item;
      });
      return map;
    };

    const normalizeRangePickerValue = (item, value) => {
      if (!Array.isArray(value)) return value;
      if (!item?.valueFormat && !item?.format) {
        return value.map((v) => {
          if (v && typeof v.format === "function") return v;
          const text = `${v}`;
          return dayjs(text.length > 10 ? text.slice(0, 10) : text);
        });
      }
      const valueFormat = item.valueFormat || item.format;
      return value.map((v) => {
        if (v && typeof v.format === "function") return v.format(valueFormat);
        if (typeof v !== "string") return v;
        const parsed = dayjs(v);
        return parsed.isValid() ? parsed.format(valueFormat) : v;
      });
    };

    const decodeCacheValue = (item, value) => {
      if (value == null) return value;
      if (item?.component === "a-range-picker" && typeof value === "string") {
        const list = value.split(",").filter(Boolean);
        return normalizeRangePickerValue(item, list);
      }
      if (item?.component === "a-range-picker" && Array.isArray(value)) {
        return normalizeRangePickerValue(item, value);
      }
      // g-cascader / a-cascader 的值是数组，URL 中序列化为逗号分隔字符串，回填时恢复为数组
      if ((item?.component === "g-cascader" || item?.component === "a-cascader") && typeof value === "string") {
        return value.split(",").filter(Boolean);
      }
      return value;
    };

    const syncQueryCache = (params = {}) => {
      if (!props.searchCache) return;
      const rawQuery = {
        ...params,
        ...state.form,
        ...(props.extraSearchModel || {}),
        pageNumber: state.page.pageNumber,
        pageSize: state.page.pageSize,
      };
      const compactQuery = {};
      const searchItemMap = getSearchItemMap();
      Object.keys(rawQuery).forEach((key) => {
        let value = rawQuery[key];
        if (value === null || value === undefined || value === "") return;
        if (Array.isArray(value) && value.length === 0) return;
        // 默认第一页不写入地址栏，减少冗余参数
        if (key === "pageNumber" && Number(value) === 1) return;
        const item = searchItemMap[key];
        if (item?.component === "a-range-picker" && Array.isArray(value)) {
          value = value.map((v) => {
            if (typeof v === "string") return v.length > 10 ? v.slice(0, 10) : v;
            if (v && typeof v.format === "function") return v.format("YYYY-MM-DD");
            const s = String(v);
            return s.length > 10 ? s.slice(0, 10) : s;
          });
        }
        compactQuery[key] = value;
      });
      queryParameter.setAddressQuery(compactQuery);
    };

    /*获取table高度*/
    const getScrollY = (data) => {
      const layoutContentHeight = document.getElementsByClassName("layout-content")[0];
      const contentSearchHeight = document.getElementsByClassName("content-search")[0];
      const contentDataHeight = document.getElementsByClassName("content-data")[0];
      const contentStatisticHeight = document.getElementsByClassName("statistic-data")[0];
      const tableBody = document.getElementsByClassName("content-table")[0];
      if (!layoutContentHeight || !contentSearchHeight || !contentDataHeight || !contentStatisticHeight || !tableBody) {
        return;
      }
      state.scrollY =
        layoutContentHeight.offsetHeight -
        contentSearchHeight.offsetHeight -
        contentDataHeight.offsetHeight -
        contentStatisticHeight.offsetHeight -
        50;
      tableBody.style.height = data && data.length === 0 ? "0px" : state.scrollY + "px";
    };

    /*获取数据列表*/
    const getData = (obj) => {
      props.search.forEach((item) => {
        if (item.component === "a-range-picker") {
          if (item.defaultDate) {
            const valueKey = item.value;
            const currentValue =
              state.form[valueKey] && state.form[valueKey].length > 0
                ? state.form[valueKey]
                : item.date && item.date.length > 0
                  ? item.date
                  : null;
            if (currentValue && currentValue.length > 0) {
              const dateStrs = [
                moment(currentValue[0]).format("YYYY-MM-DD 00:00:00"),
                moment(currentValue[1]).format("YYYY-MM-DD 23:59:59"),
              ];
              state.form[item.defaultDate] = dateStrs.join(",");
              // 查询后仍保持 RangePicker 声明的模型类型和格式，避免回显后无法再次打开面板。
              state.form[valueKey] = normalizeRangePickerValue(item, currentValue);
            } else {
              state.form[item.defaultDate] = null;
              state.form[valueKey] = null;
            }
          }
        }
        if (item.component === "g-cascader") {
          if (item.defaultData) {
            if (item.valueType === "string") {
              state.form[item.defaultData] =
                state.form.cascaderIds && state.form.cascaderIds.length ? state.form.cascaderIds.join(",") : "";
            } else if (item.valueType === "number") {
              state.form[item.defaultData] =
                state.form.cascaderIds && state.form.cascaderIds ? state.form.cascaderIds[state.form.cascaderIds.length - 1] : "";
            } else {
              state.form[item.defaultData] = state.form.cascaderIds;
            }
          }
        }
        if (item.component === "g-select") {
          if (item.defaultDate == undefined) return;
          if (state.form[item.value] == null) {
            state.form[item.value] = item?.defaultDate;
          }
          if (state.form[item.value] == item?.defaultDate) {
            state.form[item.value] = item?.defaultDate;
          }
          //
        }
      });
      const formParams = {
        ...state.form,
        date: null,
        cascaderIds: null,
        ...obj,
        ...state.sorter,
      };

      if (props.api.list) {
        state.loading = true;
        let params = {
          ...formParams,
          pageNumber: state.page.pageNumber,
          pageSize: state.page.pageSize,
        };
        if (props.beforeGet) {
          params = props.beforeGet(params);
        }
        syncQueryCache(params);
        proxy.$api[props.api.list](params, "get").then((res) => {
          state.loading = false;
          if (res.records) {
            state.page.total = res.total;
            state.dataSource = res.records;
          } else {
            state.dataSource = res;
          }

          if (!props.preserveSelectedRowKeys) {
            clearSelection();
          }
          getScrollY(state.dataSource);
          if (state.page.pageNumber > 1 && state.dataSource.length === 0) {
            searchRecord();
          }
        });
      }
    };
    /*搜索表单*/
    const resetSearch = () => {
      props.search.forEach((item) => {
        state.form[item.value] = item.defaultValue || item.defaultValue === false ? item.defaultValue : null;
      });
      state.searchNum = props.search.filter((item) => item.component !== "span").length;
    };
    /*弹框表单*/
    const resetModal = () => {
      props.modal.forEach((item) => {
        state.modalForm[item.value] = item.defaultValue ? item.defaultValue : null;
      });
    };
    const calcScrollX = computed(() => {
      const sum = dataColumns.value.reduce((acc, cur) => {
        let w = cur.width;
        if (Object.prototype.toString.call(w) === "[object String]") {
          w = w.replace(/[^\d]/g, "");
        }
        const n = Number(w ?? 180);
        return acc + (Number.isFinite(n) && n >= 0 ? n : 180);
      }, 0);
      /* props.scrollX 默认 1500，不能用 ?? 否则永远取 props、列宽累加失效 */
      return sum > 0 ? Math.max(sum, props.scrollX) : props.scrollX;
    });
    const getAliasConfig = async () => {
      initAliasManagePluginAuth({
        tenant: JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code,
        token: JSON.parse(sessionStorage.getItem("GH-Token")).access_token,
      });
      if (props.columns && props.columns.length > 0) {
        dataColumns.value = props.columns.map((item, index) => {
          if (item.title == "序号") {
            item = {
              ...item,
              dataIndex: item.dataIndex ?? "table-index",
              title: "序号",
              slots: {
                customRender: "",
              },
              customRender: ({ text, index }) => {
                return index + 1 + (state.page.pageNumber - 1) * state.page.pageSize;
              },
            };
          }
          if (props.columns.length > 7) {
            if (index < 2) {
              return {
                ...item,
                width: item.width ? item.width : 150,
                ellipsis: false,
              };
            } else if (index === props.columns.length - 1) {
              return {
                ...item,
                width: item.width ? item.width : 150,
              };
            } else {
              return {
                ...item,
                width: item.width ? item.width : 150,
                ellipsis: item.ellipsis ? item.ellipsis : true,
              };
            }
          }
          const ellipsis = index === props.columns.length - 1 ? false : true;
          return {
            ...item,
            width: item.width ? item.width : 150,
            ellipsis: item.fixed ? false : ellipsis,
            fixed: item.fixed ? item.fixed : null,
          };
        });
      }
      if (props.tableCode && props.applicationCode && dataColumns.value.length) {
        await getAliasTableColumn({
          tableCode: props.tableCode,
          applicationCode: props.applicationCode,
          columns: dataColumns.value.map((e) => {
            return {
              ...e,
              code: e.dataIndex,
            };
          }),
        }).then((res) => {
          dataColumns.value = res.columns;
        });
        if (dataColumns.value.length) {
          const lastIndex = dataColumns.value.length - 1;
          const originalTitle = dataColumns.value[lastIndex].title;
          dataColumns.value[lastIndex].title = h(
            "div",
            {
              style: {
                display: "inline-flex",
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "start",
              },
            },
            [
              h("span", { style: { minWidth: 0 } }, originalTitle),
              h(SettingOutlined, {
                style: { marginLeft: "8px", cursor: "pointer" },
                onClick: () => {
                  state.tableColumnVisible = true;
                },
              }),
            ],
          );
        }
      }
      dataColumns.value.forEach((item, index) => {
        if (dataColumns.value.length > 7) {
          if (index === 0) {
            item.fixed = "left";
          }
          if (index === props.columns.length - 1) {
            item.fixed = "right";
          }
        }
      });
    };
    watch(
      () => props.columns,
      async () => {
        getAliasConfig();
      },
      { immediate: true },
    );
    onMounted(() => {
      resetSearch();
      if (props.searchCache) {
        const cacheQuery = queryParameter.getQuery() || {};
        const searchItemMap = getSearchItemMap();
        props.search.forEach((item) => {
          const key = item.value;
          if (key && cacheQuery[key] !== undefined) {
            state.form[key] = decodeCacheValue(searchItemMap[key], cacheQuery[key]);
            return;
          }
          // 兼容 defaultDate 模式：URL 里只缓存了 defaultDate（如 submitTime），
          // 但控件真实字段是 value（如 date），需要桥接回填到控件模型
          if (
            item?.component === "a-range-picker" &&
            key &&
            cacheQuery[key] === undefined &&
            item.defaultDate &&
            cacheQuery[item.defaultDate] !== undefined
          ) {
            state.form[key] = decodeCacheValue(searchItemMap[key], cacheQuery[item.defaultDate]);
          }
        });
        if (props.extraSearchModel) {
          Object.keys(props.extraSearchModel).forEach((key) => {
            if (cacheQuery[key] !== undefined) {
              props.extraSearchModel[key] = decodeCacheValue(searchItemMap[key], cacheQuery[key]);
            }
          });
        }
        if (cacheQuery.pageNumber) {
          state.page.pageNumber = Number(cacheQuery.pageNumber);
        }
        if (cacheQuery.pageSize) {
          state.page.pageSize = Number(cacheQuery.pageSize);
        }
      }
      resetModal();
      getData();
      nextTick(() => {
        getScrollY();
      });
      window.onresize = () => {
        getScrollY();
      };
    });

    /*新增 编辑 详情*/
    const operationRecord = (type, record) => {
      state.okButtonProps.style = "";
      if (props.editMode === "modal") {
        state.operation = type;
        if (type === "add") {
          /*新增*/
          resetModal();
          state.modalName = "新增" + props.modalTitle;
          state.modalVisible = true;
        } else {
          /*编辑 详情*/
          if (props.api.detail) {
            if (props.api.detail === "record") {
              //直接使用列表数据
              state.modalForm = JSON.parse(JSON.stringify(record));
              if (type === "edit") {
                state.modalName = "编辑" + props.modalTitle;
              } else {
                state.modalName = props.modalTitle + "详情";
                state.okButtonProps.style = "display: none";
              }
              state.modalVisible = true;
            } else {
              let params = {};
              params[props.rowKey] = record[props.rowKey];
              proxy.$api[props.api.detail](params, "get").then((res) => {
                state.modalForm = res;
                if (type === "edit") {
                  state.modalName = "编辑" + props.modalTitle;
                } else {
                  state.modalName = props.modalTitle + "详情";
                }
                state.okButtonProps.style = "";
                state.modalVisible = true;
              });
            }
          }
        }
      } else if (props.editMode === "custom") {
        emit("operation", type, record);
      } else {
        if (props.api.path) {
          let obj = {};
          if (props.api.pathParams && props.api.pathParams.length > 0) {
            props.api.pathParams.forEach((item) => {
              if (item.value === "type") {
                obj["recordType"] = item.defaultValue ? item.defaultValue : record ? record[item.value] : null;
              } else {
                obj[item.value] = item.defaultValue ? item.defaultValue : record ? record[item.key ? item.key : item.value] : null;
              }
            });
          }
          function getPushPath() {
            const pathname_arr = location.pathname.split("/");
            pathname_arr[pathname_arr.length - 1] = props.api.path;
            const pathname = pathname_arr.join("/").replaceAll("//", "/");
            const query = {
              ...obj,
              type,
              id: record ? record[props.rowKey] : null,
            };
            if (props.searchCache) query.searchValue = JSON.stringify(state.form);
            let queryString = "";
            for (const key in query) {
              if (Object.hasOwnProperty.call(query, key)) {
                const element = query[key];
                if (element) {
                  queryString += `${queryString ? "&" : ""}${key}=${element}`;
                }
              }
            }
            return `${pathname}${queryString ? "?" + queryString : ""}`;
          }
          history.pushState({ current: location.pathname + location.search }, "", getPushPath());
        }
      }
    };

    /*点击转态切换*/
    const slotRecord = (slot, record) => {
      emit("slot", slot, record);
    };

    /*点击删除*/
    const deleteRecord = (record) => {
      if (record) {
        if (props.api.deleteSingle) {
          proxy.$api[props.api.deleteSingle](record[props.rowKey], "delete").then((res) => {
            proxy.$message.success("操作成功");
            getData();
          });
        }
      } else {
        Modal.confirm({
          title: () => "删除确认",
          icon: () => createVNode(ExclamationCircleOutlined),
          content: () => "是否删除当前选中?",
          okText: () => "确认",
          okType: "danger",
          centered: true,
          cancelText: () => "取消",
          onOk() {
            if (props.api.delete) {
              proxy.$api[props.api.delete](
                {
                  [props.paramsKey]: state.selectedRowKeys.length ? state.selectedRowKeys.join(",") : "",
                },
                "delete",
              ).then((res) => {
                proxy.$message.success("操作成功");
                getData();
              });
            }
          },
          onCancel() {},
        });
      }
    };

    /*点击查询*/
    const searchRecord = () => {
      state.page.pageNumber = 1;
      syncQueryCache();
      getData();
    };
    /*列表排序查询*/
    const changeTable = (e, filters, sorter) => {
      state.page.pageNumber = 1;
      if (sorter.order) {
        state.sorter = {
          item: sorter.columnKey,
          sort: sorter.order === "descend" ? "DESC" : "ASC",
        };
      } else {
        state.sorter = { item: null, sort: null };
      }
      getData();
    };
    /*点击重置*/
    const reset = () => {
      emit("reset");
      resetSearch();
      state.page.pageNumber = 1;
      syncQueryCache();
      getData();
    };

    /*选择table*/
    const onSelectChange = (selectedRowKeys, selectedRows) => {
      state.selectedRowKeys = selectedRowKeys;
      state.selectedRows = selectedRows;
    };
    const clearSelection = () => {
      state.selectedRowKeys = [];
      state.selectedRows = [];
    };
    /*getCheckboxProps*/
    const getCheckboxProps = (record) => {
      return {
        disabled: props.tableCheckbox ? props.tableCheckbox(record) : false,
      };
    };

    /*翻页*/
    const onShowSizeChange = (current, pageSize) => {
      state.page.pageNumber = current;
      state.page.pageSize = pageSize;
      syncQueryCache();
      getData();
    };

    /*新增、编辑弹框提交*/
    const submitModal = () => {
      formRef.value.validate().then(() => {
        let params = state.modalForm;
        state.confirmLoading = true;
        if (props.beforeSave) {
          params = props.beforeSave(state.modalForm);
        }
        if (state.operation === "add") {
          if (props.api.add) {
            proxy.$api[props.api.add](params, "post")
              .then(async (res) => {
                proxy.$message.success("操作成功");
                state.confirmLoading = false;
                getData();
                closeModal();
              })
              .catch(() => {
                state.confirmLoading = false;
              });
          }
        } else if (state.operation === "edit") {
          if (props.api.edit) {
            proxy.$api[props.api.edit](params, "put")
              .then(async (res) => {
                proxy.$message.success("操作成功");
                state.confirmLoading = false;
                getData();
                closeModal();
              })
              .catch(() => {
                state.confirmLoading = false;
              });
          }
        }
      });
    };

    const closeModal = async () => {
      await formRef.value.resetFields();
      emit("updateLeft");
      state.modalVisible = false;
    };

    /*更多按钮*/
    const showMore = () => {
      state.moreSearch = !state.moreSearch;
      getScrollY();
    };
    return {
      dataColumns,
      formRef,
      ...toRefs(state),
      getData,
      onShowSizeChange,
      calcScrollX,
      operationRecord,
      deleteRecord,
      searchRecord,
      reset,
      onSelectChange,
      clearSelection,
      getCheckboxProps,
      submitModal,
      showMore,
      slotRecord,
      changeTable,
      closeModal,
      getAliasConfig,
      errorMsg: (msg) => proxy.$message.error(msg),
      searchFieldAttrs,
      modalFieldAttrs,
    };
  },
});
</script>
