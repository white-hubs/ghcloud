import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import DisplayPanel from "./components/display-panel";
import engineeringManagementModel from "./components/engineering-management-model";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeSmallEngineeringService } from "@/infrastructure/api/service";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

export const SmallStatistics = defineComponent({
  name: "SmallStatistics",
  setup(_props, ctx) {
    const listData = ref([
      {
        name: "待验收",
        value: 0,
      },
      {
        name: "进行中",
        value: 0,
      },
      {
        name: "已完成",
        value: 0,
      },
      {
        name: "异常数",
        value: 0,
      },
      {
        name: "工程总数",
        value: 0,
      },
    ]);
    const showModal = ref(false);
    const parameter = ref({
      dateRange: [],
      queryScoped: "",
    });
    let timeFrame = ref<ModelValueItf>();
    const getAlarmLevel = async () => {
      const res = await cubeSmallEngineeringService.projectStatistics({ period: timeFrame.value.dateRange.join(",") });
      listData.value[0].value = res?.waitAccept;
      listData.value[1].value = res?.underway;
      listData.value[2].value = res?.completed;
      listData.value[3].value = res?.abnormal;
      listData.value[4].value = res?.total;
    };
    const openModal = (value) => {
      const type = {
        工程总数: "ALL",
        进行中: "UNDERWAY",
        已完成: "COMPLETED",
        待验收: "WAIT_ACCEPT",
        异常数: "ABNORMAL",
      };
      parameter.value.dateRange = timeFrame.value.dateRange;
      parameter.value.queryScoped = type[value.name];
      showModal.value = true;
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate
          title="小散工程统计"
          v-slots={{
            extra: () => (
              <div class="flex-align">
                <DateInlineForm
                  modelValue={timeFrame.value}
                  onUpdate:modelValue={(v) => {
                    timeFrame.value = v;
                  }}
                  onSearch={getAlarmLevel}
                />
              </div>
            ),
          }}
        >
          <DisplayPanel onItemClick={openModal} bg-img="overView47.png" content-list={listData.value} />
        </SubPanelTemplate>
        <engineeringManagementModel
          onClose={() => {
            showModal.value = false;
          }}
          showModal={showModal.value}
          parameter={parameter.value}
        />
      </>
    );
  },
});

export default SmallStatistics;
