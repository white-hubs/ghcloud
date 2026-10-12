import { message } from "ant-design-vue";
import { defineComponent } from "vue";
import { ref, watch } from "vue";

import { AttributeNode } from "./type";
import { attributeWriteValue } from "@/infrastructure/api/device";

import styles from "./enumerate.module.less";

export const Enumerate = defineComponent({
  name: "Enumerate",
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
    watch(
      () => props.initValue,
      (newValue) => {
        curValue.value = newValue;
      },
    );

    return (): JSX.Element => (
      <>
        <div class="attribute-value">
          <a-select
            value={curValue.value}
            onUpdate:value={(v) => {
              curValue.value = v;
            }}
            disabled={attributeItem.permission !== "READ_WRITE"}
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            onChange={change}
          >
            {attributeItem.attributeKeyValueVos.map((item) => (
              <a-select-option value={item.value}> {item.keyName}</a-select-option>
            ))}
          </a-select>
        </div>
      </>
    );
  },
});

export default Enumerate;
