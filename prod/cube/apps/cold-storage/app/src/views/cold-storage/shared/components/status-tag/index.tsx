import { defineComponent, type PropType } from "vue";

import { Tag } from "@ghcloud/cube-ui";

import { toneColor, type Tone } from "../types";

import "./index.less";

export const StatusTag = defineComponent({
  name: "StatusTag",
  props: {
    tone: {
      type: String as PropType<Tone>,
      default: "blue",
    },
    text: {
      type: String,
      required: true,
    },
  },
  setup: (props) => () => <Tag color={toneColor[props.tone]}>{props.text}</Tag>,
});
