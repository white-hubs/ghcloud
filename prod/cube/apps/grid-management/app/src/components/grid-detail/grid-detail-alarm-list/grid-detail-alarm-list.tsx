import dayjs from "dayjs";
import { defineComponent, onMounted, reactive } from "vue";
import { useRoute } from "vue-router";

import { useCubeTable } from "@ghcloud/cube-app-design";
import { VerticalLine } from "@ghcloud/cube-app-design/src/base-components/vertical-line/vertical-line";
import { Button, PopOver, Space } from "@ghcloud/cube-ui";

import { cubeAlarmCenterService, cubeGridManagementService } from "@/api/server";

import styles from "./grid-detail-alarm-list.module.less";

const color = {
  一级: "rgb(255, 59, 52)",
  二级: "rgb(255, 110, 52)",
  三级: "rgb(255, 194, 52)",
  四级: "rgb(24, 144, 255)",
};
const handstatus = {
  已挂起: "#02A7F0",
  待接收: "#D9001B",
  处理中: "#F59A23",
  已关闭: "#7F7F7F",
  已处理: "#70B603",
};
export const GridDetailAlarmList = defineComponent({
  name: "GridDetailAlarmList",
  setup() {
    const state = reactive<{
      alarmStat: {
        alarmNum: number;
        doneAlarmNum: number;
      };
    }>({
      alarmStat: {
        alarmNum: 0,
        doneAlarmNum: 0,
      },
    });
    const route = useRoute();
    const getAlarmStat = async () => {
      const result = await cubeAlarmCenterService.getAlarmStatusStatistics({
        areaId: route.query.id as string,
        areaLike: false,
      });
      const calcList = result.filter((item) => item.alarmStatus !== "TIME_OUT_UN_HANDLER");
      const alarmNum = calcList.reduce((cur, pre) => cur + pre.alarmNum, 0);
      const doneAlarmNum = calcList.find((item) => item.alarmStatus === "ALARM_HANDLER")?.alarmNum || 0;
      state.alarmStat = {
        alarmNum: alarmNum,
        doneAlarmNum: doneAlarmNum,
      };
    };
    const getAlarmList = async () => {
      const result = await cubeAlarmCenterService.getAlarmRecordsPage({
        pageNumber: 1,
        pageSize: 1000,
        areaIds: route.query.id as string,
      });
      tableApi.setDataSource(result.records);
      tableApi.setState({
        pagination: {
          total: result.total,
        },
      });
    };
    const columns = [
      {
        sort: 0,
        dataIndex: "alarmTime",
        title: "报警时间",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        sort: 1,
        title: "报警对象",
        dataIndex: "alarmTargetName",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
        customRender: ({ text }: { text: string }) => <PopOver content={text}>{text ? text : "--"}</PopOver>,
      },
      {
        sort: 2,
        title: "报警级别",
        dataIndex: "alarmLevelName",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
        customRender: ({ text }: { text: string }) => (
          <PopOver content={text}>
            <span style={{ color: color[text as keyof typeof color] }}>{text || "--"}</span>
          </PopOver>
        ),
      },
      {
        sort: 3,
        title: "报警类型",
        dataIndex: "alarmTypeName",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
        customRender: ({ text }: { text: string }) => <PopOver content={text}>{text ? text : "--"}</PopOver>,
      },
      {
        sort: 4,
        title: "报警事件",
        dataIndex: "alarmEventName",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
        customRender: ({ text }: { text: string }) => <PopOver content={text}>{text ? text : "--"}</PopOver>,
      },
      {
        sort: 5,
        title: "处理状态",
        dataIndex: "alarmStatusName",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
        customRender: ({ text }: { text: string }) => (
          <PopOver content={text}>
            <span style={{ color: handstatus[text as keyof typeof handstatus] }}>{text || "--"}</span>
          </PopOver>
        ),
      },
      {
        sort: 6,
        title: "操作",
        dataIndex: "action",
        fixed: "right",
        align: "center",
        defaultVisible: true,
        customRender: ({ record }: { record: { id: string; businessKey: string; alarmStatus: string } }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                let target = "";
                target = `/portal/genericEquipmentMonitor/alarmDetail?businessKey=${record.businessKey}&alarmStatus=${record.alarmStatus}&type=detail&id=${record.id}`;
                history.pushState({ current: location.pathname + location.search }, "", target);
              }}
            >
              详情
            </Button>
          </>
        ),
      },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: "",
      rowKey: "id",
      dataSource: [],
    });
    onMounted(() => {
      getAlarmStat();
      getAlarmList();
    });

    return () => (
      <div class={styles["alarm-list"]}>
        <div class={styles["alarm-list-title"]}>
          <VerticalLine title={"报警事件"} />
          <Space>
            <div>报警数：{state.alarmStat.alarmNum}</div>
            <div>未处理数：{state.alarmStat.alarmNum - state.alarmStat.doneAlarmNum}</div>
            <div>已处理数：{state.alarmStat.doneAlarmNum}</div>
          </Space>
        </div>
        <CubeTable />
      </div>
    );
  },
});
