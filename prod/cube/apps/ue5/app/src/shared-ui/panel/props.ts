import type { PropType } from "vue";

export const subPanelTemplateProps = {
  title: {
    type: String as PropType<string>,
    default: "",
  },
  titleFontSize: {
    type: String as PropType<string>,
    default: "18px",
  },
};
