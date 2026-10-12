<template lang="pug">
g-layout(title="钱包支付配置")
  template(#content-table)
    a-spin(:spinning="spinning")
      a-form(
        ref="payConfig",
        :model="data",
        :rules="rules",
        labelAlign="right"
      )
        a-form-item(label="支付状态", name="enabled")
          a-switch(
            v-model:checked="data.enabled",
            checked-children="启用",
            un-checked-children="禁用"
          ) 
        a-form-item(label="免密支付", name="status")
          a-switch(
            v-model:checked="data.status",
            checked-children="启用",
            un-checked-children="禁用"
          )
        a-form-item(label="免密额度", name="quota")
          FormNumber(
            v-if="FormNumberData",
            ref="formNumber",
            :data="FormNumberData",
            @changeQuota="change",
            :measure="'元'"
          )
  template(#footer-page)
    a-button(type="primary", @click="onSubmit") 确定
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRaw,
  ref,
  toRefs,
  getCurrentInstance,
  onMounted,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import FormNumber from "./FormNumber.vue";
import {getToken, getNowEnterprise } from '@/utils/auth'
export default defineComponent({
  components: {
    FormNumber,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const formNumber = ref();
    const formState = reactive({
      data: {
        enabled: false,
        status: false,
        primaryLimit: 100,
        secondaryLimit: 200,
        tertiaryLimit: 300,
      },
      spinning: false,
      FormNumberData: null,
    });

    const getData = () => {
      formState.spinning = true;
      proxy.$api
        .balance({
          tenant: getNowEnterprise().code,
        },"get")
        .then((res) => {
          formState.data.id = res.id;
          formState.data.enabled = res.enabled;
          formState.data.status = res.quickPayment.enabled;
          formState.data.primaryLimit = res.quickPayment.primaryLimit;
          formState.data.secondaryLimit = res.quickPayment.secondaryLimit;
          formState.data.tertiaryLimit = res.quickPayment.tertiaryLimit;
          formState.FormNumberData = [
            {
              name: "单次支付不超过",
              value: res.quickPayment.primaryLimit,
              ruleName: "primaryLimit",
              min: 0,
            },
            {
              name: "单次支付不超过",
              value: res.quickPayment.secondaryLimit,
              ruleName: "secondaryLimit",
              min: 0,
            },
            {
              name: "单次支付不超过",
              value: res.quickPayment.tertiaryLimit,
              ruleName: "tertiaryLimit",
              min: 0,
            },
          ];
        })
        .finally(() => {
          formState.spinning = false;
        });
    };

    onMounted(() => {
      getData();
    });

    const payConfig = ref();

    const rules = {
      status: [
        {
          required: true,
          message: "请输入",
        },
      ],
      enabled: [
        {
          required: true,
          message: "请输入",
        },
      ],
    };

    const change = (model) => {
      formState.data.primaryLimit = model["primaryLimit"];
      formState.data.secondaryLimit = model["secondaryLimit"];
      formState.data.tertiaryLimit = model["tertiaryLimit"];
    };

    const onSubmit = () => {
      const reg = /^[1-9]\d*$/;
      const data = {
        enabled: formState.data.enabled,
        quickPayment: {
          enabled: formState.data.status,
          primaryLimit: formState.data.primaryLimit,
          secondaryLimit: formState.data.secondaryLimit,
          tertiaryLimit: formState.data.tertiaryLimit,
        },
        tenant: getNowEnterprise().code,
        id: formState.data.id,
      };
      formNumber.value.formNum.validateFields().then((res) => {
        if (
          data.quickPayment.primaryLimit === 0 ||
          data.quickPayment.secondaryLimit === 0 ||
          data.quickPayment.secondaryLimit === 0
        ) {
          proxy.$message.warn("免密额度金额不能为0");
          return;
        }
        if (
          data.quickPayment.secondaryLimit > data.quickPayment.primaryLimit &&
          data.quickPayment.secondaryLimit < data.quickPayment.tertiaryLimit
        ) {
          if (
            reg.test(data.quickPayment.primaryLimit) &&
            reg.test(data.quickPayment.secondaryLimit) &&
            reg.test(data.quickPayment.tertiaryLimit)
          ) {
            proxy.$api
              .balance(data,"put")
              .then(() => {
                proxy.$message.success("操作成功");
              })
              .catch(() => {
                proxy.$message.error("保存失败");
              })
              .finally(() => {
                getData();
              });
          }
        } else {
          proxy.$message.warn("免密额度金额大小顺序不正确");
        }
      });
    };

    const handleCheckChange = () => {};

    return {
      formNumber,
      payConfig,
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 20,
      },
      ...toRefs(formState),
      rules,
      onSubmit,
      handleCheckChange,
      change,
    };
  },
});
</script>
<style lang="less" scoped>

// @import url("@/styles/theme/color.less");;
.businessCtr {
  border-radius: 4px;
}
:deep(.ant-form) {
  .ant-form-item:first-child {
    //   @media (max-width: 1920px) {
    //     grid-column-start: 1;
    //     grid-column-end: 2;
    //   }
    //   @media (min-width: 1920px) {
    grid-column-start: 1;
    grid-column-end: 2;
    // }
  }
  .ant-form-item-control-input-content .ant-form {
    padding: 0;
    display: grid;
    grid-template-columns: repeat(1, 100%);
    grid-template-rows: repeat(3, 40px);
  }
}
</style>
