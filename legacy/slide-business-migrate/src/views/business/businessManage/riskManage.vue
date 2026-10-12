<template lang="pug">
g-layout(title="风险管理")
  template(#content-table)
    a-form(ref="risk" :model="riskForm" :rules="rules" labelAlign="right")
      div.formTitle 
        div 风险级别 
        div.tips.pl3 根据设置的风险级别，满足条件自动标记商户，加强食品安全监管
      a-spin(:spinning="loading")  
        a-form-item(label="低风险商家：审核不通过次数不高于" name="low" :colon="false")
          a-input-number(v-model:value.trim="riskForm.low" placeholder="次数" )
          span.p1 次
        a-form-item(label="中风险商家：审核不通过次数不高于" name="middle" :colon="false")
          a-input-number(v-model:value.trim="riskForm.middle" placeholder="次数" )
          span.p1 次
        a-form-item(label="高风险商家：审核不通过次数高于" name="high" :colon="false")
          a-input-number(v-model:value.trim="riskForm.high" placeholder="次数"  disabled)
          span.p1 次
  template(#footer-page)
    a-button(type="primary" @click="submit") 保存
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  watch,
  getCurrentInstance,
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const reg = /^[1-9]\d*$/;
    // 数据
    const state = reactive({
      rules: {
        low: [
          {
            required: true,
            // message: "请输入低风险次数",
            message: "",
          },
          {
            pattern: new RegExp(/^[1-9]\d*$/, "g"),
            // message: "请输入正整数",
            message: "",
          },
          {
            validator() {
              if (!riskForm.low) {
                return Promise.reject("请输入低风险次数");
              } else {
                if (reg.test(riskForm.low)) {
                  if (riskForm.middle) {
                    if (riskForm.low >= riskForm.middle) {
                      return Promise.reject("低风险次数需小于中风险次数！");
                    } else {
                      return Promise.resolve();
                    }
                  }
                } else {
                  return Promise.reject("请输入正整数");
                }
              }
            },
          },
        ],
        middle: [
          {
            required: true,
            // message: "请输入中风险次数",
            message: "",
          },
          {
            pattern: new RegExp(/^[1-9]\d*$/, "g"),
            // message: "请输入正整数",
            message: "",
          },
          {
            validator() {
              if (!riskForm.middle) {
                return Promise.reject("请输入中风险次数");
              } else {
                if (reg.test(riskForm.middle)) {
                  if (riskForm.low) {
                    if (riskForm.low >= riskForm.middle) {
                      return Promise.reject("中风险次数需大于低风险次数！");
                    } else {
                      return Promise.resolve();
                    }
                  }
                } else {
                  return Promise.reject("请输入正整数");
                }
              }
            },
          },
        ],
        high: [
          {
            required: true,
            message: "请输入高风险次数",
          },
        ],
      },
      loading: false,
    });

    const risk = ref();
    const riskForm = reactive({
      id: "",
      data: [
        { id: null, value: null, type: "LOW" },
        { id: null, value: null, type: "MEDIUM" },
        { id: null, value: null, type: "HIGH" },
      ],
      low: "",
      middle: "",
      high: "",
    });

    const getLevel = (data) => {
      state.loading = true;
      proxy.$api
        .riskLevelData(data,"get")
        .then((res) => {
          if (res) {
            for (let i of res) {
              if (i.type === "LOW") {
                riskForm.low = i.value;
                riskForm.data[0].id = i.id;
              } else if (i.type === "MEDIUM") {
                riskForm.middle = i.value;
                riskForm.data[1].id = i.id;
              } else if (i.type === "HIGH") {
                riskForm.high = i.value;
                riskForm.data[2].id = i.id;
              }
            }
          }
        })
        .finally(() => {
          state.loading = false;
        });
    };

    const submit = () => {
      riskForm.data[0].value = riskForm.low;
      riskForm.data[1].value = riskForm.middle;
      riskForm.data[2].value = riskForm.high;
      const result = riskForm.data.every((item) => item.id);
      risk.value.validate().then(() => {
        proxy.$api
          .riskLevelData(riskForm.data, result ? "put" : "post" )
          .then(() => {
            getLevel();
            proxy.$message.success("操作成功");
          })
          .catch(() => {
            proxy.$message.error("保存失败");
          });
      });
    };

    const cancel = () => {
      router.back(-1);
    };
    onMounted(() => {
      getLevel();
    });
    // watch(
    //   () => riskForm.low,
    //   () => {
    //     if (riskForm.middle) {
    //       if (riskForm.low < riskForm.middle) {
    //         risk.value.clearValidate("low");
    //         risk.value.clearValidate("middle");
    //         riskForm.high = riskForm.middle;
    //       }
    //     }
    //   }
    // );
    watch(
      () => riskForm.middle,
      () => {
        if (reg.test(riskForm.middle)) {
          riskForm.high = riskForm.middle;
        }
      }
    );
    return {
      ...toRefs(state),
      risk,
      riskForm,
      // 方法
      submit,
      cancel,
    };
  },
});
</script>
<style lang="less" scoped>
// @import url("@/styles/theme/color.less");;
.risk {
  width: 100%;
  height: 100%;
  background-color: @white;
}
:deep(.ant-form) {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 30px 30px 0;
  overflow-y: auto;
  > div {
    padding: 20px;
  }
  .ant-input-number {
    width: 180px;
  }
  .ant-spin-nested-loading {
    height: calc(100% - 62px);
  }
}
:deep(.ant-form-item-label) {
  width: 240px;
  // height: 40px;
  // line-height: 40px;
  text-align: left;
}
:deep(.ant-form-item-control) {
  text-align: left;
}
.btnCtr {
  width: 100%;
  height: 70px;
  line-height: 70px;
  position: relative;
  bottom: 0;
  padding-right: 20px;
  text-align: right;
  background-color: @white;
  border-top: 1px solid @colorEee;
  button {
    width: 100px;
  }
}
.formTitle {
  text-align: left;
  padding: 10px;
  display: flex;
  align-items: center;
  .tips {
    font-size: 14px;
    color: @t_body_color;
  }
}
</style>
