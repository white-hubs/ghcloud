<template lang="pug">
a-form(ref="form" :rules="rules" :model="model" layout="inline" labelAlign="right")
  a-form-item(label="票号号段：" name="startNum")
    //- a-input(v-model:value.trim="model.startNum" placeholder="请输入开始票号")
    a-input-group(compact)
      a-input(v-model:value.trim="model.startNum" placeholder="请输入开始票号" style="width: calc(50% - 15px);")
      a-input(v-model:value="value13" style="width: 30px;border-left: 0; pointer-events: none; background-color: #fff" placeholder="~" disabled)
      a-input(v-model:value.trim="model.endNum" placeholder="请输入结束票号" style="width: calc(50% - 15px);border-left: 0;")
  //- span.pl1 ~  
  //- a-form-item(label="结束票号：" name="endNum")
  //-   a-input(v-model:value.trim="model.endNum" placeholder="请输入结束票号")
  div.deleteItem
    a-space(:size="16")
      a-button(v-if="ticketList.length > 1" danger @click="deleteItem") 删除  
</template>
<script>
import {
  defineComponent,
  reactive,
  getCurrentInstance,
  ref,
  computed,
  toRefs,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  props: {
    ticketsNum: Object,
    ticketList: Array,
    index: [String, Number],
  },
  setup(props, ctx) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const value13 = ref("");
    // 表单
    const form = ref();
    // 表单元素
    const model = reactive({
      ...props.ticketsNum,
      status: false,
    });

    const reg = /^[+]{0,1}(\d+)$/;

    const rules = {
      startNum: [
        {
          initialValue: "",
          required: false,
          message: "请输入正确票号",
        },
        {
          validator() {
            if (model.startNum) {
              if (!reg.test(model.startNum)) {
                return Promise.reject("请输入整数！");
              } else {
                if (model.endNum) {
                  if (reg.test(model.endNum)) {
                    if (model.startNum.length !== model.endNum.length) {
                      return Promise.reject("开始票号与结束票号位数相同！");
                    } else {
                      if (model.startNum > model.endNum) {
                        return Promise.reject("开始票号小于结束票号！");
                      } else {
                        return Promise.resolve();
                      }
                    }
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
      endNum: [
        {
          initialValue: "",
          required: false,
          message: "请输入正确票号",
        },
        {
          validator() {
            if (model.endNum) {
              if (!reg.test(model.endNum)) {
                return Promise.reject("请输入整数！");
              } else {
                if (model.startNum) {
                  if (reg.test(model.startNum)) {
                    if (model.startNum.length !== model.endNum.length) {
                      return Promise.reject("开始票号与结束票号位数相同！");
                    } else {
                      if (model.startNum > model.endNum) {
                        return Promise.reject("结束票号小于开始票号！");
                      } else {
                        return Promise.resolve();
                      }
                    }
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

    const deleteItem = () => {
      ctx.emit("delete-data", props.index);
    };

    watch(
      () => model.startNum,
      () => {
        // 有开始
        if (model.startNum) {
          // 有结束
          if (model.endNum) {
            // 都符合验证标准
            if (reg.test(model.startNum) && reg.test(model.endNum)) {
              // 长度相等
              if (model.startNum.length === model.endNum.length) {
                // 开始小于结束
                if (model.startNum <= model.endNum) {
                  form.value.clearValidate();
                  model.status = true;
                } else {
                  model.status = false;
                }
              }
              // 长度不相等
              else {
                model.status = false;
              }
            } else {
              model.status = false;
            }
          }
          // 没有结束
          else {
            // 开始符合验证标准
            if (reg.test(model.startNum)) {
              form.value.clearValidate();
              model.status = true;
            }
            // 不符合
            else {
              model.status = false;
            }
          }
        }
        // 没有开始
        else {
          // 有结束
          if (model.endNum) {
            // 结束符合验证标准
            if (reg.test(model.endNum)) {
              form.value.clearValidate();
              model.status = true;
            } else {
              model.status = false;
            }
          }
          // 没有结束
          else {
            model.status = false;
          }
        }
        ctx.emit("add-data", props.index, model);
      }
    );
    watch(
      () => model.endNum,
      () => {
        // 有结束
        if (model.endNum) {
          // 有开始
          if (model.startNum) {
            // 都符合验证标准
            if (reg.test(model.endNum) && reg.test(model.startNum)) {
              // 长度相等
              if (model.startNum.length === model.endNum.length) {
                // 开始结束大小
                if (model.startNum <= model.endNum) {
                  form.value.clearValidate();
                  model.status = true;
                } else {
                  model.status = false;
                }
              } else {
                model.status = false;
              }
            } else {
              model.status = false;
            }
          }
          // 没有开始
          else {
            if (reg.test(model.endNum)) {
              form.value.clearValidate();
              model.status = true;
            } else {
              model.status = false;
            }
          }
        }
        // 没有结束
        else {
          // 有开始
          if (model.startNum) {
            if (reg.test(model.startNum)) {
              form.value.clearValidate();
              model.status = true;
            } else {
              model.status = false;
            }
          }
          // 没有开始
          else {
            model.status = false;
          }
        }
        ctx.emit("add-data", props.index, model);
      }
    );

    return {
      form,
      model,
      rules,
      deleteItem,
      value13,
    };
  },
});
</script>
<style lang="less" scoped>
.pl1 {
  line-height: 32px;
}
.deleteItem {
  margin-left: 20px;
}
</style>
