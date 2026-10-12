import { defineComponent } from "vue";
import { reactive, toRefs, onMounted, ref } from "vue";

import DeviceStatistics from "@/features/cards/security-monitoring-safty/device-statistics";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";

import styles from "./court-trail-device.module.less";

export const CourtTrailDevice = defineComponent({
  name: "CourtTrailDevice",
  setup(_props, { expose }) {
    /**
     * 数据部分
     */
    const state = reactive({});
    const deviceStatisticsData = reactive({
      title: "科技法庭设备数",
      total: 19,
      itemize: [
        {
          name: "离线",
          label: "在线",
          value: 19,
          offline: 0,
          key: "OFFLINE1",
        },
      ],
    });
    const detectionData = ref([
      {
        name: "音频设备",
        value: 7,
        color: "#EC5F67",
      },
      {
        name: "视频设备",
        value: 2,
        color: "#FFAB10",
      },
      {
        name: "证据展示设备",
        value: 3,
        color: "#2989FF",
      },
      {
        name: "其他",
        value: 7,
        color: "#19F8F7",
      },
    ]);
    const listData = ref([
      {
        deviceName: "大法庭话筒",
        deviceType: "音频设备",
      },
      {
        deviceName: "大法庭1号摄像机",
        deviceType: "视频设备",
      },
      {
        deviceName: "大法庭2号摄像机",
        deviceType: "视频设备",
      },
      {
        deviceName: "庭审主机",
        deviceType: "庭审记录设备",
      },
      {
        deviceName: "书记员笔录设备",
        deviceType: "庭审记录设备",
      },
      {
        deviceName: "庭审主机",
        deviceType: "庭审记录设备",
      },
    ]);
    const column = [
      {
        title: "设备名称",
        dataIndex: "deviceName",
        width: 120,
      },
      {
        title: "设备类型",
        dataIndex: "deviceType",
      },
      {
        title: "操作",
        dataIndex: "operate",
        width: 70,
        slots: {
          customRender: "operate",
        },
      },
    ];
    onMounted(() => {});
    // 使用toRefs解构
    // let { } = { ...toRefs(state) }
    expose({
      ...toRefs(state),
    });

    return (): JSX.Element => (
      <>
        <DeviceStatistics imgPath="business-icon/triage-queue/6.png" statistic={deviceStatisticsData}></DeviceStatistics>
        <div class="elevator-analysis">
          <div class="chart">
            <elevator-analysis-pie pieData={detectionData.value}>
              <div style="color: #fff;text-align: center;font-size: 14px;"> 19</div>
              <div style="color: #fff;text-align: center;font-size: 10px;"> 设备类型</div>
            </elevator-analysis-pie>
          </div>
          <elevatorAnalysisList showRatio={true} contentList={detectionData.value} class="pie_list"></elevatorAnalysisList>
        </div>
        <div class="footer">
          <RollTable column={column} data={listData.value} showLength={3}>
            <template>
              <div class="operate-row">
                <span> 详情</span>
                <span> 定位</span>
              </div>
            </template>
          </RollTable>
        </div>
      </>
    );
  },
});

export default CourtTrailDevice;
