<template>
  <div class="ctr pl2 pr2" ref="ctrRef">
    <div ref="headerRef" :class="['header', 'flex-between']">
      <div>
        <g-vertical-line
          v-if="tableTitle"
          :title="tableTitle"
        ></g-vertical-line>
      </div>
      <div>
        <a-space :size="8">
          <a-button
            type="primary"
            v-if="btns.includes('add')"
            @click="tableOperate('add', null)"
            >新增</a-button
          >
          <slot name="header"></slot>
        </a-space>
      </div>
    </div>
    <template v-if="search.length">
      <div class="search pt1" ref="searchRef">
        <a-form
          ref="searchFormRef"
          id="searchForm"
          :model="searchForm"
          layout="inline"
          v-bind="layout"
        >
          <slot name="preSearch"></slot>
          <template v-for="(item, index) in showSearchlist" :key="item.value">
            <a-form-item
              :label="item.label"
              name="item.value"
              v-if="index < searchLength"
            >
              <component
                v-if="!item.component || item.component !== 'span'"
                :is="item?.component ? item?.component : 'a-input'"
                v-model:value="searchForm[item.value]"
                v-model:checked="searchForm[item.value]"
                :options="item?.options ? item?.options : null"
                :field="item?.field ? item?.field : null"
                :placeholder="
                  item.placeholfer
                    ? item.placeholder
                    : item.label
                    ? item.label
                    : '请输入'
                "
              ></component>
            </a-form-item>
            <a-form-item
              :label="item.label"
              v-else-if="index >= searchLength && !isDown"
            >
              <component
                v-if="!item.component || item.component !== 'span'"
                :is="item?.component ? item?.component : 'a-input'"
                v-model:value="searchForm[item.value]"
                v-model:checked="searchForm[item.value]"
                :options="item?.options ? item?.options : null"
                :field="item?.field ? item?.field : null"
                :placeholder="
                  item.placeholfer
                    ? item.placeholder
                    : item.label
                    ? item.label
                    : '请输入'
                "
              ></component>
            </a-form-item>
          </template>
          <a-form-item>
            <a-space :size="8">
              <a-button type="primary" @click="getData">查询</a-button>
              <a-button @click="reset">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
        <div>
          <a-button
            type="link"
            v-if="showSearchlist.length > searchLength"
            @click="changeIcon"
          >
            {{ isDown ? "展开" : "收起" }}
            <DownOutlined v-if="isDown" />
            <UpOutlined v-else />
          </a-button>
        </div>
      </div>
    </template>
    <div class="content" ref="contentRef">
      <a-table
        :size="size"
        :rowKey="rowKey"
        :columns="columns"
        :loading="loading"
        :pagination="false"
        :dataSource="tableData"
        :scroll="{ x: scrollX, y: tableY ? tableY : scrollY }"
        :rowSelection="allowSelect ? rowSelection : null"
      >
        <template #action="{ record }">
          <a-space :size="12">
            <slot name="prebtn" :record="record"></slot>
            <a
              v-if="btns.includes('detail')"
              @click="tableOperate('detail', record)"
            >
              详情</a
            >
            <a
              v-if="btns.includes('edit')"
              @click="tableOperate('edit', record)"
            >
              编辑</a
            >
            <slot name="behbtn" :record="record"></slot>
            <a-popconfirm
              title="删除当前数据？"
              v-if="btns.includes('deleteSingle') && api?.deleteSingle"
              @confirm="tableOperate('deleteSingle', record)"
            >
              <a class="abnormal"> 删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </div>
    <template v-if="showPage || allowSelect">
      <div class="footer flex-between" ref="footerRef">
        <div class="batchOperate" v-if="allowSelect && tableType !== 'modal'">
          <span class="pr1">已选{{ selectedKeys?.length }}项</span>
          <a-space :size="8">
            <a-popconfirm
              title="是否删除当前选中数据？"
              v-if="
                api?.delete && btns.includes('delete') && selectedKeys.length
              "
              @confirm="tableOperate('delete', selectedKeys)"
            >
              <a-button type="primary" danger>批量删除</a-button>
            </a-popconfirm>
            <a-button type="primary" danger disabled v-else>
              批量删除
            </a-button>
            <slot name="batchBtn" :record="selectedKeys"></slot>
          </a-space>
        </div>
        <div v-else></div>
        <a-pagination
          v-if="showPage && pagination.total > 0"
          :size="size"
          :default-current="1"
          :total="pagination.total"
          :show-size-changer="tableType !== 'modal' ? true : false"
          @change="onShowSizeChange"
          @showSizeChange="onShowSizeChange"
          v-model:pageSize="pagination.pageSize"
          v-model:current="pagination.pageNumber"
          :show-total="() => `共 ${pagination.total} 条数据`"
        ></a-pagination>
      </div>
      <div class="seat"></div>
    </template>
    <a-modal
      v-model:visible="visible"
      centered
      :title="
        modalTitle +
        (modalType === 'add'
          ? '新增'
          : modalType === 'edit'
          ? '编辑'
          : modalType === 'detail'
          ? '详情'
          : '')
      "
      @ok="save"
      @cancel="cancel"
    >
      <a-form ref="modalFormRef" :model="modalForm" :rules="rules">
        <template v-for="(item, index) in modal" :key="item.value">
          <a-form-item
            v-if="item?.component !== 'span'"
            :label="item.label"
            :name="item.value"
          >
            <template
              v-if="
                item.component === 'g-upload' || item.component === 'gUpload'
              "
            >
              <g-upload
                :file="item?.file"
                :max="item?.max ? item.max : 1"
                :size="item?.size ? item.size : 2"
                :businessKey="item.businessKey"
                :sceneCode="GLOBAL_SCENE_CODE.financial"
                v-model:value="modalForm[item.value]"
                :ref="(el) => setRef(el, index)"
              ></g-upload>
            </template>
            <component
              v-else
              :url="item?.url ? item?.url : null"
              :max="item?.max ? item?.max : null"
              v-model:value="modalForm[item.value]"
              :mode="item?.mode ? item?.mode : null"
              v-model:checked="modalForm[item.value]"
              :style="item?.style ? item?.style : null"
              :field="item?.field ? item?.field : null"
              :suffix="item?.suffix ? item?.suffix : null"
              :prefix="item?.prefix ? item?.prefix : null"
              :params="item?.params ? item?.params : null"
              :format="item?.format ? item?.format : null"
              :options="item?.options ? item?.options : null"
              :valueFormat="item?.format ? item?.format : null"
              :showTime="item?.showTime ? item?.showTime : null"
              :disabled="item?.disabled ? item?.disabled : null"
              :is="item?.component ? item?.component : 'a-input'"
              :unCheckedValue="
                item?.unCheckedValue ? item?.unCheckedValue : null
              "
              :maxlength="item?.maxlength ? item?.maxlength : null"
              :showSearch="item?.showSearch ? item?.showSearch : null"
              :placeholder="item?.placeholder ? item?.placeholder : null"
              :checkedValue="item?.checkedValue ? item?.checkedValue : null"
              :labelInValue="item?.labelInValue ? item?.labelInValue : null"
              :file="item?.file ? item?.file : []"
              @custom-change="
                (value, option) => item?.change(value, option, modalForm)
              "
              @change-check="
                (value, option) => item?.change(value, option, modalForm)
              "
            ></component>
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
import { DownOutlined, UpOutlined } from "@ant-design/icons-vue";
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export default defineComponent({
  name: "sTable",
  components: { DownOutlined, UpOutlined },
  props: {
    api: {
      type: Object,
      default: () => {
        return {
          add: "", //表格新增
          edit: "", //表格编辑
          list: "", //表格数据
          path: "", //表格跳转路径
          delete: "", //表格批量删除
          detail: "", //详情取值
          deleteSingle: "", //表格单个删除
          pathParams: [],
        };
      },
    },
    columns: {
      type: Array,
      default: () => {
        return [];
      },
    },
    params: {
      type: Array,
      default: () => {
        return [];
      },
    },
    disabledKeys: {
      type: Array,
      default: () => {
        return [];
      },
    },
    btns: {
      type: Array,
      default: () => {
        return ["detail", "edit", "add", "delete", "deleteSingle"];
      },
    },
    /**
     * label,
     * value,
     * component,
     * options,
     * field,
     * maxlength,
     * format
     * showTime
     * placeholder
     * disabled
     * checkedValue
     * unCheckedValue
     * mode
     * params
     * suffix
     * prefix
     * fileList
     * max
     * style
     * labelInValue
     * change
     * showSearch
     */
    search: {
      type: Array,
      default: () => {
        return [];
      },
    },
    rowKey: {
      type: [String, Function],
      default: "id",
    },
    editType: {
      type: String,
      default: "modal",
    },
    selectType: {
      type: String,
      default: "checkbox",
    },
    tableType: {
      type: String,
      default: "modal",
    },
    modal: {
      type: Object,
      default: () => {
        return []; //参考search
      },
    },
    rules: {
      type: Object,
      default: () => {
        return {};
      },
    },
    allowSelect: {
      type: Boolean,
      default: false,
    },
    showPage: {
      type: Boolean,
      default: true,
    },
    size: {
      type: String,
      default: "default",
    },
    tableTitle: {
      type: String,
      default: "",
    },
    scrollX: {
      type: [Number, String],
      default: 1000,
    },
    tableY: {
      type: [Number, String],
      default: 0,
    },
    beforeGet: {
      type: Function,
    },
    modalTitle: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const ctrRef = ref();
    const searchRef = ref();
    const headerRef = ref();
    const footerRef = ref();
    const contentRef = ref();
    const modalFormRef = ref();
    const selectedKeys = ref([]);
    const searchFormRef = ref();
    const uploadRef = ref([]);

    const setRef = (el, index) => {
      uploadRef.value[index] = el;
    };
    const layout = {
      labelCol: { span: 12 },
      // wrapperCol: { span: 6 },
    };

    const state = reactive({
      searchForm: {},
      showSearchlist: [],
      modalForm: {},
      tableData: [],
      pagination: {
        total: 0,
        pageSize: 10,
        pageNumber: 1,
      },
      scrollY: 0,
      loading: false,
      isDown: true,
      visible: false,
      searchLength: 2,
      windowWidth: 0,
      modalType: "",
      headerHeight: "",
    });

    // 构造数据
    const setSearch = async () => {
      props.search.forEach((item) => {
        state.searchForm[item.value] =
          item.defaultValue || item.defaultValue === false
            ? item.defaultValue
            : "";
      });
    };

    const setModal = async () => {
      props.modal.forEach((item) => {
        state.modalForm[item.value] =
          item.defaultValue || item.defaultValue === false
            ? item.defaultValue
            : "";
      });
    };

    // 监听宽高数据

    const setHeight = () => {
      const TH = ctrRef.value?.clientHeight;
      const SH = searchRef.value?.clientHeight
        ? searchRef.value?.clientHeight
        : 0;
      if (headerRef.value?.clientHeight > 8) {
        headerRef.value.style.borderBottom = "1px solid #f3f3f3";
        headerRef.value.style.height = "50px";
        headerRef.value.style.lineHeight = "50px";
      }
      const HH = headerRef.value?.clientHeight
        ? headerRef.value?.clientHeight
        : 0;

      const FH = footerRef.value?.clientHeight
        ? footerRef.value?.clientHeight
        : 0;
      const tableTh =
        document.getElementsByClassName("ant-table-thead")[0].clientHeight;
      const contentDom = contentRef.value;
      contentDom.style.height = TH - SH - FH - HH - 2 + "px";
      state.scrollY = props.tableY ? props.tableY : TH - SH - FH - HH - tableTh;
    };

    const setIcon = () => {
      state.windowWidth = searchRef?.value?.clientWidth;
      if (state.windowWidth <= 1095) {
        state.searchLength = 2;
      } else if (state.windowWidth > 1095 && state.windowWidth < 1378) {
        state.searchLength = 3;
      } else if (state.windowWidth > 1378 && state.windowWidth < 1661) {
        state.searchLength = 4;
      } else if (state.windowWidth > 1661 && state.windowWidth < 1920) {
        state.searchLength = 5;
      }
    };

    const changeIcon = () => {
      state.isDown = !state.isDown;
    };

    // 获取数据
    const getData = (obj) => {
      state.loading = true;
      let params = {
        ...state.searchForm,
        ...props.params,
        ...obj,
        ...state.pagination,
      };
      if (props.beforeGet) {
        params = props.beforeGet(params);
      }
      proxy.$api[props?.api?.list](params, "get").then((res) => {
        if (res && res.records) {
          state.tableData = res.records;
          state.pagination.total = res.total;
        } else {
          state.tableData = res;
        }
        state.loading = false;
      });
    };

    // 表格操作
    const tableOperate = (type, record) => {
      state.modalType = type;
      if (type === "delete") {
        proxy.$api[props.api.delete]({ ids: record }, "delete").then(() => {
          proxy.$message.success("操作成功");
          selectedKeys.value = [];
          getData();
        });
        return;
      } else if (type === "deleteSingle") {
        proxy.$api[props.api.deleteSingle](record[props.rowKey], "delete").then(
          () => {
            proxy.$message.success("操作成功");
            selectedKeys.value = selectedKeys.value.filter(
              (item) => item !== record[props.rowKey]
            );
            getData();
          }
        );
        return;
      }
      // 弹框
      if (props.editType === "modal") {
        if (type === "add") {
          setModal();
          state.visible = true;
        } else if (type === "edit" || type === "detail") {
          if (props.api.detail === "record") {
            state.modalForm = record;
            state.visible = true;
          } else {
            proxy.$api[props.api.detail](record[props.rowKey], "get").then(
              (res) => {
                state.modalForm = res;
                state.visible = true;
              }
            );
          }
        }
      }
      // 跳转
      else if (props.editType === "page") {
        const params = {
          [props.rowKey]:
            type === "add"
              ? ""
              : record[props.rowKey]
              ? record[props.rowKey]
              : "",
        };
        props.api?.pathParams?.forEach((item) => {
          Object.assign(params, {
            [item.name]:
              item.defaultValue || item.defaultValue === false
                ? item.defaultValue
                : record[item.name]
                ? record[item.name]
                : "",
          });
        });
        function getPushPath() {
            const pathname_arr = location.pathname.split('/')
            pathname_arr[pathname_arr.length - 1] = props.api.path
            const pathname = pathname_arr.join('/').replaceAll('//', '/')
            const query = { ...params, type }
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

    const reset = async () => {
      await setSearch();
      getData();
    };

    const onShowSizeChange = (current, pageSize) => {
      state.pagination.pageNumber = current;
      state.pagination.pageSize = pageSize;
      getData();
    };

    const rowSelection = computed(() => {
      return {
        selectedRowKeys: unref(selectedKeys.value),
        columnWidth: "50px",
        fixed: true,
        type: props?.selectType ? props.selectType : "chackbox",
        getCheckboxProps: (record) => {
          return {
            disabled: props.disabledKeys.includes(record[props.rowKey])
              ? true
              : false,
          };
        },
        onChange: (record) => {
          selectedKeys.value = record;
        },
      };
    });

    // 弹框操作
    const save = () => {
      modalFormRef.value.validate().then(() => {
        proxy.$api[props.api[state.modalType]](
          state.modalForm,
          state.modalType === "add" ? "post" : "put"
        ).then(() => {
          proxy.$message.success("操作成功");
          cancel();
          getData();
        });
      });
    };

    const cancel = async () => {
      await modalFormRef.value.resetFields();
      uploadRef.value.forEach((element) => {
        element.fileList = [];
      });
      state.visible = false;
    };

    onMounted(() => {
      setSearch();
      state.showSearchlist = props.search?.length
        ? props.search.filter((item) => item?.components !== "span")
        : [];
      if (props.editType === "modal") setModal();
      nextTick(() => {
        setHeight();
        setIcon();
      });
      window.onresize = () => {
        setHeight();
        setIcon();
      };
      getData();
    });

    watch(
      () => state.windowWidth,
      (n) => {
        if (n <= 1095) {
          state.searchLength = 2;
        } else if (n > 1095 && n < 1378) {
          state.searchLength = 3;
        } else if (n > 1378 && n < 1661) {
          state.searchLength = 4;
        } else if (n > 1661 && n < 1920) {
          state.searchLength = 5;
        }
      }
    );
    watch(
      () => headerRef.value,
      (n) => {
        state.headerHeight = n.clientHeight;
      }
    );

    return {
      layout,
      ctrRef,
      footerRef,
      searchRef,
      headerRef,
      contentRef,
      modalFormRef,
      selectedKeys,
      searchFormRef,
      ...toRefs(state),
      onShowSizeChange,
      tableOperate,
      rowSelection,
      changeIcon,
      getData,
      cancel,
      setRef,
      reset,
      save,
      GLOBAL_SCENE_CODE
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
  background-color: #fff;
  .header {
    width: 100%;
    // height: 50px;
    // line-height: 50%;
  }
  .search {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: top;
  }
  .content {
    width: 100%;
    overflow: hidden;
  }
  .footer {
    width: 100%;
    height: 50px;
    position: absolute;
    bottom: 0;
    right: 0px;
    border-top: 1px solid #f3f3f3;
    padding: 0 16px;
  }
  .seat {
    width: 100%;
    height: 50px;
  }
}
:deep(.ant-form-item-control) {
  width: 210px;
}
#searchForm {
  flex: 1;
  .ant-form-item {
    height: 46px;
  }
}
</style>
