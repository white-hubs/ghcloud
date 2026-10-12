import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import CourtArrangeInfo from "./components/court-arrange-info";
import HistoryCourtTrial from "./components/history-court-trial";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const energyOverviewTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const dataSource = [
      {
        id: "1",
        title: "陶某某诉王某某运输合同纠纷一审",
        case: "民事（2024）川0602民初3180号",
        reason: "运输合同纠纷",
        name: "张某",
        time: "2024年11月13日 15:30",
      },
      {
        id: "2",
        title: "董某诉成都市某某工程队、张某某合同纠纷",
        case: "民事（2024）川0602民初6290号",
        reason: "合同纠纷",
        name: "李某",
        time: "2024年11月13日 17:05",
      },
      {
        id: "3",
        title: "陶某某诉王某某运输合同纠纷一审",
        case: "民事（2024）川0602民初3180号",
        reason: "运输合同纠纷",
        name: "张某",
        time: "2024年11月13日 15:30",
      },
      {
        id: "4",
        title: "董某诉成都市某某工程队、张某某合同纠纷",
        case: "民事（2024）川0602民初6290号",
        reason: "合同纠纷",
        name: "李某",
        time: "2024年11月13日 17:05",
      },
    ];

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="庭审安排信息">
          <template>
            {" "}
            <DateInlineForm
              modelValue={energyOverviewTime.value}
              onUpdate:modelValue={(v) => {
                energyOverviewTime.value = v;
              }}
            ></DateInlineForm>
          </template>
          <CourtArrangeInfo modelValue={energyOverviewTime.timeType} />
        </SubPanelTemplate>
        <SubPanelTemplate title={"历史庭审信息"}>
          {" "}
          <HistoryCourtTrial dataSource={dataSource} />
        </SubPanelTemplate>
      </>
    );
  },
});

export default Right;
