<template lang="pug">
a-form(ref="form" :model="model" :rules="rules" layout="inline" labelAlign="right")
  a-form-item(name="startWeight" label="每片")
    //-  :disabled="disabled? false:true"
    a-input-number(v-model:value.trim="model.startWeight" :min="0" placeholder="开始重量" @change="change()" :disabled="disabled && checkedValue === 'TRADE' ? false : true ")
    span.pl1 kg
    span.pl1 ~  
  a-form-item(name="endWeight")
    a-input-number(v-model:value.trim="model.endWeight" :min="0" placeholder="结束重量" @change="change()" :disabled="checkedValue !== 'TRADE' ? true : false ")    
    span.pl1 kg
  span.pl2 基于交易金额分佣比例：
  a-form-item(name="value")
    a-input-number(v-model:value.trim="model.value" :min="0" :max="100" @change="change()" placeholder="请输入分佣比例" :disabled="checkedValue !== 'TRADE' ? true : false ")
    span.pl1 %
  div
    a-space(:size="16")
      a-button(v-if="ruleList.length > 1" danger @click="deleteItem" :disabled="checkedValue !== 'TRADE' ? true : false ") 删除 
</template>
<script>
import {
  defineComponent,
  reactive,
  watch,
  ref,
  getCurrentInstance,
  createVNode,
  toRefs,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { Modal } from "ant-design-vue";
import _ from "lodash";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
export default defineComponent({
  props: {
    ruleList: Array,
    rule: Object,
    index: Number,
    checkedValue: String,
  },
  setup(props, ctx) {
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    const form = ref();
    const model = reactive({
      startWeight: null,
      endWeight: null,
      value: null,
      ...props.rule,
    });

    const state = reactive({
      rules: {
        startWeight: [
          {
            required: props.checkedValue === "TRADE" ? true : false,
            message: "请输入",
          },
          {
            validator() {
              if (props.index === 0) {
                // debugger;
                if (
                  model.startWeight >= model.endWeight &&
                  (model.endWeight > 0 || model.endWeight === 0)
                ) {
                  return Promise.reject("开始重量小于结束重量！");
                } else {
                  return Promise.resolve();
                }
              } else {
                return Promise.resolve();
              }
            },
          },
        ],
        endWeight: [
          {
            required: props.checkedValue === "TRADE" ? true : false,
            message: "",
          },
          {
            validator() {
              if (!model.endWeight && model.endWeight !== 0) {
                return Promise.reject("请输入结束重量！");
              } else {
                if (
                  model.startWeight >= model.endWeight &&
                  (model.startWeight > 0 || model.startWeight === 0)
                ) {
                  return Promise.reject("开始重量小于结束重量！");
                } else {
                  return Promise.resolve();
                }
              }
            },
          },
        ],
        value: [
          {
            required: props.checkedValue === "TRADE" ? true : false,
            message: "",
          },
          {
            validator(rule, value) {
              if (!value) {
                return Promise.reject("请输入分佣比例！");
              } else {
                return Promise.resolve();
              }
            },
          },
        ],
      },
    });

    const disabled = props.index === 0;

    // let rules = ;

    const isClick = ref(false);

    watch(
      () => props.rule,
      (newValue, oldValue) => {
        model.startWeight = newValue.startWeight;
        model.endWeight = newValue.endWeight;
        model.value = newValue.value;
        // 清空后面的值
        if (newValue.endWeight === oldValue.endWeight) {
          if (model.value !== null && model.value !== "") {
            form.value.clearValidate("value");
          }
        } else {
          ctx.emit("clean-arr", props.index);
        }
      },
      {
        deep: true,
      }
    );
    watch(
      () => model.startWeight,
      () => {
        if (
          (model.startWeight > 0 || model.startWeight === 0) &&
          model.endWeight > model.startWeight
        ) {
          form.value.clearValidate("endWeight");
        }
      }
    );
    watch(
      () => model.endWeight,
      () => {
        if (
          (model.startWeight > 0 || model.startWeight === 0) &&
          model.endWeight > model.startWeight
        ) {
          form.value.clearValidate("startWeight");
        }
      }
    );
    watch(
      () => model.value,
      () => {
        // debugger;
        if (model.value === null || model.value === "") {
          form.value.validate();
        } else {
          form.value.clearValidate("value");
        }
      }
    );
    watch(
      () => props.checkedValue,
      () => {
        state.rules = {
          startWeight: [
            {
              required: props.checkedValue === "TRADE" ? true : false,
              message: "请输入开始重量！",
            },
            {
              validator() {
                if (props.index === 0) {
                  // debugger;
                  if (
                    model.startWeight >= model.endWeight &&
                    (model.endWeight > 0 || model.endWeight === 0)
                  ) {
                    return Promise.reject("开始重量小于结束重量！");
                  } else {
                    return Promise.resolve();
                  }
                } else {
                  return Promise.resolve();
                }
              },
            },
          ],
          endWeight: [
            {
              required: props.checkedValue === "TRADE" ? true : false,
              message: "",
            },
            {
              validator() {
                if (!model.endWeight && model.endWeight !== 0) {
                  return Promise.reject("请输入结束重量！");
                } else {
                  if (
                    model.startWeight >= model.endWeight &&
                    (model.startWeight > 0 || model.startWeight === 0)
                  ) {
                    return Promise.reject("结束重量大于开始重量！");
                  } else {
                    return Promise.resolve();
                  }
                }
              },
            },
          ],
          value: [
            {
              required: props.checkedValue === "TRADE" ? true : false,
              message: "",
            },
            {
              validator(rule, value) {
                if (!value) {
                  return Promise.reject("请输入分佣比例！");
                } else {
                  return Promise.resolve();
                }
              },
            },
          ],
        };
      }
    );

    const cancel = () => {};

    const deleteItem = () => {
      // debugger;
      if (
        (props.index === 0 || props.index === props.ruleList.length - 1) &&
        !props.rule.id
      ) {
        ctx.emit("delete-data", props.index);
      } else {
        Modal.confirm({
          title: "提示",
          content: "当前规则删除后无法恢复，请确定是否删除？",
          okText: "确定",
          cancelText: "取消",
          centered: true,
          icon: createVNode(ExclamationCircleOutlined),
          onOk: () => {
            ctx.emit("delete-data", props.index);
          },
          onCancel: () => {},
        });
      }
    };

    const triggerTime = async () => {
      let res;
      await form.value
        .validate()
        .then(() => {
          res = true;
        })
        .catch(() => {
          res = false;
        });
      return res;
    };

    const clearVali = () => {
      form.value?.clearValidate();
    };

    const change = _.throttle(
      function () {
        if (
          (model.startWeight || model.startWeight === 0) &&
          model.endWeight &&
          model.endWeight > model.startWeight
        ) {
          ctx.emit("add-data", props.index, { ...model });
        } else {
          ctx.emit("null-one", props.index, { ...model });
        }
      },
      200,
      {
        leading: false,
        trailing: true,
      }
    );

    return {
      model,
      form,
      // rules,
      change,
      ...toRefs(state),
      isClick,
      disabled,
      deleteItem,
      triggerTime,
      clearVali,
    };
  },
});
</script>
<style lang="less" scoped>
// @import url("@/styles/theme/color.less");;
.pl2 {
  line-height: 32px;
}
.pl1 {
  line-height: 30px;
}
:deep(.ant-form-inline) {
  .ant-form-item-with-help {
    height: 56px !important;
    margin-bottom: 0 !important;
  }
}
</style>
