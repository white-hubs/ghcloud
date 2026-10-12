<template lang="pug">
.container
    g-table(
        ref="modelTable"
        title="模型管理"
        :columns="columns"
        :api="api"
        :search="search"
        :btns="btns"
        :modal="modal"
        :rules="rules",
        editMode="custom"
        @operation="handelEdit"
    )
        template(v-slot:beforeBtn="{record}")
            a-button(type="link" @click="linkArea(record)") 关联区域
    a-modal(v-model:visible.sync="modalVisible" :title="modalTitle" centered @ok="submit" @cancel="close")
        a-form( :model="modelForm" :rules="rules" ref="formRef" :label-col="{span: 4 }")
            a-form-item(label="模型名称" name="name")
                a-input(v-model:value="modelForm.name" placeholder="请输入模型名称")
            a-form-item(label="模型上传" name="fileId")
                g-upload-for-bim(:file="fileList" :sceneCode="GLOBAL_SCENE_CODE.mData" :max="1" accept=".zip" @changeFile="changeFile" listType="text" :size="500" businessKey="bim")
            a-form-item(label="关联区域" name="areaIds")
                a-cascader(v-model:value="modelForm.areaIds" placeholder="请选择关联区域" :options="areaList" change-on-select :fieldNames="propsDefault" @change="changeArea")
    a-modal(v-model:visible.sync="floorModal" v-if="floorModal" title="模型区域关联" centered :footer="null" width="680px")
        p 当前模型：{{curRowBim?.name}}
        p 关联区域：{{curRowBim?.areaName}}
        .floors-container(v-if="rowBimFloors.length")
            .floor-item(v-for="item in rowBimFloors" :key="item.id")
                div {{item.bimLevelName}}
                a-cascader(v-model:value="item.areaIds" placeholder="请选择关联区域" :options="areaList" change-on-select :fieldNames="propsDefault")
                a-button(type="primary" @click="submitBimFloor(item)") 保存
                a-button(v-if="item.areaId" type="danger" @click="deleteBimFloorBind(item)") 移除绑定
</template>
<script lang="jsx">
import gTable from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gTable.vue";
import gUploadForBim from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gUploadForBim.vue";
import { timeFormat } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/utils/common";
import { bimParsingStatus } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/utils/enumerate";
import { defineComponent, getCurrentInstance, onMounted, reactive, ref, toRefs } from "vue";

import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
export default defineComponent({
  components: {
    gUploadForBim,
    gTable,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const modelTable = ref();
    const formRef = ref();
    const state = reactive({
      columns: [
        {
          dataIndex: "name",
          title: "模型名称",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "code",
          title: "模型编号",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "modelFileName",
          title: "BimFace文件名称",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "status",
          title: "解析状态",
          slots: {
            customRender: "status",
          },
          customRender: ({ text }) => {
            if (text) {
              return (
                <PopOver position="topLeft" content={bimParsingStatus[text]}>
                  {bimParsingStatus[text]}
                </PopOver>
              );
            }
          },
        },
        {
          dataIndex: "areaName",
          title: "关联区域",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "createByName",
          title: "创建人",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "createTime",
          title: "创建时间",
          slots: {
            customRender: "createTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={timeFormat(text, true)}>
                {timeFormat(text, true)}
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
      btns: ["add", "deleteSingle"],
      api: {
        list: "getBimModelList",
        add: "addModel",
        deleteSingle: "deleteBimModel",
        detail: "bimModelDetails",
      },
      search: [{ label: "", value: "keyword", placeholder: "名称" }],
      modalVisible: false,
      modalTitle: "新增模型",
      modelForm: {
        id: "",
        name: "",
        fileId: "",
        areaId: "",
        areaIds: [],
        areaName: "",
      },
      fileList: [],
      areaList: [],
      propsDefault: {
        label: "name",
        value: "id",
        children: "children",
      },
      rules: {
        name: [{ required: true, message: "请输入模型名称" }],
        fileId: [{ required: true, message: "请上传模型" }],
        area: [{ required: true, message: "请选择关联区域" }],
      },
      rowBimFloors: [],
      curRowBim: null,
      floorModal: false,
    });
    const getAreaList = async () => {
      const data = await proxy.$api.getAreaList();
      if (data) {
        state.areaList = data;
      }
    };
    const handelEdit = async (type, record) => {
      if (type === "add") {
        state.modalVisible = true;
        state.modalTitle = "新增模型";
      } else if (type === "edit") {
        const data = await proxy.$api.bimModelDetails(record.id, "get");
        state.modalVisible = true;
        state.modalTitle = "编辑模型";
        state.modelForm.name = data.name;
        state.modelForm.areaIds = data.areaIds.split("-");

        // Object.keys(state.modelForm).forEach(key => {
        //     state.modelForm[key] = record[key];
        // })
        // state.modelForm.fileId = record.modelFileId;
        // state.fileList = [{
        //     uid:record.modelFileId,
        //     name:record.modelFileName,
        //     status: 'done',
        //     url:`/filesource/${record.downloadPath}`
        // }]
        // state.modelForm.areaIds = record.area.split('-');
      }
    };
    const changeFile = (fileIds) => {
      state.modelForm.fileId = fileIds[0];
      return false;
    };
    const submit = async () => {
      state.modelForm.areaId = state.modelForm.areaIds[state.modelForm.areaIds.length - 1];
      const data = await proxy.$api.addModel(state.modelForm, "post");
      if (data) {
        state.modalVisible = false;
        proxy.$message.success("操作成功！");
        modelTable.value.getData();
        close();
      }
    };
    const linkArea = (record) => {
      state.floorModal = true;
      state.curRowBim = record;
      getModelFloor(record.areaId);
    };
    const changeArea = (value, selectedOptions) => {
      if (selectedOptions.length) {
        state.modelForm.areaName = selectedOptions[selectedOptions.length - 1].name;
      }
    };
    const getModelFloor = async (params) => {
      const data = await proxy.$api.getBimLevelFloors(params);
      if (data && Array.isArray(data)) {
        state.rowBimFloors = data;
      }
    };
    const deleteBimFloorBind = async (record) => {
      const data = await proxy.$api.deleteBimLevelBind({
        bimAreaId: record.bimAreaId,
        bimLevelName: record.bimLevelName,
      });
      if (data) {
        getModelFloor(state.curRowBim.areaId);
        proxy.$message.success("操作成功！");
      }
    };
    const submitBimFloor = async (record) => {
      if (!record.areaIds.length) {
        proxy.$message.error("请选择关联区域");
        return;
      }
      record.areaId = record.areaIds[record.areaIds.length - 1];
      const data = await proxy.$api.addModelLevelBind(record);
      if (data) {
        getModelFloor(state.curRowBim.areaId);
        proxy.$message.success("操作成功！");
      }
    };
    const close = () => {
      formRef.value.resetFields();
      state.fileList = [];
    };
    onMounted(() => {
      getAreaList();
    });
    return {
      ...toRefs(state),
      handelEdit,
      changeFile,
      submit,
      linkArea,
      modelTable,
      changeArea,
      deleteBimFloorBind,
      submitBimFloor,
      formRef,
      close,
      GLOBAL_SCENE_CODE,
    };
  },
});
</script>

<style lang="less" scoped>
.floors-container {
  .floor-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    > div {
      width: 100px;
    }
    :deep(.ant-btn) {
      margin-left: 32px;
    }
  }
}
</style>
