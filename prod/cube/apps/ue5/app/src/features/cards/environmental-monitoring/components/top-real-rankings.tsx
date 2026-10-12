import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { environmentalStatUePm } from "@/infrastructure/api/securitymanagement";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";

import styles from "./top-real-rankings.module.less";

export const TopRealRankings = defineComponent({
  name: "TopRealRankings",
  props: {
    title: { type: String, required: false, default: "PM2.5实时监测排行榜Top10" },
  },
  setup(props, ctx) {},
});

export default TopRealRankings;
