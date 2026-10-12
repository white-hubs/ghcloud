<template>
  <div id="basePage">
    <g-table :title="pageTitle" editMode="page" tableCode="FAULT_CASE_LIST" ref="tableRef" :columns="columns" :api="api"
      :btns="btns" :search="search" :editType="'page'" :scrollX="600" :showPage="true" :beforeGet="beforeGet">
      <template #header-btn>
        <a-button type="primary" @click="add">新增</a-button>
      </template>
      <template #content-left>
        <div class="baseLeft">
          <div class="list">
            <a-tree v-if="categoryList?.length" :tree-data="categoryList" defaultExpandAll
              :fieldNames="{children:'children', label:'categoryName', key:'categoryCode' }">
              <template v-slot:title="nodeData">
                <div style="display: flex; justify-content: space-between;"
                  @click="checkDeviceType({ ...(nodeData.dataRef ?? nodeData) })">
                  {{ (nodeData.dataRef ?? nodeData).categoryName }}【{{ (nodeData.dataRef ?? nodeData).deviceNum }}】
                </div>
              </template>
            </a-tree>
            <a-empty v-else></a-empty>
          </div>
        </div>
      </template>
    </g-table>
  </div>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  createVNode,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { useRouter, useRoute } from "vue-router";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import { getBusinessPrefix } from '../../../hooks/useBusinessPrefix'
import { getCurrentApplicationCode } from "@/hooks/useCurrentApplication";
import { apiProxy } from "@/api/service";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  components: {
    EditOutlined,
    DeleteOutlined,
  },
  setup() {
    const { pageTitle } = usePageName()
    const businessPrefix = getBusinessPrefix();
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const tableRef = ref();
    const state = reactive({
      api: {
        list: "faultCase",
        deleteSingle: "faultCaseId",
        edit: "dangerTypeId",
        path: "/faultCaseOperate",
      },
      btns: ["edit", "deleteSingle", "detail", 'add'],
      modal: [
        {
          label: "类型名称",
          value: "name",
          maxlength: 20,
          placeholder: "请输入隐患程度",
        },
      ],
      model: {
        id: "",
        name: "",
      },
      modelRules: {
        name: [{ required: true, message: "请输入隐患分类" }],
      },
      rules: {
        name: [{ required: true, message: "请输入隐患程度" }],
      },
      columns: [
        {
          dataIndex: "name",
          title: `${businessPrefix}名称`,
          slots: {
            customRender: "name",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text} position="topLeft">
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "faultTypeName",
          title: `${businessPrefix}类型`,
          slots: {
            customRender: "faultTypeName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text} position="topLeft">
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "productCategoryName",
          title: "产品品类",
          slots: {
            customRender: "productCategoryName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text} position="topLeft">
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
          width: 200,
        },
      ],
      search: [
        {
          label: `${businessPrefix}类型`,
          value: "faultTypeId",
          component: "g-select",
          url: "faultType",
          field: { name: "label", id: "value" },
        },
        { label: "", value: "keyword", placeholder: "名称" },
      ],
      categoryList: [],
      checkedTypeId: "",
      editCategory: "",
      keyword: "",
      visible: false,
    });

    const getCategory = () => {
      apiProxy.cubeFaultRepairServiceProxy.genFaultCaseDeviceTypeList().then(res=>{
        state.categoryList = res;
      }).catch(e=>{
      })
    };


    const category = (item) => {
      state.editCategory = item;
      if (item) {
        state.model.id = item.id;
        state.model.name = item.name;
      }
      state.visible = true;
    };

    const add = () => {
      router.push({
        path: "/faultCaseOperate",
        query: {
          type: "add",
        },
      });
    };

    const download = (record) => {
    };

    const typeSearch = () => {
      getCategory();
    };

    const beforeGet = (params) => {
      return {
        ...params,
        productCategoryCode: state.checkedTypeId ? state.checkedTypeId : "",
      };
    };

    const checkDeviceType = (record) => {
      if (state.checkedTypeId === record.categoryCode) {
        state.checkedTypeId = "";
      } else {
        state.checkedTypeId = record.categoryCode;
      }
      tableRef.value.getData();
    };

    onMounted(() => {
      if (getCurrentApplicationCode() !== 'FAULT') {
        state.columns.splice(2, 1);
      }
      getCategory();
    });

    return {
      tableRef,
      ...toRefs(state),
      checkDeviceType,
      typeSearch,
      beforeGet,
      category,
      download,
      add,
      pageTitle,
      businessPrefix
    };
  },
});
</script>
<style lang="less" scoped>
#basePage {
  width: 100%;
  height: 100%;
}

:deep(.content-left) {
  .baseLeft {
    min-width: 200px;
    height: 100%;
    padding-right: 16px;
    border-right: 1px solid @tableBottomLine;

    .title {
      width: 100%;
      height: 32px;
      line-height: 32px;
    }

    .list {
      width: 100%;
      height: calc(100% - 32px);
      overflow-y: auto;
      padding: 12px 0;

      ul {
        list-style: none;
        margin: 0;
        padding: 0;

        li {
          width: 100%;
          padding: 0 8px;
          cursor: pointer;

          &.primary-color-1-hover:hover {
            background-color: #001529;
            color: #fff;
          }

          .liName {
            width: calc(100% - 35px);
            overflow: hidden;
          }

          .liBtn {
            width: 35px;
            display: flex;
            justify-content: space-between;
          }
        }
      }
    }
  }
}

.rightTable {
  height: 100%;

  :deep(.footer) {
    display: flex;
    justify-content: flex-end;
  }

  :deep(.ant-pagination) {
    display: inline-flex;
    align-items: center;
  }
}
</style>
