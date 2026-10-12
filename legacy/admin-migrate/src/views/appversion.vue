<!-- eslint-disable @typescript-eslint/no-unsafe-call -->
<template>
  <g-table ref="gtable" title="版本列表" :columns="columns" :api="{
      list: 'versionlist',
    }" @operation="operation" :rowKey="'id'" :btns="['add']" :scrollX="1000" editMode="custom">
  </g-table>
  <Modal :visible="visible" @cancel="visible = false" title="添加版本" @ok="save" :confirmLoading="loading">
    <Form ref="formRef" :model="formState" :label-col="{
        style: {
          width: '90px',
        },
      }" label-align="right">
      <FormItem label="版本名称" name="name" :rules="[{ required: true, message: '请填写版本名称' }]">
        <Input v-model:value="formState.name" />
      </FormItem>
      <FormItem label="版本号" name="version" :rules="[{ required: true, message: '请填写版本号' }]">
        <Input v-model:value="formState.version" type="number" />
      </FormItem>
      <FormItem label="版本序号" name="sort" :rules="[{ required: true, message: '请填写版本序号' }]">
        <Input v-model:value="formState.sort" type="number" />
      </FormItem>
      <FormItem label="是否强制更新" name="forceUpdated">
        <Switch v-model:checked="formState.forceUpdated" type="number" />
      </FormItem>
      <FormItem label="apk文件">
        <g-upload accept=".apk" v-model:value="formState.fileId" listType="text" size="200">
        </g-upload>
      </FormItem>
      <FormItem label="描述" name="forceUpdated">
        <Textarea v-model:value="formState.remark" type="number" />
      </FormItem>
    </Form>
  </Modal>
</template>
<script lang="ts" setup>
import { h, onMounted, reactive, ref, getCurrentInstance } from "vue";
import {
  Space,
  Popconfirm,
  Modal,
  Form,
  FormItem,
  Input,
  Switch,
  Textarea,
  Upload,
  Button,
  message,
} from "ant-design-vue";
import { addversion } from "../api/ouaa";
import {GLOBAL_SCENE_CODE} from "@ghcloud/cube-file-service"
const { proxy } = getCurrentInstance();

const loading=ref(false)
const gtable = ref();
const formRef = ref();
const save = () => {
  if(formState.value.fileId==''){
  message.error('请上传apk')
  return
  }
  loading.value=true
  formRef.value.validate().then(async () => {
    await addversion(formState.value);
    message.success('添加成功')
    gtable.value.getData();
    loading.value=false
    visible.value = false;
  });
};

const beforeUpload = (file) => {
  return new Promise((reolve, reject) => {
    if (file.type !== "application/vnd.android.package-archive") {
      message.error("只能上传apk文件!");
      return reject(false);
    } else {
      return reolve(true);
    }
  });
};
const filechange = ({file}) => {
  if (file.status == "done") {
    formState.value.fileId = file.response.data.id;
  }
};
const headers = ref({
  tenant: JSON.parse(sessionStorage.getItem("tenant") as any).code,
  Terminal:'kh-admin-web',
  Authorization:
    "Bearer " + JSON.parse(sessionStorage.getItem("token") as any).access_token,
});
const formState = ref({
  terminal: "bimops-manage-app",
  type: "ANDROID",
  forceUpdated: false,
  version: 0,
  sort: 0,
  fileId: "",
  remark: "",
  name: "",
});
const visible = ref<boolean>(false);
const columns = ref([
  {
    title: "名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "类型",
    dataIndex: "type",
    key: "type",
    customRender: ({ record }) => {
      return record.type == "ANDROID" ? "安卓" : "苹果";
    },
  },
  {
    title: "版本号",
    dataIndex: "version",
    key: "version",
  },
  {
    title: "是否强制更新",
    dataIndex: "forceUpdated",
    key: "forceUpdated",
    customRender: ({ record }) => {
      return record.forceUpdated ? "是" : "否";
    },
  },
  {
    title: "更新内容",
    dataIndex: "remark",
    key: "remark",
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    customRender: ({ record }) => {
      return h(Space, { size: 16 }, [
        h(
          Popconfirm,
          {
            title: "确定删除该版本?",
            okText: "删除",
            cancelText: "取消",
            onConfirm: async () => {
              await proxy.$api.deleteversion(record.id);
              gtable.value.getData();
            },
          },
          h(
            Button,
            {
              type:'link',
              danger:true,
              disabled:!window.config.useAdmin,
            },
            "删除"
          )
        )
      ]);
    },
  },
]);
const operation = () => {
  visible.value = true;
};
</script>

<style lang="less" scoped></style>
