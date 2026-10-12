import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import trafficRecordsModal from "./trafficRecords-modal";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { throughData } from "@/infrastructure/utils/requestData/accessControl";

import styles from "./traffic-trends.module.less";

export const TrafficTrends = defineComponent({
  name: "TrafficTrends",
  setup(_props, ctx) {
    const showModal = ref(false);
    const columns = ref([
      {
        title: "时间",
        dataIndex: "eventTime",
        width: 120,
      },
      {
        title: "门禁名称",
        dataIndex: "doorName",
      },
      {
        title: "通行方式",
        dataIndex: "eventWay",
      },
    ]);
    // 实时通行数据
    const realTimeTrafficData = async () => {
      let res = await throughData();
      res.forEach((item) => {
        item.eventTime = moment(item.eventTime).format("YYYY-MM-DD HH:mm:ss");
      });
      data.value = res.filter((item) => {
        if (moment(item.eventTime).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")) {
          return item;
        }
      });
    };
    const handleAll = () => {
      showModal.value = true;
    };
    onMounted(() => {
      realTimeTrafficData();
    });
    const data = ref<any>([]);

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="实时通行数据" class="alarm-event">
          <template>
            {" "}
            <div class="dataTitle">
              {" "}
              <div class="dataTitle-right" style="color: #5EA6FF;" onClick={handleAll}>
                {" "}
                查看更多{">>"}
              </div>
            </div>
          </template>
          <div style="height: 200px;">
            {" "}
            <RollTable column={columns.value} data={data.value} showLength={8}></RollTable>
          </div>
          <trafficRecordsModal
            showModal={showModal.value}
            onClose={() => {
              showModal.value = false;
            }}
          ></trafficRecordsModal>
        </SubPanelTemplate>
      </>
    );
  },
});

export default TrafficTrends;
