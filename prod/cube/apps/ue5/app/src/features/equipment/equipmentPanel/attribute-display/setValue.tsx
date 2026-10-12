import { message } from "ant-design-vue";
import { defineComponent } from "vue";
import { ref } from "vue";

import { AttributeNode } from "./type";
import { attributeWriteValue } from "@/infrastructure/api/device";

import styles from "./setValue.module.less";

export const SetValue = defineComponent({
  name: "SetValue",
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

    return (): JSX.Element => (
      <>
        <div class="attribute-value">
          <div class="container flex-between">
            <span> {`${curValue.value}${attributeItem.attributeUnitName}`}</span>
            <a-slider
              value={curValue.value}
              onUpdate:value={(v) => {
                curValue.value = v;
              }}
              onChange={change}
              max={attributeItem.valueMax ? Number(attributeItem.valueMax) : 100}
              min={attributeItem.valueMin ? Number(attributeItem.valueMin) : 0}
            ></a-slider>
          </div>
        </div>
      </>
    );
  },
});

export default SetValue;
