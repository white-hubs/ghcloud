<template lang="pug">
g-layout(:title="pageTitle")
  template(#content-search)
    .detail-form
      a-form(layout="inline" :model="form" :rules="rules" ref="formRef")
        a-form-item(label="档位租赁流程" name="leaseFlowId")
          g-select(v-model:value="form.leaseFlowId" url="getFlowPage" :params="{pageNumber:1,pageSize:1000}")
        a-form-item(label="档位退租流程" name="rentFlowId")
          g-select(v-model:value="form.rentFlowId" url="getFlowPage" :params="{pageNumber:1,pageSize:1000}")

  template(#footer-page)
    a-button(type="primary" @click="saveRecord") 保存
</template>

<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
  ref,
} from "vue";
import { replaceObjectKeys } from "@pansy/utils";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  setup() {
    const { pageTitle } = usePageName()
    const formRef = ref();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      form: {
        leaseFlowId: null,
        rentFlowId: null,
      },
      rules: {
        leaseFlowId: [
          { required: true, message: "请选择档位租赁流程", trigger: "change" },
        ],
        rentFlowId: [
          { required: true, message: "请选择档位退租流程", trigger: "change" },
        ],
      },
    });
    /*获取数据*/
    const getRecord = () => {
      proxy.$api.getLeaseConfig().then((res) => {
        if (res.leaseFlowId) {
          state.form = res;
        }
      });
    };
    onMounted(() => {
      getRecord();
    });

    /*保存数据*/
    const saveRecord = () => {
      formRef.value.validate().then((res) => {
        proxy.$api.postLeaseConfig( state.form).then((res) => {
          proxy.$message.success("操作成功");
          getRecord();
        });
      });
    };
    return {
      ...toRefs(state),
      formRef,
      saveRecord,
      pageTitle
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
</style>
