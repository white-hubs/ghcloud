import { defineComponent, type PropType } from "vue";

import { getThemeImage } from "@/infrastructure/utils/getImage";

/**
 * Title icons for universal-panel cards.
 * - device: 图1「设备态势」标红图标（device-situation.png）
 * - alarm: 图2「报警记录」标红图标（alarm-record.png）
 * - trend: 图2「报警趋势」标红图标（alarm-trend.png）
 */
export type UniversalPanelCardIconName = "device" | "alarm" | "trend";

const iconFiles: Record<UniversalPanelCardIconName, string> = {
  device: "device-situation.png",
  alarm: "alarm-record.png",
  trend: "alarm-trend.png",
};

export const UniversalPanelCardIcon = defineComponent({
  name: "UniversalPanelCardIcon",
  props: {
    name: {
      type: String as PropType<UniversalPanelCardIconName>,
      required: true,
    },
  },
  setup(props) {
    return (): JSX.Element => <img src={getThemeImage(iconFiles[props.name])} alt="" class="title-icon-img" />;
  },
});

export default UniversalPanelCardIcon;
