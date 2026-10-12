<template lang="pug">
g-layout(title="分佣规则")
  template(#content-table)
     a-form(ref="rulesRef" :model="weightForm" :rules="rules" labelAlign="right")
      a-spin(:spinning="spinning")
        a-radio-group(v-model:value="checkedValue")
          div
            a-radio(:style="radioStyle" :value="'TRADE'") 交易金额
            div 
              div.ruleBtn 
                a-button(@click="handleAddRule" type="primary" :disabled="checkedValue !== 'TRADE'") 添加规则 
              div.money(v-for="rule, index in list" :key="rule.key")
                a-form-item
                  //- :ref="el=> setRef(rule,index)"
                  //- ref="configRule"
                  settlementConfigRule(:ref="el=> setRef(el,index)" :ruleList="list" :rule="rule" :checkedValue="checkedValue" :index="index" @add-data="addData" @delete-data="deleteItem" @clean-arr="cleanArr" @null-one="nullOne")
          div    
            a-radio(:style="radioStyle" :value="'WEIGHT'") 重量
            div
              a-form-item(label="每kg分佣" name="weight")
                a-input-number(:min="0" v-model:value.trim="weightForm.weight" placeholder="请输入" :disabled="checkedValue !== 'WEIGHT' ? true : false" step="0.01")
                span.pl1 元
          div    
            a-radio(:style="radioStyle" :value="'NUM'") 数量
            div
              a-form-item(label="每片分佣" name="number")
                a-input-number(:min="0" v-model:value.trim="weightForm.number" placeholder="请输入" :disabled="checkedValue !== 'NUM' ? true : false" step="0.01")
                span.pl1 元
  template(#footer-page)
    a-button(type="primary" @click="submit") 保存 
</template>
<script>
import settlementConfigRule from "./settlementConfigRule.vue";

import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
  onMounted,
  watch,
  computed,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { guid } from "@/utils/common.js";

export default defineComponent({
  components: {
    settlementConfigRule,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    const configRule = ref(null);
    const reg = /^\d+(\.\d{0,2})?$/;

    const checkedValue = ref("TRADE");

    const list = computed(() => {
      return [...state.amountRules, ...[]];
    });
    const state = reactive({
      rules: {
        weight: [
          {
            required: checkedValue.value === "WEIGHT" ? true : false,
            message: "请输入",
          },
          {
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
            message: "请输入正确的价格(最多两位小数)",
          },
        ],
        number: [
          {
            required: checkedValue.value === "NUM" ? true : false,
            message: "请输入",
          },
          {
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
            message: "请输入正确的价格(最多两位小数)",
          },
        ],
      },
      params: [
        {
          id: null,
          way: "TRADE",
          rules: [],
          flag: false,
          name: "交易金额",
        },
        {
          id: null,
          way: "WEIGHT",
          rules: [{ value: "" }],
          flag: false,
          name: "重量",
        },
        {
          id: null,
          way: "NUM",
          flag: false,
          rules: [{ value: "" }],
          name: "数量",
        },
      ],
      amountRules: [
        {
          key: guid(),
          startWeight: null,
          endWeight: null,
          value: null,
        },
      ],
      spinning: false,
    });

    const refs = ref([]);

    const setRef = (rule, index) => {
      refs.value[index] = rule;
    };

    const handleAddRule = () => {
      // debugger;
      const res = state.amountRules.every((item) => {
        return (
          item.startWeight < item.endWeight &&
          item.value !== null &&
          item.value >= 0 &&
          item.startWeight >= 0
        );
      });
      if (res) {
        const index = state.amountRules.length;
        state.amountRules.push({
          key: guid(),
          startWeight: state.amountRules[index - 1].endWeight,
          endWeight: null,
          value: null,
        });
      } else {
        refs.value[list.value.length - 1].triggerTime();
        //  configRule.value.triggerTime();
      }
    };

    const radioStyle = reactive({
      display: "block",
      height: "30px",
      lineHeight: "30px",
      textAlign: "left",
    });

    const weightForm = reactive({
      weight: null,
      number: null,
    });
    const rulesRef = ref();

    const addData = (index, model) => {
      state.amountRules[index] = model;
    };

    const nullOne = (index, model) => {
      state.amountRules[index] = model;
    };

    const getRules = () => {
      // debugger
      state.spinning = true;
      proxy.$api
        .settlementConfig(null,"get")
        .then((res) => {
          if (res.length) {
            const moneyIndex = res.findIndex((item) => item.way === "TRADE");
            const weightIndex = res.findIndex((item) => item.way === "WEIGHT");
            const numIndex = res.findIndex((item) => item.way === "NUM");
            weightForm.weight = res[weightIndex].rules[0].value;
            weightForm.number = res[numIndex].rules[0].value;
            // 重量
            state.amountRules = res[moneyIndex].rules.map((item) => {
            return {
              ...item,
              value: (item.value * 100).toFixed(2).replace('.00','')
            };
          });
            state.params[0].id = "1"; // 标识符区分post / put

            state.params[1] = res[weightIndex];
            state.params[1].id = "2";

            state.params[2] = res[numIndex];
            state.params[2].id = "3";

            checkedValue.value = res.filter((item) => item.flag)[0].way;
          }
        })
        .finally(() => {
          state.spinning = false;
        });
    };

    const deleteItem = (index) => {
      if (state.amountRules[index].id) {
        proxy.$api
          .settlementConfigId({
            id: state.amountRules[index].id,
          },"delete")
          .then(() => {
            if (index === 0 || index === state.amountRules.length - 1) {
              state.amountRules.splice(index, 1);
            } else {
              Object.assign(state.amountRules[index + 1], {
                startWeight: state.amountRules[index - 1].endWeight,
              });
              state.amountRules.splice(index, 1);
            }
            proxy.$message.success("操作成功");
          });
      } else {
        state.amountRules.splice(index, 1);
        proxy.$message.success("操作成功");
      }
    };

    const cancel = () => {
      router.back(-1);
    };

    const cleanArr = (index) => {
      // 清空后面数组的值
      state.amountRules = state.amountRules.filter((item, idx) => {
        if (idx > index) {
          item.startWeight = null;
          item.endWeight = null;
          item.value = null;
        }
        return item;
      });
      if (index + 1 !== state.amountRules.length) {
        state.amountRules[index + 1].startWeight =
          state.amountRules[index].endWeight;
        state.amountRules[index + 1].endWeight = "";
      }
    };

    const submit = async () => {
      // const res = state.amountRules.every((item) => {
      //   return (
      //     item.startWeight < item.endWeight &&
      //     item.startWeight >= 0 &&
      //     item.startWeight !== null &&
      //     item.value !== null
      //   );
      // });

      rulesRef.value.validate().then(async () => {
        if (!checkedValue.value) {
          proxy.$message.error("请选择结算配置分佣规则");
          return;
        }

        // 获取交易金额校验结果
        const resList = [];
        const refList = await refs.value.filter((item) => item !== null);
        // 交易金额只有一项规则
        if (refList.length === 1) {
          if (!refList[0].model.startWeight && !refList[0].model.endWeight) {
            if (checkedValue.value === "TRADE") {
              resList.push(false);
              refList[0].triggerTime();
            } else {
              resList.push(true);
            }
          }
        } else {
          for (let i of refList) {
            i?.triggerTime();
            if (!i.model.startWeight && !i.model.endWeight) {
              resList.push(checkedValue.value === "TRADE" ? false : true);
            } else {
              const result = await i?.triggerTime();
              resList.push(result);
            }
          }
        }

        const checkRes = resList.every((item) => item);

        // if (res && checkRes) {
        if (checkRes) {
          // 重量
          state.params[1].rules[0].value = weightForm.weight;
          // 数量
          state.params[2].rules[0].value = weightForm.number;
          state.params = state.params.map((item) => {
            item.flag = false;
            return item;
          });
          // 选择规则
          const index = state.params.findIndex(
            (item) => item.way === checkedValue.value
          );
          state.params[index].flag = true;
          const hasId = state.params.every((item) => item.id);
          state.params[0].rules = state.amountRules.map((item) => {
            return {
              ...item,
              value: item.value / 100,
            };
          });

          if (hasId) {
            proxy.$api
              .settlementConfig(state.params, "put")
              .then(() => {
                proxy.$message.success("操作成功");
              })
              .finally(() => {
                getRules();
              })
              .catch(() => {
                proxy.$message.error("保存失败");
              });
          } else {
            proxy.$api
              .settlementConfig(state.params,"post" )
              .then(() => {
                proxy.$message.success("操作成功");
              })
              .finally(() => {
                getRules();
              })
              .catch(() => {
                proxy.$message.error("保存失败");
              });
          }
        }
      });
    };

    onMounted(() => {
      getRules();
    });

    watch(
      () => checkedValue.value,
      async () => {
        const refList = await refs.value.filter((item) => item !== null);
        for (let i of refList) {
          // 如果只有一个且没有填--清除校验
          if (refList.length === 1) {
            if (!i.model.startWeight && !i.model.endWeight) {
              i?.clearVali();
            }
          } else {
            const result = await i?.triggerTime();
            if (result) {
              i?.clearVali();
            }
          }
        }
        await rulesRef.value.clearValidate();
        state.rules = {
          weight: [
            {
              required: checkedValue.value === "WEIGHT" ? true : false,
              message: "请输入",
            },
            {
              pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
              message: "请输入正确的价格(最多两位小数)",
            },
          ],
          number: [
            {
              required: checkedValue.value === "NUM" ? true : false,
              message: "请输入",
            },
            {
              pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
              message: "请输入正确的价格(最多两位小数)",
            },
          ],
        };
      }
    );

    return {
      ...toRefs(state),
      radioStyle,
      rulesRef,
      weightForm,
      value: ref(undefined),
      checkedValue,
      configRule,
      cancel,
      submit,
      handleAddRule,
      addData,
      deleteItem,
      list,
      cleanArr,
      setRef,
      nullOne,
    };
  },
});
</script>
<style lang="less" scoped>
.inspector {
  width: 100%;
  height: 100%;
  background-color: @white;
  .title {
    width: 100%;
    height: 40px;
    line-height: 30px;
    text-align: left;
    padding-left: 20px;
    font-family: @fontMedium;
  }
  > :deep(.ant-form) {
    overflow-y: auto;
  }
}

:deep(.ant-form) {
  width: 100%;
  height: calc(100% - 110px);
  .rulesContent {
    padding: 30px;
  }
  // display: grid;
  // grid-template-columns: repeat(1, 100%);
  // grid-template-rows: repeat(auto-fill, 7%);
  .pl1 {
    line-height: 30px;
  }
}

:deep(.ant-radio-group) {
  width: 100%;
  height: 100%;
  padding: 20px;
  > div {
    width: 100%;
    display: grid;
    grid-template-columns: 10% 90%;
  }
}
.ruleBtn {
  text-align: left;
  padding: 0px 20px 20px;
}

:deep(.ant-form-item-control) {
  text-align: left;
}
:deep(.ant-form-item-label) {
  // text-align: left;
  width: 100px;
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
}
:deep(.ant-input-number),
:deep(.ant-form-item-explain) {
  margin-left: 8px;
  .ant-input-number-input {
    padding-left: 8px;
  }
}
:deep(.ant-form-item-control-input-content) {
  width: 100%;
  // height: 32px;
  // line-height: 32px;
  display: flex;
}
:deep(.ant-input-number) {
  width: 150px;
}
.money {
  height: 56px;
  overflow: hidden;
}
</style>
