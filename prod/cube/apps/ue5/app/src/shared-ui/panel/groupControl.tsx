import { defineComponent } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./groupControl.module.less";

export const GroupControl = defineComponent({
  name: "GroupControl",
  props: {
    groupControlData: { type: Object, required: true },
  },
  setup(props, ctx) {
    interface data {
      img: string;
      value: number;
      label: string;
    }
    interface Props {
      groupControlData: data;
    }
  },
});

export default GroupControl;
