<template lang="pug">
g-layout(title="添加菜单")
  template(#content-table)
    a-form(ref="form" :model="model" :rules="rules" v-bind='layout')
      template(v-if="type === 'detail'")
        a-form-item(label="访问端" name="terminalId")
          Select(v-model:value="model.terminalId" :dataMethod="'getTerminals'" :checkValue="'id'" :placeholder="'请选择访问端'"  :disabled="true")
        a-form-item(label="关联父级" name="parentId")  
          TreeSelect(v-model:value="model.parentId" :methodName="'getMenu'" :multiple="false" :treeCheckable="false" :params="{terminalId:model.terminalId}" :placeholder="'请选择菜单父级'" :disabled="true")
        a-form-item(label="菜单名称")
          span {{model.name? model.name:'--'}}
        a-form-item(label="菜单编号")
          span {{model.code? model.code:'--'}}
        a-form-item(label="菜单路径")
          span {{model.path? model.path:'--'}}
        a-form-item(label="菜单状态")
          span(:class="model.enabled? 'normalRow':'deleteRow'") {{model.enabled? '启用':'禁用'}}
        a-form-item(label="菜单图标")  
          img(v-if="imageUrl" :src="imageUrl" alt="avatar" )
          span(v-else) --
        a-form-item(label="备注信息") 
          span {{model.remark?model.remark:'--'}}
      template(v-else)  
        a-form-item(label="访问端" name="terminalId")
          Select(v-model:value="model.terminalId" :dataMethod="'getTerminals'" :checkValue="'id'" :placeholder="'请选择访问端'")
        a-form-item(label="关联父级" name="parentId")  
          TreeSelect(v-model:value="model.parentId" :methodName="'getMenu'" :multiple="false" :treeCheckable="false" :params="{terminalId:model.terminalId}" :disabled="model.terminalId? false:true" :placeholder="'请选择菜单父级'")
        a-form-item(label="菜单名称" name="name")
          a-input(v-model:value="model.name" placeholder="请输入菜单名称" allowClear)
        a-form-item(label="菜单编号" name="code")
          a-input(v-model:value="model.code" placeholder="请输入菜单编号" allowClear)
        a-form-item(label="菜单路径" name="path")
          a-input(v-model:value="model.path" placeholder="请输入菜单路径" allowClear)
        a-form-item(label="菜单状态" name="enabled")
          a-switch(v-model:checked="model.enabled" placeholder="请选择菜单状态" un-checked-children="禁用" checked-children="启用")
        a-form-item(label="菜单图标" name="icon")
         g-upload(
            :file="model.fileList"
            :max="1"
            accept=".jpg,.jpeg,.png, svg"
            @changeFile="handleChange"
          )     
         
        a-form-item(label="备注信息") 
          a-textarea(v-model:value="model.remark" :maxlength="200" showCount :auto-size="{ minRows: 2, maxRows: 15 }" placeholder="请输入备注信息")      
  template(#footer-page)       
    a-button(@click="cancel") 返回
    a-button(type="primary" @click="onSubmit('')" v-if="type !== 'detail'") 保存
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
import { useRouter, useRoute } from "vue-router";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons-vue";
function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}
import { getToken } from "@/services/AccountService";
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

    const fileList = ref([]);
    const loading = ref(false);

    const form = ref();
    const formState = reactive({
      data: {},
      headers: null,
      model: {
        terminalId: null,
        parentId: null,
        name: "",
        code: "",
        path: "",
        enabled: true,
        fileList: [],
        remark: "",
      },
      rules: {
        terminalId: [{ required: true, message: "请选择访问端" }],
        name: [{ required: true, message: "请输入菜单名称" }],
        code: [{ required: true, message: "请填写菜单编号" }],
        // path: [{ required: true, message: "请输入菜单路径" }],
        // fileList: [{ required: true, message: "请上传菜单图标" }],
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

    const handleChange = (info) => {
      if (info[0]) {
        formState.model.icon = info[0];
      } else {
        formState.model.icon = null;
      }
    };

    const getData = async (params) => {
      const data = await proxy.$api.menuId("get", params);
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
    };

    const onSubmit = (status) => {
      form.value.validate().then(async () => {
        delete formState.model.categoryId;
        if (id) {
          await proxy.$api.menuId("put", formState.model);
          proxy.$message.success("操作成功");
          cancel();
        } else {
          await proxy.$api.addAppMenu("post", formState.model);
          proxy.$message.success("操作成功");
          cancel();
        }
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

    watch(
      () => formState.model.terminalId,
      (newVal, oldVal) => {
        if (oldVal) {
          if (newVal !== oldVal) {
            formState.model.parentId = null;
          }
        }
      }
    );

    watch(
      () => formState.model.parentId,
      () => {
        if (!formState.model.parentId) {
          delete formState.rules.path;
        } else {
          Object.assign(formState.rules, {
            path: [{ required: true, message: "请输入菜单路径" }],
          });
        }
      }
    );

    return {
      type,
      layout,
      form,
      fileList,
      loading,
      ...toRefs(formState),
      beforeUpload,
      handleChange,
      onSubmit,
      cancel,
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
  .ant-form-item-control-input {
    text-align: left;
  }
  .ant-form-item-explain {
    text-align: left;
  }
}
</style>
