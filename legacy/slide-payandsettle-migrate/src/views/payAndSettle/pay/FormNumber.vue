<template lang="pug">
a-form(ref="formNum" :rules="FormNumberRule" :label-col="labelCol" :wrapper-col="wrapperCol" :model="model" labelAlign="right")
  a-form-item(v-for="item in data" :key="item" :label="item.name" :name="item.ruleName" )
    a-input-number(v-model:value.trim="model[item.ruleName]" @change="change")
    span.pl2 {{measure}}
</template>
<script lang="jsx">
import { defineComponent, ref, toRefs, reactive, watch } from "vue";
import _ from "lodash";
import { stringify } from "qs";
export default defineComponent({
  props: {
    // rules: Object,
    data: Array,
    measure: String,
  },
  setup(props, ctx) {
    const formNum = ref();
    const state = reactive({
      // data: [],
      rules: _.cloneDeep(props.rules),
    });

    const createFormModel = () => {
      const formModel = {};
      for (let i of props.data) {
        formModel[i.ruleName] = i.value;
      }
      return formModel;
    };

    const params = createFormModel();

    const model = ref(params);

    const reg = /^[1-9]\d*$/;

    const FormNumberRule = {
      primaryLimit: [
        {
          required: true,
          message: "",
        },
        {
          validator() {
            if (!reg.test(model.value.primaryLimit)) {
              if (model.value.primaryLimit || model.value.primaryLimit === 0) {
                return Promise.reject("请输入正整数");
              } else {
                return Promise.reject("请输入");
              }
            } else {
              if (model.value.secondaryLimit) {
                if (model.value.primaryLimit < model.value.secondaryLimit) {
                  return Promise.resolve();
                } else {
                  return Promise.reject("第一档额度小于第二档额度");
                }
              } else if (
                !model.value.secondaryLimit &&
                model.value.tertiaryLimit
              ) {
                if (model.value.primaryLimit < model.value.tertiaryLimit) {
                  return Promise.resolve();
                } else {
                  return Promise.reject("第一档额度小于第三档额度");
                }
              } else {
                return Promise.resolve();
              }
            }
          },
        },
      ],
      secondaryLimit: [
        {
          required: true,
          message: "",
        },
        {
          validator() {
            if (!reg.test(model.value.secondaryLimit)) {
              if (
                model.value.secondaryLimit ||
                model.value.secondaryLimit === 0
              ) {
                return Promise.reject("请输入正整数");
              } else {
                return Promise.reject("请输入");
              }
            } else {
              if (model.value.primaryLimit && !model.value.tertiaryLimit) {
                if (model.value.secondaryLimit > model.value.primaryLimit) {
                  return Promise.resolve();
                } else {
                  return Promise.reject("第二档额度大于第一档额度");
                }
              } else if (
                !model.value.primaryLimit &&
                model.value.tertiaryLimit
              ) {
                if (model.value.secondaryLimit < model.value.tertiaryLimit) {
                  return Promise.resolve();
                } else {
                  return Promise.reject("第二档额度小于第三档额度");
                }
              } else if (
                model.value.primaryLimit &&
                model.value.tertiaryLimit
              ) {
                if (
                  model.value.secondaryLimit < model.value.tertiaryLimit &&
                  model.value.secondaryLimit > model.value.primaryLimit
                ) {
                  return Promise.resolve();
                } else {
                  return Promise.reject("第二档额度大于第一档小于第三档额度");
                }
              }
            }
          },
        },
      ],
      tertiaryLimit: [
        {
          required: true,
          message: "",
        },
        {
          validator() {
            if (!reg.test(model.value.tertiaryLimit)) {
              if (
                model.value.tertiaryLimit ||
                model.value.tertiaryLimit === 0
              ) {
                return Promise.reject("请输入正整数");
              } else {
                return Promise.reject("请输入");
              }
            } else {
              if (model.value.tertiaryLimit) {
                if (model.value.secondaryLimit) {
                  if (model.value.tertiaryLimit > model.value.secondaryLimit) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject("第三档额度大于第二档额度");
                  }
                } else if (
                  !model.value.secondaryLimit &&
                  model.value.primaryLimit
                ) {
                  if (model.value.primaryLimit > model.value.tertiaryLimit) {
                    return Promise.reject("第三档额度大于第一档额度");
                  } else {
                    return Promise.resolve();
                  }
                } else {
                  return Promise.resolve();
                }
              }
            }
          },
        },
      ],
    };

    const change = () => {
      const status = judge(model.value);
      if (status) {
        ctx.emit("changeQuota", model.value);
      }
    };

    const judge = (data) => {
      let status = [];
      for (let i in data) {
        if (_.isNumber(data[i])) {
          status.push(true);
        } else {
          status.push(false);
        }
      }
      const res = status.every((item) => item);
      return res;
    };

    watch(
      () => model.value.primaryLimit,
      () => {
        if (reg.test(model.value.primaryLimit)) {
          if (model.value.secondaryLimit && !model.value.tertiaryLimit) {
            if (model.value.primaryLimit < model.value.secondaryLimit) {
              formNum.value.clearValidate("primaryLimit");
              if (reg.test(model.value.secondaryLimit)) {
                formNum.value.clearValidate("secondaryLimit");
              }
            }
          } else if (!model.value.secondaryLimit && model.value.tertiaryLimit) {
            if (model.value.primaryLimit < model.value.tertiaryLimit) {
              formNum.value.clearValidate("primaryLimit");
              if (reg.test(model.value.tertiaryLimit)) {
                formNum.value.clearValidate("tertiaryLimit");
              }
            }
          } else if (model.value.secondaryLimit && model.value.tertiaryLimit) {
            if (model.value.primaryLimit < model.value.secondaryLimit) {
              formNum.value.clearValidate("primaryLimit");
            }
            if (model.value.secondaryLimit < model.value.tertiaryLimit) {
              if (reg.test(model.value.secondaryLimit)) {
                formNum.value.clearValidate("secondaryLimit");
              }
              if (reg.test(model.value.tertiaryLimit)) {
                formNum.value.clearValidate("tertiaryLimit");
              }
            }
          }
        }
      }
    );
    watch(
      () => model.value.secondaryLimit,
      () => {
        if (reg.test(model.value.secondaryLimit)) {
          if (model.value.primaryLimit && !model.value.tertiaryLimit) {
            if (model.value.primaryLimit < model.value.secondaryLimit) {
              if (reg.test(model.value.primaryLimit)) {
                formNum.value.clearValidate("primaryLimit");
              }
              formNum.value.clearValidate("secondaryLimit");
            }
          } else if (!model.value.primaryLimit && model.value.tertiaryLimit) {
            if (model.value.secondaryLimit < model.value.tertiaryLimit) {
              formNum.value.clearValidate("secondaryLimit");
              if (reg.test(model.value.tertiaryLimit)) {
                formNum.value.clearValidate("tertiaryLimit");
              }
            }
          } else if (model.value.primaryLimit && model.value.tertiaryLimit) {
            if (
              model.value.primaryLimit < model.value.secondaryLimit &&
              model.value.secondaryLimit < model.value.tertiaryLimit
            ) {
              if (
                reg.test(model.value.primaryLimit) &&
                reg.test(model.value.tertiaryLimit)
              ) {
                formNum.value.clearValidate("primaryLimit");
                formNum.value.clearValidate("secondaryLimit");
                formNum.value.clearValidate("tertiaryLimit");
              }
            }
          }
        }
      }
    );
    watch(
      () => model.value.tertiaryLimit,
      () => {
        if (reg.test(model.value.tertiaryLimit)) {
          if (model.value.secondaryLimit && !model.value.primaryLimit) {
            if (model.value.secondaryLimit < model.value.tertiaryLimit) {
              formNum.value.clearValidate("tertiaryLimit");
              if (reg.test(model.value.secondaryLimit)) {
                formNum.value.clearValidate("secondaryLimit");
              }
            }
          } else if (!model.value.secondaryLimit && model.value.primaryLimit) {
            if (model.value.primaryLimit < model.value.tertiaryLimit) {
              if (reg.test(model.value.primaryLimit)) {
                formNum.value.clearValidate("primaryLimit");
              }
              formNum.value.clearValidate("tertiaryLimit");
            }
          } else if (model.value.secondaryLimit && model.value.tertiaryLimit) {
            if (model.value.tertiaryLimit > model.value.secondaryLimit) {
              formNum.value.clearValidate("tertiaryLimit");
            }
            if (model.value.secondaryLimit > model.value.primaryLimit) {
              if (
                reg.test(model.value.primaryLimit) &&
                reg.test(model.value.secondaryLimit)
              ) {
                formNum.value.clearValidate("secondaryLimit");
                formNum.value.clearValidate("primaryLimit");
              }
            }
          }
        }
      }
    );

    return {
      labelCol: {
        span: 'auto',
      },
      wrapperCol: {
        span: 20,
      },
      formNum,
      ...toRefs(state),
      model,
      change,
      FormNumberRule,
    };
  },
});
</script>
<style lang="less" scoped>
:deep(.ant-input-number) {
  width: 180px;
  height: 40px;
  .ant-input-number-input-wrap,
  .ant-input-number-input {
    height: 100%;
  }
}
</style>
