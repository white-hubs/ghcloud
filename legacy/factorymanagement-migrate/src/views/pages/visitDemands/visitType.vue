<template>
  <div>
    <g-table
      ref="tableRef"
      title="走访类型"
      :columns="columns"
      :btns="btns"
      :search="search"
      :api="api"
      :editMode="'custom'"
      @operation="openModel"
      style="height: 600px"
    >
      <!-- <template v-slot:behind="{ record }">
        <a-button @click="reset(record)">重置</a-button>
      </template> -->
      <template v-slot:beforeBtn="{ record }">
        <a-button type="link" @click="operationRecord(record)">编辑</a-button>
      </template>
    </g-table>

    <a-modal
      v-model:visible="panelVisi"
      centered
      :title="modalName"
      @ok="save"
      @cancel="panelCancel"
      :confirmLoading="panelLoading"
    >
      <a-form ref="panelRef" :model="panelModel" :rules="panelRules">
        <a-form-item label="走访类型名称" name="name">
          <a-input
            v-model:value="panelModel.name"
            :placeholder="'请输入走访类型名称'"
          ></a-input>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
} from "vue";

export default defineComponent({
  setup() {
    const state = reactive({
      modalTitle: "走访类型",
      // 表头
      columns: [
        {
          title: "走访类型",
          dataIndex: "name",
          key: "name",
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
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      // 接口
      api: {
        list: "getINTERVIEWTypePage",
        edit: "editType",
        deleteSingle: "delType",
      },
      // 操作按钮
      btns: ["add", "deleteSingle"],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: " 请输入走访类型名称搜索",
        },
      ],
      modalName: "新增",
      panelVisi: false,
      panelLoading: false,
      // 对话框弹窗
      itemId: "",
      panelModel: {
        name: "",
      },
      panelRules: {
        name: [{ required: true, message: "类型名称不能为空" }],
      },
    });
    const { proxy } = getCurrentInstance();

    const panelRef = ref(null);
    const tableRef = ref();
    // 打开弹窗
    const openModel = (type, record) => {
      state.panelVisi = true;
      if (type == "add") {
        state.panelModel.name = "";
        state.modalName = "新增";
      } else if (type == "edit") {
        state.modalName = "编辑";
      }
    };
    const operationRecord = record => {
      state.modalName = "编辑";
      state.panelVisi = true;
      state.panelModel.name = record.name;
      state.itemId = record.id;
    };
    const getDeils = record => {
      proxy.$api.getEnterpriseDeils(record.id, "get").then(res => {
        state.panelModel.name = res.name;
      });
    };
    const save = async () => {
      panelRef.value
        .validate()
        .then(() => {
          if (state.modalName == "新增") {
            proxy.$api
              .addType("INTERVIEW", state.panelModel)
              .then(() => {
                proxy.$message.success("操作成功");
                tableRef.value.getData();
                panelCancel();
                state.panelLoading = false;
              })
              .catch(() => {
                state.panelLoading = false;
              });
          }
          if (state.modalName == "编辑") {
            proxy.$api
              .editType(state.itemId, state.panelModel)
              .then(() => {
                proxy.$message.success("操作成功");
                tableRef.value.getData();
                panelCancel();
                state.panelLoading = false;
              })
              .catch(() => {
                state.panelLoading = false;
              });
          }
        })
        .catch(function(){});
      state.panelLoading = true;
    };
    const reset = () => {
      tableRef.value.reset();
    };
    const panelCancel = () => {
      state.panelVisi = false;
    };
    onMounted(function(){});

    return {
      ...toRefs(state),
      openModel,
      panelCancel,
      save,
      panelRef,
      tableRef,
      getDeils,
      operationRecord,
      reset,
    };
  },
});
</script>

<style></style>
