<template lang="pug">
g-layout(:title="type==='detail' ? '产品详情' : type==='edit' ? '编辑产品' : '添加产品'")
  template(#content-table)
    a-form(ref="form" :model="model" :rules="rules" v-bind='layout')
      template(v-if="type === 'detail'")
        
        a-form-item(label="产品名称")
          span {{model.name? model.name:'--'}}
        a-form-item(label="产品编号")
          span {{model.code? model.code:'--'}}
        a-form-item(label="产品域名")
          span {{model.domain? model.domain:'--'}}
        a-form-item(label="所属产品线")  
          span {{model.productLineName? model.productLineName:'--'}}
        a-form-item(label="产品状态")  
          span(:class="model.enabled?'normalRow':'deleteRow'") {{model.enabled? '启用':'禁用'}}
        a-form-item(label="备注信息") 
          span {{model.remark?model.remark:'--'}}
      template(v-else)  
        a-form-item(label="产品名称" name="name")
          a-input(v-model:value="model.name" placeholder="请输入产品名称" allowClear :maxlength="20")
        a-form-item(label="产品编号" name="code")
          a-input(v-model:value="model.code" placeholder="请输入产品编号" allowClear :maxlength="20")
        a-form-item(label="产品状态" name="enabled")
          a-switch(v-model:checked="model.enabled" placeholder="请选择菜单状态" un-checked-children="禁用" checked-children="启用")
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

    const form = ref();
    const formState = reactive({
      data: {},
      headers: null,
      model: {
        appNames: null,
        productLineId: null,
        name: "",
        code: "",
        domain: "",
        enabled: true,
        fileList: [],
        remark: "",
      },
      rules: {
        name: [{ required: true, message: "请输入产品名称" }],
        code: [{ required: true, message: "请填写产品编号" }],
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
      const data = await proxy.$api.productId("get", params);
      if (data && data.records) {
        formState.model = data.records;
        formState.model.productLineId = Number(formState.model.productLineId);
      } else {
        formState.model = data;
        formState.model.productLineId = Number(formState.model.productLineId);
      }
      formState.model.applicationIds = formState.model.applicationVOS.map(
        (item) => item.id
      );
      formState.model.appNames = formState.model.applicationVOS.map(
        (item) => item.name
      );
    };

    const onSubmit = (status) => {
      form.value.validate().then(async () => {
        if (id) {
          await proxy.$api.productId("put", formState.model);
          proxy.$message.success("操作成功");
          cancel();
        } else {
          await proxy.$api.addProduct("post", formState.model);
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
