import { defineComponent, onMounted, reactive, ref } from "vue";

import SmallInspectTable from "@/features/cards/safety-management/components/small-inspect-table";
import DeviceStatistics from "@/features/cards/security-overview/components/device-statistics";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { insTaskCountStat, insTaskStat } from "@/infrastructure/api/maintain";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./inspection-statistics.module.less";

export const InspectionStatistics = defineComponent({
  name: "InspectionStatistics",
  props: {
    title: {
      type: String,
      default: "安全巡检统计",
    },
  },
  setup(props) {
    // 时间选择
    const eventTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });

    // 切换列表
    const switchList = ["任务数", "完成数"];
    const currentItem = ref("任务数");
    const switchClick = (index) => {
      currentItem.value = index;
      getInsStat();
    };

    // 巡检统计数据
    const inspectionStat = reactive({
      countStat: {
        title: "巡检任务总数",
        total: 0,
        itemize: [
          {
            name: "进行中任务数：",
            label: "待接收任务数：",
            value: 0,
            offline: 0,
            key: "OFFLINE1",
          },
        ],
      },
      list: [],
    });

    // 弹窗相关
    const inspectModalShow = ref(false);
    const inspectParameter = reactive({
      depId: "",
      status: "",
      period: "",
    });

    // 获取巡检任务总数
    const getInsCount = async () => {
      const params = {
        begin: eventTime.value.dateRange[0],
        end: eventTime.value.dateRange[1],
        period: eventTime.value.dateRange.join(","),
      };
      const res = await insTaskCountStat(params);
      inspectionStat.countStat.total = res.inspectionTaskNum;
      inspectionStat.countStat.itemize[0].value = res.waitAcceptNum;
      inspectionStat.countStat.itemize[0].offline = res.underwayTaskNum;
    };

    // 获取巡检统计数据
    const getInsStat = async () => {
      const params = {
        period: eventTime.value.dateRange.join(","),
        status: currentItem.value === "任务数" ? "" : "OVER",
      };
      const res = await insTaskStat(params);
      const allCount = res.reduce((pre, item) => {
        return pre + item.taskNum;
      }, 0);
      inspectionStat.list = res.map((item) => {
        return {
          name: item.depName,
          id: item.depId,
          number: item.taskNum,
          ratio: +(item.taskNum / allCount).toFixed(2) * 100,
          chainRatio: item.chainRatio,
        };
      });
    };

    // 打开巡检弹窗
    const openInspect = (item) => {
      if (currentItem.value === "任务数") {
        inspectParameter.depId = item.id;
        inspectParameter.status = "";
      } else {
        inspectParameter.depId = item.id;
        inspectParameter.status = "OVER";
      }
      inspectParameter.period = eventTime.value.dateRange.join(",");
      inspectModalShow.value = true;
    };

    // 加载数据
    const alarmEventTop = async () => {
      getInsCount();
      getInsStat();
    };

    onMounted(() => {
      alarmEventTop();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate
          title={props.title}
          class={styles["alarm-event"]}
          v-slots={{
            extra: () => (
              <DateInlineForm
                v-model:modelValue={eventTime.value}
                onUpdate:modelValue={(val) => (eventTime.value = val)}
                onSearch={alarmEventTop}
              />
            ),
          }}
        >
          <div v-show={inspectionStat.list.length > 0}>
            <DeviceStatistics imgPath="87-icon.png" statistic={inspectionStat.countStat}></DeviceStatistics>
            <div class={styles.switch}>
              {switchList.map((item) => (
                <div onClick={() => switchClick(item)} class={item === currentItem.value ? styles.active : ""}>
                  {item}
                </div>
              ))}
            </div>
            <div class={styles.body}>
              {inspectionStat.list.map((item, index) => (
                <div onClick={() => openInspect(item)}>
                  <EventAlarmItem
                    key={item.id}
                    sort={index + 1}
                    name={item.name}
                    linkRatio={item.chainRatio}
                    count={item.number}
                    ratio={item.ratio + "%"}
                  />
                </div>
              ))}
            </div>
          </div>
          {inspectionStat.list.length === 0 && (
            <div class={styles.body} v-show={inspectionStat.list.length <= 0}>
              <NoData />
            </div>
          )}
        </SubPanelTemplate>
        <SmallInspectTable
          showModal={inspectModalShow.value}
          onClose={() => (inspectModalShow.value = false)}
          parameter={inspectParameter}
        />
      </>
    );
  },
});
