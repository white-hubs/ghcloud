<template>
  <div class="ctr">
    <g-table
      ref="tableRef"
      title="维保项"
      :api="api"
      :btns="[]"
      :search="search"
      :editMode="'page'"
      :columns="columns"
      :beforeGet="beforeGet"
      :rowSelection="false"
      :scrollX="600"
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
        <a-form-item label="设备类型" name="name">
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
              <div class="inputCtr">
                <label>维保内容：</label>
                <a-input
                  v-model:value="item.maintenaceContent"
                  :style="{ maxWidth: '180px', marginRight: '12px' }"
                  :maxLength="20"
                ></a-input>
              </div>
              <div class="iconCtr">
                <a-popconfirm
                  title="删除当前内容？"
                  @confirm="deleteCont(item.id)"
                >
                  <DeleteOutlined style="color: red" />
                </a-popconfirm>
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
export default defineComponent({
  components: {
    DeleteOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const state = reactive({
      api: {
        list: "maintenanceTerm",
        deleteSingle: "delete",
        path: "/problemsDetails",
      },
      search: [{ label: "", value: "keyword", placeholder: "名称" }],
      columns: [
        // {
        //   dataIndex: "receiveNames",
        //   title: "序号",
        //   slots: {
        //     customRender: "receiveNames",
        //   },
        //   ellipsis: true,
        //   customRender: ({ text }) => {
        //     return (
        //       <PopOver position="topLeft" content={text ? text : ""}>
        //         {text ? text : "--"}
        //       </PopOver>
        //     );
        //   },
        // },
        {
          dataIndex: "name",
          title: "设备类型",
          slots: {
            customRender: "name",
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
          dataIndex: "count",
          title: "维保项",
          slots: {
            customRender: "count",
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
      },
      // rules: {}
    });

    const subProb = (item) => {
      state.model.name = item.name;
      state.model.deviceTypeId = item.id;
      // 查询当前维保项配置
      proxy.$api
        .maintenanceTermDetail({ deviceTypeId: item.id })
        .then((res) => {
          state.model.maintenaceContent = res;
        });
      state.visible = true;
    };

    const contentAdd = () => {
      state.model.maintenaceContent.push({
        deviceTypeId: state.model.deviceTypeId,
        id: getRandomNumberByRange(),
        maintenaceContent: "",
      });
    };

    const deleteCont = (key) => {
      state.model.maintenaceContent = state.model.maintenaceContent.filter(
        (item) => item.id != key
      );
    };

    const save = () => {
      if (state.model.maintenaceContent.length) {
        const params = state.model.maintenaceContent.filter(
          (item) => item.maintenaceContent
        );
        proxy.$api.maintenanceTermOperate(params, "post").then(() => {
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
      state.model.deviceTypeId = null;
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
