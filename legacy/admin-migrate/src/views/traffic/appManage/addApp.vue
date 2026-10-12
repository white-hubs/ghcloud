<template lang="pug">
g-layout(:title="type=== 'detail'? '应用详情' : type==='edit' ? '编辑应用':'添加应用'")
  template(#content-table)
    a-form(ref="form" :model="model" :rules="rules" v-bind='layout')
      template(v-if="type === 'detail'")
        a-form-item(label="所属应用分组" )
          span.detail {{model.applicationGroupName?model.applicationGroupName:'--'}}
        a-form-item(label="应用编号" )
          span.detail {{model.code?model.code:'--'}}
        a-form-item(label="应用名称")
          span.detail {{model.name?model.name:'--'}}
        a-form-item(label="应用图标")  
          span.detail {{model.icon || '--'}}
        a-form-item(label="备注信息") 
          span.detail {{model.remark? model.remark:'--'}}  
      template(v-else)
        a-form-item(label="所属应用分组" name="applicationGroupId")
          g-select(v-model:value="model.applicationGroupId" :url="'appGroup'" :placeholder="'请选择应用分组'" :params="{pageSize:1000,pageNumber:1}")
        a-form-item(label="应用编号" name="code")
          a-input(v-model:value="model.code" placeholder="请输入应用编号" :maxlength="20" :disabled="!useAdmin")
        a-form-item(label="应用名称" name="name")
          a-input(v-model:value="model.name" placeholder="请输入应用名称" :maxlength="20")
        a-form-item(label="应用图标" name="icon")     
          a-input(v-model:value="model.icon" placeholder="请输入图标路径" :disabled="!useAdmin")
        a-form-item(label="备注信息") 
          a-textarea(v-model:value="model.remark" :maxlength="200" showCount :auto-size="{ minRows: 2, maxRows: 15 }" placeholder="请输入备注信息" :disabled="!useAdmin")    
  template(#footer-page)       
    a-button(@click="cancel") 返回
    a-button(type="primary" @click="onSubmit('')" v-if="type!=='detail'" :loading="saveLoading") 保存
</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
  onMounted,
  watch,
} from "vue";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons-vue";
function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}
import { getToken } from "@/services/AccountService";
import { useRouter, useRoute } from "vue-router";
export default defineComponent({
  components: {
    PlusOutlined,
    LoadingOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();

    const id = route.query.id;
    const type = route.query.type;

    const loading = ref(false);
    const saveLoading=ref(false)
    const form = ref();
    const formState = reactive({
      data: {},
      headers: null,
      model: {
        // productLineId: null,
        applicationGroupId: null,
        name: "",
        icon: "",
        remark: "",
        code: "",
        fileList: [],
      },
    });

    const layout = {
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 16,
      },
    };

    const getData = async (params) => {
      const data = await proxy.$api.appId("get", params);
      if (data && data.records) {
        formState.model = data.records;
      } else {
        formState.model = data;
        formState.model.fileList = data.fileVO
          ? [
              {
                uid: data.fileVO.id,
                name: data.fileVO.name,
                status: "done",
                url: data.fileVO.path,
              },
            ]
          : [];
      }
      //
    };

    const beforeUpload = (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg" ||
        file.type === "image/svg+xml";

      if (!isJpgOrPng) {
        proxy.$message.error("仅限上传jpg,jpeg,png,svg格式!");
      }

      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        proxy.$message.error("图片小于2MB!");
      }

      return isJpgOrPng && isLt2M;
    };

    const handleChange = (info, fileList) => {
      if (info[0]) {
        formState.model.icon = info[0];
      } else {
        formState.model.icon = null;
      }
    };

    const rules = {
      // productLineId: [{ required: true, message: "请选择产品线" }],
      applicationGroupId: [{ required: true, message: "请选择应用分组" }],
      name: [{ required: true, message: "请填写应用名称" }],
      code: [{ required: true, message: "请填写应用编号" }],
      icon: [{ required: true, message: "请上传应用图标" }],
    };

    const onSubmit = (status) => {
      saveLoading.value=true
      form.value.validate().then(async () => {
        if (id) {
          await proxy.$api.appId("put", formState.model);
          proxy.$message.success("操作成功");
          cancel();
        } else {
          await proxy.$api.addApp("post", formState.model);
          proxy.$message.success("操作成功");
          cancel();
        }
        saveLoading.value=false
      });
    };

    const cancel = () => {
      router.back(-1);
    };

    onMounted(async () => {
      if (id) {
        getData(id);
      }
      const token = await getToken();
      formState.headers = {
        Authorization: "Bearer " + token.access_token,
        terminal: window.config.terminal,
      };
    });

    return {
      layout,
      form,
      type,
      rules,
      loading,
      saveLoading,
      ...toRefs(formState),
      beforeUpload,
      handleChange,
      onSubmit,
      cancel,
      useAdmin:window.config.useAdmin
    };
  },
});
</script>
<style lang="less" scoped>
:deep(.ant-upload) {
  width: 100px;
  height: 100px;
  overflow: hidden;
  img {
    width: 100px;
    height: 100px;
  }
}
:deep(.ant-form) {
  display: grid;
  @media (max-width: 1366px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1366px) and (max-width: 1600px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (min-width: 1600px) {
    grid-template-columns: repeat(4, 1fr);
  }
  .ant-form-item-control-input-content {
    display: inline-block;
    text-align: left;
  }
  .ant-form-item-explain {
    text-align: left;
  }
}
</style>
