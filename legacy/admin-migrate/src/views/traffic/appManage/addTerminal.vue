<template lang="pug">
g-layout(:title="type === 'edit' ? '编辑访问端' :type === 'detail' ? '访问端详情' : '添加访问端'")
  template(#content-table)
    a-form(ref="form" :model="model" :rules="rules" v-bind='layout')
      template(v-if="type==='detail'")
        a-form-item(label="所属应用")
          Select(v-model:value="model.applicationId" :dataMethod="'appList'" :checkValue="'id'" :placeholder="'请选择所属应用'")
        a-form-item(label="访问端名称")
          span {{model.name?model.name:'--'}}
        a-form-item(label="访问端编号")
          span {{model.code?model.code:'--'}}
        a-form-item(label="访问端状态" name="enabled")
          span(:class="model.enabled?'normalRow':'deleteRow'") {{model.enabled?'启用':'禁用'}}
        a-form-item(label="备注信息") 
          span {{model.remark? model.remark:'--'}} 
      template(v-else)  
        a-form-item(label="所属应用" name="applicationId")
          Select(v-model:value="model.applicationId" :dataMethod="'appList'" :checkValue="'id'" :placeholder="'请选择所属应用'")
        a-form-item(label="访问端名称" name="name")
          a-input(v-model:value="model.name" placeholder="请输入访问端名称" allowClear :maxlength="20")
        a-form-item(label="访问端编号" name="code")
          a-input(v-model:value="model.code" placeholder="请输入访问端编号" allowClear :maxlength="20")
        a-form-item(label="访问端状态" name="enabled")
          a-switch(v-model:checked="model.enabled" placeholder="请选择访问端状态" un-checked-children="禁用" checked-children="启用")
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
export default defineComponent({
  components: {
    PlusOutlined,
    LoadingOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();

    // const model = reactive({
    //   applicationId: null,
    //   name: "",
    //   code: "",
    //   enabled: true,
    //   remark: "",
    // });

    const form = ref();
    const formState = reactive({
      data: {},
      model: {
        applicationId: null,
        name: "",
        code: "",
        enabled: true,
        remark: "",
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
    const rules = {
      applicationId: [{ required: true, message: "请选择访问端" }],
      name: [{ required: true, message: "请输入菜单名称" }],
      code: [{ required: true, message: "请填写菜单编号" }],
    };

    const id = route.query.id;
    const type = route.query.type;

    const getData = async (params) => {
      const data = await proxy.$api.terminalId("get", params);
      if (data && data.records) {
        formState.model = data.records;
      } else {
        formState.model = data;
      }
    };

    const onSubmit = (status) => {
      form.value.validate().then(async () => {
        if (id) {
          await proxy.$api.terminalId("put", formState.model);
          proxy.$message.success("操作成功");
          cancel();
        } else {
          await proxy.$api.addTerminal("post", formState.model);
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
    });

    return {
      type,
      layout,
      form,
      // model,
      rules,
      ...toRefs(formState),
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
