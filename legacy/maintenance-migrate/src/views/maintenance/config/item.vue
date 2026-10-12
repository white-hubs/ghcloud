<template>
  <div class="ctr">
    <g-table
      ref="tableRef"
      :title="pageTitle"
      :api="api"
      tableCode="MAINTENANCE_TERM"
      :btns="[]"
      :search="search"
      :editMode="'page'"
      :columns="columns"
      :beforeGet="beforeGet"
      :rowSelection="false"
      :scrollX="600"
      searchCache="true"
    >
      <template v-slot:btn="{ record }">
        <a-button type="link" @click="subProb(record)">配置 </a-button>
      </template>
    </g-table>
    <a-modal
      v-model:visible="visible"
      centered
      title="维保内容"
      @ok="save"
      @cancel="cancel"
    >
      <a-form ref="modalForm" :model="model" :rules="rules">
        <a-form-item label="产品品类" name="name">
          <span>{{ model.name }}</span>
        </a-form-item>
        <a-form-item label="维保内容">
          <a-button type="primary" @click="contentAdd">添加</a-button>
        </a-form-item>
        <a-form-item>
          <div class="itemCtr">
            <div
              v-for="(item, index) in model.maintenaceContent"
              :key="index"
              class="flex-start maintenItem"
            >
              <div class="inputCtr flex">
                <label>维保内容：</label>
                <a-textarea
                  v-model:value="item.maintenanceContent"
                  :style="{ maxWidth: '300px' }"
                  :maxlength="128"
                  :autoSize="{ minRows: 2, maxRows: 8 }"
                ></a-textarea>
              </div>
              <div class="iconCtr">
                <a-button type="link" @click="deleteCont(item.id)">
                  <DeleteOutlined style="color: red" />
                </a-button>
              </div>
            </div>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { useRouter, useRoute } from "vue-router";
import { DeleteOutlined } from "@ant-design/icons-vue";
import _ from "lodash";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  components: {
    DeleteOutlined,
  },
  setup() {
    const { pageTitle } = usePageName()
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const state = reactive({
      api: {
        list: "maintenanceTerm",
        deleteSingle: "delete",
        path: "/problemsDetails",
      },
      search: [
        {
          label: "产品品类",
          value: "categoryCode",
          component: "g-cascader",
          url: 'getDeviceProduct',
          field: { categoryName: "label", categoryCode: "value", children: "children" },
          placeholder: "请选择产品品类",
        }
      ],
      columns: [
        {
          dataIndex: "categoryName",
          title: "产品品类",
          slots: {
            customRender: "categoryName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "maintenanceItemNum",
          title: "维保项",
          slots: {
            customRender: "maintenanceItemNum",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, false) : ""}
              >
                {text || text === 0 ? millennial(text, false) : "--"}
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
          width: 60,
        },
      ],
      visible: false,
      model: {
        deviceTypeId: "",
        name: "",
        maintenaceContent: [],
        maintenanceProject: [],
        detail: undefined
      },
      // rules: {}
    });

    const subProb = (item) => {
      state.model.name = item.categoryName;
      state.model.detail = item;
      // 查询当前维保项配置
      proxy.$api
        .maintenanceTermDetail({ categoryCode: item.categoryCode })
        .then((res) => {
          state.model.maintenaceContent = res;
          state.model.maintenanceProject = res;
        });
      state.visible = true;
    };

    const contentAdd = () => {
      state.model.maintenaceContent.push({
        categoryName: state.model.detail.categoryName,
        categoryCode: state.model.detail.categoryCode,
        maintenanceContent: "",
      });
    };

    const deleteCont = (key) => {
      state.model.maintenaceContent = state.model.maintenaceContent.filter(
        (item) => item.id != key
      );
    };

    const save = () => {
      if (state.model.maintenaceContent.length) {
        const keys = state.model.maintenaceContent.map((item) => item.id)
        const params = state.model.maintenaceContent.map((item) => { return {...item, deleted: false}})
        const list = state.model.maintenanceProject.map((p) => {
          if(!keys.includes(p.id)) {
            p.deleted = true
          }else{
            p.deleted = false
          }
          return p
        }).filter((item) => item?.deleted)
        proxy.$api.maintenanceTermOperate(Array.from(new Set([...params, ...list])), "post").then(() => {
          proxy.$message.success("操作成功");
          tableRef.value.getData();
          cancel();
        });
      } else {
        proxy.$message.warn("请设置维保内容");
      }
    };

    const cancel = () => {
      state.visible = false;
      state.model.detail = undefined;
      state.model.name = null;
      state.model.maintenaceContent = [];
    };

    const getRandomNumberByRange = () => {
      const ids = state.model.maintenaceContent.map((item) => item.id);
      let id = Math.round(Math.random() * 10000);
      if (ids.includes(id)) {
        id = getRandomNumberByRange();
      } else {
        return id;
      }
      // return Math.round(Math.random() * 10000)
    };

    return {
      tableRef,
      ...toRefs(state),
      contentAdd,
      deleteCont,
      subProb,
      cancel,
      save,
      pageTitle
    };
  },
});
</script>
<style lang="less" scoped>
.ctr {
  width: 100%;
  height: 100%;
}
.itemCtr {
  max-height: 200px;
  overflow-y: auto;
  // padding: 12px;
  .maintenItem {
    width: 100%;

    &:not(:first-child) {
      border: 1px solid #f5f5f6;
      border-top: none;
    }
    &:first-child {
      border: 1px solid #f5f5f6;
    }
    .inputCtr {
      width: 90%;
      height: 100%;
      padding: 12px;
      border-right: 1px solid #f5f5f6;
    }
    .iconCtr {
      width: 57px;
      height: 100%;
      text-align: center;
    }
  }
}
</style>
