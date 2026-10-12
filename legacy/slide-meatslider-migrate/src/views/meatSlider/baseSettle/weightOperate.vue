<template lang="pug">
g-detail(
  title="重量损耗"
  :api="api"
  :rules="rules"
  :formList="formList"
  ref="detailRef"
  :beforeSave="beforeSave"
)
</template>
<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
  onMounted,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { millennial } from "@/utils/common";

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    // 数据
    const id = route.query.id;
    const reg = /^\d+(\.\d{0,2})?$/;
    const state = reactive({
      api: {
        detail: "weightlossId",
        add: "getWeightloss",
        edit: "getWeightloss",
      },
      rules: {
        startTime: [
          {
            required: true,
            message: "",
          },
          {
            validator(rule, value) {
              if (value >= 0) {
                // 有终点时间
                if (detailRef.value.gDetailForm.form.endTime) {
                  if (reg.test(value)) {
                    // 比较大小
                    const SN = Number(value);
                    const EN = Number(detailRef.value.gDetailForm.form.endTime);

                    if (SN === EN) {
                      return Promise.reject("起点时间小于结束时间");
                    } else if (SN < EN) {
                      if (reg.test(detailRef.value.gDetailForm.form.endTime)) {
                        detailRef.value.gDetailForm.formRef.clearValidate(
                          "endTime"
                        );
                      }
                      return Promise.resolve();
                    } else if (SN > EN) {
                      return Promise.reject("起点时间小于结束时间");
                    }
                  } else {
                    return Promise.reject(
                      "(请输入正确的起点时间)最多请输入两位小数"
                    );
                  }
                }
                // 没有终点时间
                else {
                  if (reg.test(value)) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject(
                      "请输入正确的起点时间(最多请输入两位小数)"
                    );
                  }
                }
              } else {
                return Promise.reject("请输入起点时间");
              }
            },
          },
        ],
        endTime: [
          {
            required: true,
            message: "",
          },
          {
            validator(rule, value) {
              if (value) {
                if (detailRef.value.gDetailForm.form.startTime) {
                  if (reg.test(value)) {
                    // 比较大小
                    const EN = Number(value);
                    const SN = Number(
                      detailRef.value.gDetailForm.form.startTime
                    );
                    if (SN === EN) {
                      return Promise.reject("结束时间大于起点时间");
                    } else if (SN < EN) {
                      if (
                        reg.test(detailRef.value.gDetailForm.form.startTime)
                      ) {
                        detailRef.value.gDetailForm.formRef.clearValidate(
                          "startTime"
                        );
                      }
                      return Promise.resolve();
                    } else if (SN > EN) {
                      return Promise.reject("结束时间大于起点时间");
                    }
                  } else {
                    return Promise.reject(
                      "请输入正确的终点时间(最多请输入两位小数)"
                    );
                  }
                } else {
                  if (reg.test(value)) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject(
                      "请输入正确的终点时间(最多请输入两位小数)"
                    );
                  }
                }
              } else {
                return Promise.reject("请输入终点时间");
              }
            },
          },
        ],
        loss: [
          {
            required: true,
            message: "请输入重量损耗",
          },
        ],
      },
      formList: [
        {
          title: "基础信息",
          form: [
            {
              label: "起点时间",
              value: "startTime",
              unit: "小时",
              suffix: "小时",
              detailFun: (value) => {
                return value || value === 0
                  ? `${millennial(value)} 小时`
                  : "--";
              },
            },
            {
              label: "终点时间",
              value: "endTime",
              unit: "小时",
              suffix: "小时",
              detailFun: (value) => {
                return value || value === 0
                  ? `${millennial(value)} 小时`
                  : "--";
              },
            },
            { label: "重量损耗", value: "loss", unit: "kg", suffix: "kg" },
            {
              label: "状态",
              value: "enabled",
              component: "a-switch",
              defaultValue: true,
              detailFun: (value) => {
                if (value) {
                  return "启用";
                } else {
                  return "禁用";
                }
              },
            },
            { label: "备注信息", value: "remark", component: "a-textarea" },
          ],
        },
      ],
    });
    const weightForm = reactive({
      id: "",
      startTime: null,
      endTime: null,
      loss: null,
      remark: "",
      enabled: true,
    });
    const weight = ref();
    const detailRef = ref();

    const handleChange = (value) => {};

    const cancel = () => {
      router.back(-1);
    };

    const submit = (status) => {
      weight.value.validate().then(() => {
        proxy.$api
          .getWeightloss(weightForm, weightForm.id ? "put" : "post")
          .then((res) => {
            if (!status) {
              router.back(-1);
            } else {
              weight.value.resetFields();
              weightForm.startTime = "";
              weightForm.endTime = "";
              weightForm.loss = "";
              weightForm.remark = "";
              weightForm.enabled = true;
              weightForm.id = "";
            }
            proxy.$message.success("操作成功");
          })
          .catch(() => {
            proxy.$message.error("保存失败");
          });
      });
    };
    const beforeSave = (form) => {
      if (Number(form.startTime) > Number(form.endTime)) {
        proxy.$message.warn("起点时间不能大于终点时间");
        return false;
      } else {
        return form;
      }
    };
    onMounted(() => {
      if (id) {
        proxy.$api.weightlossId({ id: id },`get` ).then((res) => {
          weightForm.startTime = res.startTime;
          weightForm.endTime = res.endTime;
          weightForm.loss = res.loss;
          weightForm.remark = res.remark;
          weightForm.enabled = res.enabled;
          weightForm.id = res.id;
        });
      }
    });

    return {
      ...toRefs(state),
      weight,
      detailRef,
      weightForm,
      // 方法
      handleChange,
      cancel,
      submit,
      beforeSave,
    };
  },
});
</script>
