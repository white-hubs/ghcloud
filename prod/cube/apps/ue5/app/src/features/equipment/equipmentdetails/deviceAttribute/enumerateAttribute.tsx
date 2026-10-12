import { message } from "ant-design-vue";
import { defineComponent, reactive, toRefs, watch } from "vue";

import { cubeDeviceCenterService } from "@/infrastructure/api/service";

import styles from "./enumerateAttribute.module.less";

export default defineComponent({
  props: {
    curValue: {
      type: [Boolean, String, Number],
    },
    attributeItem: {
      type: Object,
      default: () => {
        return {};
      },
    },
    deviceId: {
      type: String,
      default: null,
    },
    code: {
      type: String,
      default: null,
    },
  },
  emits: ["update:curValue"],
  setup(props, { emit }) {
    const state = reactive({
      value: String(props.curValue),
      timer: null,
      passwordVisible: false,
      storageValue: "",
      password: "",
    });
    const handleOk = async () => {
      clearTimeout(state.timer);
      state.timer = setTimeout(() => {
        let params = {
          deviceId: props.deviceId,
          propWriteValues: [
            {
              code: props.attributeItem.attributeCode,
              expectedValue: state.storageValue,
            },
          ],
        };
        cubeDeviceCenterService
          .controlWithPermission(params)
          .then((res) => {
            message.success("下发指令成功");
            emit("update:curValue", state.value);
          })
          .catch(() => {
            state.value = String(props.curValue);
          })
          .finally(() => {
            state.passwordVisible = false;
            state.password = "";
          });
      }, 1000);
    };
    const cancel = async () => {
      state.value = String(props.curValue);
      state.password = "";
    };
    const changeValue = async (value) => {
      state.storageValue = value.target.value;
      handleOk();
    };
    watch(
      () => props.curValue,
      () => {
        state.value = String(props.curValue);
      },
    );
    return {
      ...toRefs(state),
      handleOk,
      cancel,
      changeValue,
    };
  },
});
