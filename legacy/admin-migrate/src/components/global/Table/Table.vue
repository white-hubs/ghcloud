<template lang="pug">
a-layout
  a-layout-content.table_view
    a-table(
      :columns="columns"
      :data-source="tableData"
      :bordered="bordered"
      :pagination="false"
      :rowKey="(record) => record.id"
      :expandRowByClick="true"
      :scroll="{x: 1200,y: tableHeight}"
      :loading="loading")
      template(#title)
        div.flex.bottomLine.justify-between
          span.verticalLine {{tableName}}
          div(v-if="titleBtn")
            a-button(type="primary" @click="add") 新增
        a-form.pt2(layout="inline" v-if="searchCondition.length" :model="model")
          a-form-item(v-for="item in searchCondition" :label="item.label")
            component(
              :is="item.component" 
              v-model:value="model[item.conditionName]" 
              :placeholder="item.placeholder" 
              :options="item.options") 
          a-form-item
            a-space(:size="16")  
              //- a-button(v-for="ele in btnGroup" :type="item.btnType" @click="btnClick(item.clickEvent)") {{ele.name}}
              a-button(type="primary" @click="search") 搜索
              a-button(@click="reset") 重置
      template(#enabled="{text,record}")  
        slot(name="enabled" :record="{record,text}")        
      template(#action="{record}")   
        a-space
          slot(name="action" :record="record")
  a-layout-footer()
    slot(name="bottomBtn")
    a-pagination(
      v-model:current="pagination.pageNumber"
      v-model:pageSize="pagination.pageSize"
      :showSizeChanger="true"
      :total="pagination.total"
      :showTotal="(total)=>`共${total}条数据`"
       @change="changePage" 
       @showSizeChange="changePage")
  a-modal(v-model:visible="visible" centered title="操作")  
    a-form(ref="modalForm" :model="modalForm" :rules="rules")  
      template(v-for="item in modal")
        a-form-item(:label="item.label" :name="item.value")
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
        )
</template>
<script lang='jsx'>
import {
  defineComponent,
  onMounted,
  // reactive,
  toRefs,
  getCurrentInstance,
  reactive,
  // createVNode,
  ref,
} from "vue";
import { tableColumns, timeFormat } from "@/utils/common";
import { useRouter } from "vue-router";
export default defineComponent({
  props: {
    // 表格数据获取方法
    tableMethod: [String],
    bottomBtn: {
      type: [Array, Boolean],
      default: () => {
        return [];
      },
    },
    actionLength: {
      type: [Number],
      default: () => {
        return 70;
      },
    },
    // 表格名称
    tableName: {
      type: String,
      required: true,
    },
    editType: {
      type: String,
      default: () => {
        return "modal";
      },
    },
    // 表格筛选条件
    searchCondition: {
      //筛选条件
      type: Object,
      default: () => {
        return {};
      },
    },
    // 表格models文件名
    modelName: {
      type: String,
    },
    // 表格项
    columnList: {
      //显示
      type: Array,
      default: () => {
        return [];
      },
    },
    selectNature: {
      //是否可选
      default: "multi",
      validator(value) {
        return [false, "single", "multi"].includes(value);
      },
    },
    bordered: {
      //表格border
      type: Boolean,
      default: () => {
        return true;
      },
    },
    rowKey: {
      type: [String, Function],
      default: () => {
        return "id";
      },
    },
    titleBtn: {
      type: [Array, Boolean],
      default: () => {
        return [];
      },
    },
    modal: {
      type: [Array],
      default: () => {
        return [];
      },
    },
    rules: {
      type: Object,
      default: () => {
        return {};
      },
    },
    api: {
      type: Object,
      default: () => {
        return {
          path: "", //跳转页面
        };
      },
    },
  },
  setup(props) {
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      tableData: [],
      columns: null,
      tableHeight: 0,
      loading: false,
      pagination: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      },
      modalForm: {},
    });
    const model = ref({});
    const visible = ref(false);

    const getTebleHei = () => {
      // 计算表格长度
      const tableViewHei =
        document.getElementsByClassName("table_view")[0]?.clientHeight;
      const tableHeader =
        document.getElementsByClassName("ant-table-title")[0]?.clientHeight;
      state.tableHeight = tableViewHei - tableHeader;
    };

    const getTableData = async () => {
      props.searchCondition.forEach((item) => {
        if (item.component === "a-range-picker") {
          if (item.value) {
            const date =
              model.value[item.conditionName] &&
              model.value[item.conditionName]?.length > 1
                ? [
                    timeFormat(model.value[item.conditionName][0]),
                    timeFormat(model.value[item.conditionName][1]),
                  ]
                : [];
            if (date?.length) {
              model.value[item.value] = date.join(",");
            } else {
              model.value[item.value] = null;
            }
          }
        }
      });
      const params = {
        ...model.value,
        ...state.pagination,
      };
      state.loading = true;
      const method = proxy.$api[props.tableMethod];
      const data = await method("get", params);
      if (data.records) {
        state.tableData = [];
        // state.tableData = data.records;
        createTableData(data.records, state.tableData);
        state.pagination.total = data.total;
      } else {
        // state.tableData = data;
        state.tableData = [];
        createTableData(data, state.tableData);
      }
      state.loading = false;
    };

    // 构造表格数据
    const createTableData = (data, parentChildren) => {
      data.forEach((element) => {
        // 表格数据结构
        const tableNode = {
          ...element,
          id: element.id,
          name: element.name,
          title: element.name,
          // children: [],
        };
        if (element?.children) {
          tableNode.children = element.children;
        }
        parentChildren.push(tableNode);
        const children = element?.children || [];
        if (children.length) {
          createTableData(children, tableNode.children);
        }
      });
    };

    const setSearchData = () => {
      props.searchCondition.forEach((item) => {
        model.value[item.conditionName] = item.defaultValue
          ? item.defaultValue
          : null;
      });
    };

    const search = () => {
      getTableData();
    };
    const reset = () => {
      setSearchData();
      getTableData();
    };

    const changePage = (current, pageSize) => {
      state.pagination.pageNumber = current;
      state.pagination.pageSize = pageSize;
      getTableData();
    };

    /*弹框表单*/
    const resetModal = () => {
      props.modal?.forEach((item) => {
        state.modalForm[item.value] = item.defaultValue
          ? item.defaultValue
          : null;
      });
    };

    const add = () => {
      if (props.editType === "modal") {
        resetModal();
        visible.value = true;
      } else {
        router.push({
          path: props.api.path,
          query: {},
        });
      }
    };

    // table的非传入数据
    onMounted(() => {
      getTableData();
      state.columns = tableColumns(
        props.modelName,
        props.columnList,
        props.actionLength
      );

      // 构造搜索数据
      setSearchData();
      resetModal();
      getTebleHei();
      window.onresize = () => {
        getTebleHei();
      };
    });

    return {
      getTableData,
      ...toRefs(state),
      model,
      search,
      reset,
      changePage,
      visible,
      add,
    };
  },
});
</script>
<style lang="less" scoped>
// @import url("@/styles/theme/color.less");;
@import url("@/styles/searchTable/index.less");
</style>
