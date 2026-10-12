import { message } from "ant-design-vue";
import { defineComponent, reactive, toRefs, watch } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import { cubeDeviceCenterService } from "@/infrastructure/api/service";
import { commandMap } from "@/visualization-core/ai/ai-command";

import styles from "./switchAttribute.module.less";

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
    const ueClient = UeClient.getInstance();
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
            try {
              //联动模型孪生体 开关
              if (props.code) {
                ueClient.send("getActorsByProps", { props: { Element_标记: props.code } }, function (res) {
                  if (res.actors.length) {
                    const actorId = res.actors[0].id;
                    const data = {
                      id: actorId,
                      on: true,
                      strength: 1,
                      color: 0,
                    };
                    if (params.propWriteValues[0].expectedValue === "1") {
                      data.on = true;
                    } else {
                      data.on = false;
                    }
                    // 对模型下发开关指令
                    ueClient.send("switchLight", [data]);
                  }
                });
              }
            } catch (error) {}
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
      if (value?.target?.value) {
        state.storageValue = value.target.value;
      } else {
        state.storageValue = props.attributeItem.attributeKeyValueVos.find((item) => item.value === value)?.value;
        state.value = state.storageValue;
      }
      handleOk();
    };
    watch(
      () => props.curValue,
      () => {
        state.value = String(props.curValue);
      },
    );
    // commandMap.set('editDeviceStatus', (value)=>changeValue(value))// 修改设备物联状态
    return {
      ...toRefs(state),
      changeValue,
      handleOk,
      cancel,
    };
  },
});
