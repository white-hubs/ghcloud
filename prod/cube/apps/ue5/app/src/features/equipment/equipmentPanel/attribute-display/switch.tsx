import { message } from "ant-design-vue";
import { defineComponent } from "vue";
import { ref, watch } from "vue";

import { AttributeNode } from "./type";
import { attributeWriteValue } from "@/infrastructure/api/device";

import styles from "./switch.module.less";

export const Switch = defineComponent({
  name: "Switch",
  props: {
    deviceId: { type: String, required: true, default: "" },
    initValue: { type: null, required: true, default: null },
    attributeItem: { type: null, required: true, default: () => null },
  },
  setup(props, ctx) {
    interface Props {
      deviceId: string;
      initValue: any;
      attributeItem: AttributeNode;
    }
    const curValue = ref(props.initValue);
    watch(
      () => props.initValue,
      (newValue) => {
        curValue.value = newValue;
      },
    );
    const change = async (value: string) => {
      let params = {
        deviceInstanceId: props.deviceId,
        keyValues: [
          {
            attributeCode: props.attributeItem.attributeCode,
            originalValue: {
              name: props.attributeItem.attributeName,
              value: props.initValue,
            },
            expectedValue: {
              name: props.attributeItem.attributeName,
              value: value,
            },
          },
        ],
      };
      const res = await attributeWriteValue(params);
      message.success("指令下发成功！");
    };

    return (): JSX.Element => (
      <>
        <div class="attribute-value">
          <a-radio-group
            value={curValue.value}
            onUpdate:value={(v) => {
              curValue.value = v;
            }}
            onChange={change}
            disabled={attributeItem.permission !== "READ_WRITE"}
          >
            {attributeItem.attributeKeyValueVos.map((item) => (
              <a-radio-button value={item.value}> {item.keyName}</a-radio-button>
            ))}
          </a-radio-group>
        </div>
      </>
    );
  },
});

export default Switch;
