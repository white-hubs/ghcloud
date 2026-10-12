<template lang="pug">
g-layout(:title="title")
  template(#content-left)
    slot(name="content-left")
  template(#content-data)
    slot(name="content-data")
  template(#header-btn)
    slot(name='header-btns')
    a-button(type="primary" v-if="btns.indexOf('add')>-1" :disabled="!permission.add" @click="operationRecord('add')") 新增
  template(#content-search)
    a-form(layout="inline" :model="form" v-if="search.length>0")
      slot(name='pre-item' :record="form")
      template(v-for="(item,index) in search")
        a-form-item(:label="item.label" v-if="(moreSearch || index<4)&&item.component !== 'span'")
          component(
            v-model:value="form[item.value]" 
            :is="item.component?item.component:'a-input'" 
            :placeholder="item.placeholder?item.placeholder:'请输入'"
            :options="item.options?item.options:[]"
            :field="item.field?item.field:null"
            :url="item.url?item.url:null"
            :params="item.params?item.params:{}"
            :style="{width:'218px'}"
            allowClear
          )
      slot(name='behind-item' :record="form")
      a-form-item
        a-button(type="primary" @click="searchRecord") 查询
      a-form-item(v-if="search.length>1")
        a-button(@click="reset") 重置
    .more-search
      a-button(type="link" @click="showMore" v-if="search.length>4") {{!moreSearch?'更多':'收起'}}
        UpOutlined(v-if="moreSearch")
        DownOutlined(v-else)
  template(#content-table ref="contentTableRef")
    a-table(
      :rowKey="rowKey"
      :row-selection="rowSelection?{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange,getCheckboxProps:getCheckboxProps}:null"
      :columns="dataColumns" 
      :data-source="dataSource" 
      :pagination="false" 
      :loading="loading" 
      size="middle"
      :scroll="{ y: scrollY,x:scrollX }"
      id="listTable" 
      @change="changeTable"
    )
      template(v-for="item in slots" #[item.slot]="{ record }")
        component(:is="item.component?item.component:'a-input'" v-model:checked="record[item.slot]"  @click="slotRecord(item.slot,record)" :disabled='!permission.tableEdit' :checked-children="item.checkedValue?item.checkedValue:'启用'" :un-checked-children="item.unCheckedValue?item.unCheckedValue:'禁用'")
      template(#action="{record}")  
        span.action-btn
          a-button(type="link" v-if="btns.indexOf('detail')>-1" @click="operationRecord('detail',record)" :disabled="(btnDisabled.detail?btnDisabled.detail(record):false)||!permission.detail") 详情
          a-button(type="link" v-if="btns.indexOf('edit')>-1" @click="operationRecord('edit',record)" :disabled="(btnDisabled.edit?btnDisabled.edit(record):false)||(record.id===1?!useAdmin:!permission.edit)") 编辑
          a-popconfirm(
            title="是否删除当前选中？"
            cancelText="取消"
            okText="确定"
            @confirm.stop="deleteRecord(record)"
            v-if="api.deleteSingle && btns.indexOf('deleteSingle')>-1"
            :disabled="(btnDisabled.deleteSingle?btnDisabled.deleteSingle(record):false)||!permission.deleteSingle"
            )
            a-button.deleteRow(type="link" @click.stop="" :disabled='!permission.deleteSingle') 删除
          slot(name="btn" :record="record")
  template(#footer-btn)
    span(v-if="rowSelection") 已选{{selectedRowKeys.length}}项
    a-button(type="danger" v-if="rowSelection && btns.indexOf('delete')>-1" @click="deleteRecord(false)" :disabled="selectedRowKeys.length === 0||!permission.deleteSingle") 删除
    slot(name="batch" :record="selectedRowKeys")
  template(#footer-page)
    a-pagination(show-size-changer v-if="page.total>0" v-model:pageSize="page.pageSize"  v-model:current="page.pageNumber" :total="page.total" :default-current="1" :show-total="total => `共 ${total} 条数据`"  @change="onShowSizeChange" @showSizeChange="onShowSizeChange")
  a-modal(v-model:visible.sync="modalVisible" width="600px" :title="modalName"  @ok="submitModal" centered @cancel="closeModal")
    a-form(:model="modalForm" :rules="rules" ref="formRef" :label-col="{span: 4 }")
      template(v-for="item in modal")
        a-form-item(:label="item.label" :name="item.value" v-if="item.showCondition?item.showCondition(modalForm):true")
          component(
            v-model:value="modalForm[item.value]" 
            v-model:checked="modalForm[item.value]"
            :is="item.component?item.component:'a-input'" 
            :placeholder="item.placeholder?item.placeholder:'请输入'"
            :disabled="item.disabled?item.disabled: operation === 'detail'"
            :options="item.options?item.options: null"
            :url="item.url?item.url: null"
            :field="item.field?item.field: null"
            :params="item.params?item.params: null"
            :checked-children="item.checkedValue?item.checkedValue:'启用'" 
            :un-checked-children="item.unCheckedValue?item.unCheckedValue:'禁用'"
          )
</template>

<script lang='jsx'>
import { UpOutlined, DownOutlined } from "@ant-design/icons-vue";
import {
  createVNode,
  defineComponent,
  onMounted,
  toRefs,
  getCurrentInstance,
  reactive,
  ref,
  computed,
  nextTick,
  watch
} from "vue";

import { useRouter } from "vue-router";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import { timeFormat } from "@/utils/common";
export default defineComponent({
  components: {
    UpOutlined,
    DownOutlined,
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
    /*控制table组件新增/编辑/详情等操作,是通过默认弹框(modal),还是通过跳转新页面(page)或者自定义(custom)进行*/
    editMode: {
      type: String,
      default: "modal",
    },
    // 批量处理参数名
    paramsKey: {
      type: String,
      default: "ids",
    },
    permission:{
      type:Object,
      default:()=>{
        return {
          add:window.config.useAdmin,
          edit:window.config.useAdmin,
          delete:window.config.useAdmin,
          detail:window.config.useAdmin,
          deleteSingle:window.config.useAdmin,
          tableEdit:window.config.useAdmin,
        }
      }
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
  },
  setup(props, { emit }) {
    const contentTableRef = ref()
    watch(contentTableRef,()=>{
      if (!contentTableRef.value) {
        return
      }
      resetSearch();

      resetModal();

      getData();

      nextTick(() => {
        getScrollY()
    
      });
      window.onresize = () => {
        getScrollY();
      };

    })
    const dataColumns = computed(() => {
      if (props.columns && props.columns.length > 0) {
        const arr = props.columns.map((item, index) => {
          if (props.columns.length > 7) {
            if (index < 2) {
              return {
                ...item,
                width: item.width ? item.width : 150,
                ellipsis: false,
                fixed: item.fixed ? item.fixed : "left",
              };
            } else if (index === props.columns.length - 1) {
              return {
                ...item,
                width: item.width ? item.width : 150,
                fixed: item.fixed ? item.fixed : "right",
              };
            } else {
              return {
                ...item,
                width: item.width ? item.width : 150,
                ellipsis: item.ellipsis ? item.ellipsis : true,
                fixed: item.fixed ? item.fixed : null,
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
        return arr;
      }
      return [];
    });
    const router = useRouter();
    const formRef = ref();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      dataSource: [],
      selectedRowKeys: [],
      scrollY: 500,
      modalVisible: false,
      moreSearch: false,
      loading: false,
      operation: "add",
      modalName: "新增",
      form: {},
      modalForm: {},
      page: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      },
      sorter: { item: null, sort: null },
    });

    /*获取table高度*/
    const getScrollY = (data) => {

      const layoutContentHeight =
        document.getElementsByClassName("layout-content")[0];
      const contentSearchHeight =
        document.getElementsByClassName("content-search")[0];
      const contentDataHeight =
        document.getElementsByClassName("content-data")[0];
      state.scrollY =
        layoutContentHeight.offsetHeight -
        contentSearchHeight.offsetHeight -
        contentDataHeight.offsetHeight -
        50;
      const tableBody = document
        .getElementById("listTable")
        .getElementsByClassName("ant-table-body")[0];
      tableBody.style.height =
        data && data.length === 0 ? "0px" : state.scrollY + "px";

    };

    /*获取数据列表*/
    const getData = (obj) => {
      props.search.forEach((item) => {
        if (item.component === "a-range-picker") {
          if (item.defaultDate) {
            const date =
              state.form.date && state.form.date.length > 0
                ? [
                  timeFormat(state.form.date[0], false),
                  timeFormat(state.form.date[1], false),
                ]
                : [];
            if (date.length > 0) {
              state.form[item.defaultDate] = date.join(",");
            } else {
              state.form[item.defaultDate] = null;
            }
          }
        }
      });
      const formParams = { ...state.form, date: null, ...obj, ...state.sorter };
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
        // debugge
        proxy.$api[props.api.list]("get", params).then((res) => {
          state.loading = false;
          if (res.records) {
            state.page.total = res.total;
            state.dataSource = res.records;
          } else {
            state.dataSource = res;
          }

          state.selectedRowKeys = [];
          getScrollY(state.dataSource);
        });
      }
    };
    /*搜索表单*/
    const resetSearch = () => {
      props.search.forEach((item) => {
        state.form[item.value] = item.defaultValue ? item.defaultValue : null;
      });
    };
    /*弹框表单*/
    const resetModal = () => {
      props.modal.forEach((item) => {
        state.modalForm[item.value] = item.defaultValue
          ? item.defaultValue
          : null;
      });
    };
    onMounted(() => {
      getData()

    });

    /*新增 编辑 详情*/
    const operationRecord = (type, record) => {
 
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
              }
              state.modalVisible = true;
            } else {
              let params = {};
              params[props.rowKey] = record[props.rowKey];
              proxy.$api[props.api.detail]("get", params).then((res) => {
                state.modalForm = res;
                if (type === "edit") {
                  state.modalName = "编辑" + props.modalTitle;
                } else {
                  state.modalName = props.modalTitle + "详情";
                }
                state.modalVisible = true;
              });
            }
          }
        }
      } else if (props.editMode === "custom") {
   
        emit("operation", "add");
      } else {
        if (props.api.path) {
          let obj = {};
          if (props.api.pathParams && props.api.pathParams.length > 0) {
            props.api.pathParams.forEach((item) => {
              if (item.value === "type") {
                obj["recordType"] = item.defaultValue
                  ? item.defaultValue
                  : record
                    ? record[item.value]
                    : null;
              } else {
                obj[item.value] = item.defaultValue
                  ? item.defaultValue
                  : record
                    ? record[item.value]
                    : null;
              }
            });
          }

          router.push({
            path: props.api.path,
            query: {
              ...obj,
              type,
              id: record ? record[props.rowKey] : null,
            },
          });
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
          proxy.$api[props.api.deleteSingle](
            "delete",
            record[props.rowKey]
          ).then((res) => {
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
              proxy.$api[props.api.delete]("delete", {
                [props.paramsKey]: state.selectedRowKeys.length
                  ? state.selectedRowKeys.join(",")
                  : "",
              }).then((res) => {
                proxy.$message.success("操作成功");
                getData();
              });
            }
          },
          onCancel() { },
        });
      }
    };

    /*点击查询*/
    const searchRecord = () => {
      state.page.pageNumber = 1;
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
      getData();
    };

    /*选择table*/
    const onSelectChange = (selectedRowKeys) => {
      state.selectedRowKeys = selectedRowKeys;
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
      getData();
    };

    /*新增、编辑弹框提交*/
    const submitModal = () => {
      formRef.value.validate().then(() => {
        let params = state.modalForm;
        if (props.beforeSave) {
          params = props.beforeSave(state.modalForm);
        }
        if (state.operation === "add") {
          if (props.api.add) {
            proxy.$api[props.api.add]("post", params).then(async (res) => {
              proxy.$message.success("操作成功");
              getData();
              closeModal();
            });
          }
        } else if (state.operation === "edit") {
          if (props.api.edit) {
            proxy.$api[props.api.edit]("put", params).then(async (res) => {
              proxy.$message.success("操作成功");
              getData();
              closeModal();
            });
          }
        }
      });
    };

    const closeModal = async () => {
      await formRef.value.resetFields();
      state.modalVisible = false;
    };

    /*更多按钮*/
    const showMore = () => {
      state.moreSearch = !state.moreSearch;
      getScrollY();
    };
    return {
      contentTableRef,
      dataColumns,
      formRef,
      ...toRefs(state),
      getData,
      onShowSizeChange,
      operationRecord,
      deleteRecord,
      searchRecord,
      reset,
      onSelectChange,
      getCheckboxProps,
      submitModal,
      showMore,
      slotRecord,
      changeTable,
      closeModal,
      useAdmin:window.config.useAdmin
    };
  },
});
</script>
