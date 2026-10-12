import { defineComponent } from "vue";
import { ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { borrowRecordHotTop } from "@/infrastructure/api/library-management";
import barChart from "@/shared-ui/panel/charts/bar/barChart";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./author-rank.module.less";

export const AuthorRank = defineComponent({
  name: "AuthorRank",
  setup(_props, ctx) {
    const hiddenDangerTime = ref<ModelValueItf>();
    const changeHandleHiddenDangerTime = async () => {
      const res = await borrowRecordHotTop({ period: hiddenDangerTime.value.dateRange.join(","), hostType: "BOOK_AUTHOR", topNumber: 10 });
      xData.value = res.map((e) => e.key);
      yData.value = res.map((e) => e.value);
    };
    const xData = ref<string[]>([]);
    const yData = ref<number[]>([]);

    return (): JSX.Element => (
      <>
        <SubPanelTemplate>
          <template>
            {" "}
            <DateInlineForm
              modelValue={hiddenDangerTime.value}
              onUpdate:modelValue={(v) => {
                hiddenDangerTime.value = v;
              }}
              onSearch={changeHandleHiddenDangerTime}
            ></DateInlineForm>
          </template>
          <div class="lineChart">
            {" "}
            <barChart title={""} unit={""} x-data={xData.value} data={[{ color: "#1890FF", name: "", data: yData }]} />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default AuthorRank;
