<template lang="pug">
a-layout
  a-layout-content
    .p2
      a-table(
        :columns="columns",
        :data-source="data",
        :pagination="false",
        :rowKey="(record) => record.id",
        :expandedRowKeys="expandedRowKeys",
        :scroll="{ x: 770, y: tableHeight }",
        :loading="loading"
      )
        template(#title)
          div.flex.justify-between.bottomLine
            g-vertical-line(title="业务菜单管理")
            a-button(type="primary" @click="addBusinessMenu(null)") 新增
        template(#fileVO="{ record }")
          img(:src="record?.fileVO?.path")
        template(#action="{ record }")
          a-space(:size="16")
            a(@click.stop="addBusinessMenu(record)") 编辑
            a-popconfirm(
              title="是否删除当前选中？",
              cancelText="取消",
              okText="确定",
              @confirm.stop="Delete(record)"
            )
              a.deleteRow(@click.stop="") 删除
  a-modal(v-model:visible="visible" :title="modalTitle" @ok="handleOk" @cancel="resetForm")
    a-form(:model="form" :rules="rules" ref="modalForm")
      a-form-item(label="菜单名称" name="name")
        a-input(v-model:value="form.name" placeholder="请输入菜单名称")
      a-form-item(label="菜单图片" name="fileId")
        g-upload(:file="fileList" :sceneCode="GLOBAL_SCENE_CODE.mData" :max="1" @changeFile="changeFile" :size="500" businessKey="mdata")
      a-form-item(label="菜单序号" name="sort")
        a-input(v-model:value="form.sort" placeholder="请输入菜单序号")
</template>
<script>
import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons-vue";
import gUpload from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gUpload.vue";
import gVerticalLine from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gVerticalLine.vue";
import { deleteNullChild } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/utils/common";
import { defineComponent, reactive, toRefs, getCurrentInstance, ref, onMounted, nextTick } from "vue";

import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
export default defineComponent({
  components: { gVerticalLine, gUpload },
  setup() {
    const { proxy } = getCurrentInstance();
    const modalForm = ref();
    const state = reactive({
      tableHeight: 0,
      visible: false,
      modalTitle: "新增业务菜单",
      operation: "add",
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "菜单名称",
          slots: {
            customRender: "name",
          },
        },
        {
          dataIndex: "sort",
          key: "sort",
          title: "菜单序号",
          slots: {
            customRender: "sort",
          },
        },
        {
          dataIndex: "code",
          key: "code",
          title: "菜单编号",
          slots: {
            customRender: "code",
          },
          customRender: ({ text }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: "fileVO",
          key: "fileVO",
          title: "菜单图标",
          slots: {
            customRender: "fileVO",
          },
        },
        {
          dataIndex: "action",
          key: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      data: [],
      loading: true,
      form: {
        id: "",
        name: "",
        fileId: "",
        sort: "",
      },
      rules: {
        name: [{ required: true, message: "请输入菜单名称" }],
        fileId: [{ required: true, message: "请上传菜单图片" }],
      },
      fileList: [],
    });
    const getTableData = async () => {
      const data = await proxy.$api.getSceneType();
      state.loading = false;
      if (data && Array.isArray(data)) {
        state.data = deleteNullChild(data);
      }
    };
    onMounted(() => {
      getTableData();
      nextTick(() => {
        const contentHei = document.querySelector(".view_content .ant-layout-content").clientHeight;
        state.tableHeight = contentHei - 160;
      });
    });
    const addBusinessMenu = (data) => {
      if (data) {
        state.modalTitle = "编辑业务菜单";
        state.operation = "edit";
        state.form = {
          id: data.id,
          name: data.name,
          sort: data.sort,
          fileId: data.fileVO?.id || "",
        };
        state.visible = true;
        state.fileList = data.fileVO
          ? [
              {
                uid: data.fileVO.id,
                id: data.fileVO.id,
                name: data.fileVO.name,
                status: "done",
                url: data.fileVO.path,
                response: {
                  data: { id: data.fileVO.id },
                },
              },
            ]
          : [];
      } else {
        state.modalTitle = "新增业务菜单";
        state.operation = "add";
        state.form = {
          id: "",
          name: "",
          sort: "",
          fileId: "",
        };
        state.fileList = [];
        state.visible = true;
      }
    };
    const handleOk = () => {
      modalForm.value.validate().then(async () => {
        if (state.operation === "add") {
          const data = await proxy.$api.addSceneType(state.form);
          if (data) {
            getTableData();
            proxy.$message.success("操作成功！");
            resetForm();
            state.visible = false;
          }
        } else if (state.operation === "edit") {
          const data = await proxy.$api.editSceneType(state.form);
          if (data) {
            getTableData();
            proxy.$message.success("操作成功！");
            resetForm();
            state.visible = false;
          }
        }
      });
    };
    const resetForm = () => {
      modalForm.value.resetFields();
    };
    const changeFile = (data) => {
      if (data[0]) {
        state.form.fileId = data[0];
      }
    };
    const Delete = async (record) => {
      const data = await proxy.$api.deleteSceneType(record.id);
      if (data) {
        getTableData();
        proxy.$message.success("删除成功！");
      }
    };
    return {
      ...toRefs(state),
      addBusinessMenu,
      handleOk,
      resetForm,
      modalForm,
      changeFile,
      Delete,
      GLOBAL_SCENE_CODE,
    };
  },
});
</script>
<style scoped lang="less">
@import url("@/styles/searchTable/index.less");
img {
  width: 64px;
  height: 64px;
}
</style>
