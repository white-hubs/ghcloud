<template lang="pug">
a-form(ref="rulesForm" :model="baseData" :rules="rules" layout="inline")
  a-form-item(name="durationStart")
    a-input(v-model:value="baseData.durationStart" addon-after="小时" style="width: 180px" disabled)
  a-form-item(label="到" :colon="false")  
  a-form-item(label="" name="durationEnd")  
    a-input(addon-after="小时" v-model:value="baseData.durationEnd" style="width: 180px" @change="change('durationEnd')")
  a-form-item(:label="linkWords" name="durationFee")  
    a-input(addon-after="元" v-model:value="baseData.durationFee" style="width: 180px" @change="change('durationFee')")
  a-form-item
    a-space(:size="16")
      a-button(v-if="length > 0" @click="deleteItem") 删除
</template>

<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  createVNode,
  reactive,
  toRefs,
  watch,
  ref,
} from "vue";
import { millennial, timeFormat } from "@/utils/common";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
export default defineComponent({
  props: {
    linkWords: {
      type: String,
      default: "收费",
    },
    baseData: {
      type: Object,
      default: () => {},
    },
    index: {
      type: Number,
    },
    length: {
      type: Number,
    },
    isAdd: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const rulesForm = ref();
    const reg = /^[1-9]\d*$/;

    const state = reactive({
      rules: {
        durationStart: [{ required: true, message: "请填写开始时间" }],
        durationEnd: [
          { required: true, message: "" },
          {
            validator() {
              if (!props.baseData.durationEnd) {
                return Promise.reject("请填写结束时间");
              }
              if (!reg.test(props.baseData.durationEnd)) {
                return Promise.reject("请正确填写结束时间(正整数)");
              }
              if (
                Number(props.baseData.durationStart) >=
                Number(props.baseData.durationEnd)
              ) {
                return Promise.reject("结束时间小于开始时间");
              } else {
                return Promise.resolve("");
              }
            },
          },
        ],
        durationFee: [
          { required: true, message: "请填写价格" },
          {
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
            message: "请输入正确的价格(两位小数)",
          },
        ],
      },
    });

    const formVal = async () => {
      let res;
      await rulesForm.value
        .validate()
        .then(() => {
          res = true;
        })
        .catch(() => {
          res = false;
        });
      return res;
    };
    const formValItem = async (value) => {
      let res;
      await rulesForm.value
        .validateFields(value)
        .then(() => {
          res = true;
        })
        .catch(() => {
          res = false;
        });
      return res;
    };

    const deleteItem = () => {
      Modal.confirm({
        title: "提示",
        content: "当前规则删除后无法恢复，请确定是否删除？",
        okText: "确定",
        cancelText: "取消",
        centered: true,
        icon: createVNode(ExclamationCircleOutlined),
        onOk: () => {
          emit("delete-data", props.index);
        },
        onCancel: () => {},
      });
    };

    const change = async (value) => {
      const res = await formValItem(value);
      if (
        props.baseData?.durationEnd &&
        props.baseData?.durationFee &&
        Number(props.baseData?.durationEnd) >
          Number(props.baseData?.durationStart) &&
        res
      ) {
        emit("change-status", true, props.index);
      }
    };

    return {
      rulesForm,
      ...toRefs(state),
      deleteItem,
      formVal,
      change,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-form-inline) {
  text-align: left;
}
:deep(.ant-empty) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.title {
  font-size: 14px;
  font-weight: bold;
  border-bottom: 1px solid #f3f3f3;
}
.flex {
  align-items: center;
}
</style>
