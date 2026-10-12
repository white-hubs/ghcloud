import moment from "moment";
import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import bus from "@/infrastructure/utils/bus";
import { aralmDataList } from "@/infrastructure/utils/requestData/alarm";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import NoData from "@/shared-ui/panel/noData";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./_shared/air-conditioning-v2-shared.module.less";

import styles from "./air-conditioning-right.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card air-conditioning-v2-panel air-conditioning-card-theme access-control-card-theme";

export const AirConditioningRight = defineComponent({
  name: "AirConditioningRight",
  setup(_props, ctx) {
    const { getEquipmentNumber, getEventTop } = useCommon();
    const { globalState } = useStateStore();

    let timer: any = ref(null);
    const eventInfo = ref<ModelValueItf>();
    const colorList = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
    const roundPieData = reactive([]);
    const eventNum = ref<number>(0);
    const alarmTop = reactive({ arr: [] });
    const columns = ref([
      {
        title: "时间",
        dataIndex: "alarmTime",
        width: 120,
        slots: {
          title: "alarmTime",
        },
        customRender: (text) => {
          return text ? (typeof text === "number" ? moment(text).format("YYYY-MM-DD HH:mm:ss") : text) : "--";
        },
      },
      {
        title: "报警设备",
        dataIndex: "alarmTargetName",
      },
      {
        title: "报警事件",
        dataIndex: "alarmEventName",
      },
    ]);
    let data = reactive({
      arr: [],
    });
    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer);
        timer = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
        init();
      },
    );
    // 空调类型分布
    const deviceDataInfo = async () => {
      let res: any = await getEquipmentNumber();
      if (!res.deviceNum) {
        return;
      }
      roundPieData.length = 0;
      res.deviceGenreNums.forEach((item, index) => {
        let obj = {
          label: `${item.genreName}(${Math.round((item.num / res.deviceNum) * 10000) / 100.0}%)`,
          color: colorList[index],
          value: item.num,
        };
        roundPieData.push(obj);
      });
      eventNum.value = res.deviceNum;
    };
    // 报警事件Top5
    const alarmEventTop = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: eventInfo.value.dateRange.join(","),
        type: eventInfo.value.timeType,
      };
      let res = await getEventTop(param);
      alarmTop.arr = res;
    };
    // 实时报警数据
    const alarmRealData = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: `${moment().format("YYYY-MM-DD 00:00:00")},${moment().format("YYYY-MM-DD 23:59:00")}`,
        pageSize: 50,
        pageNumber: 1,
      };
      let res = await aralmDataList(param);
      data.arr = res.records.filter((item) => {
        if (moment(item.alarmTime).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")) {
          return item;
        }
      });
    };
    const handelClickRow = (record) => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };
    const init = () => {
      deviceDataInfo();
      alarmEventTop();
      alarmRealData();
    };
    onMounted(() => {
      deviceDataInfo();
      alarmRealData();
      timer.value = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    const renderDistributionBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          styles.cardBody,
          styles.pieBody,
          isZoom ? styles.zoomBody : "",
          "air-conditioning-card-body",
          isZoom ? ["air-conditioning-v2-panel", "air-conditioning-card-theme", "access-control-card-theme", "is-zoom"] : "",
        ]}
        data-no-zoom
      >
        <div class={[styles.pieSurface, "air-conditioning-surface"]}>
          <RoundPie data={roundPieData} eventNum={eventNum.value}>
            <div class={styles.pieContent}>
              <span>{eventNum.value}</span>
              <br />
              设备总数
            </div>
          </RoundPie>
          <PieList roundPieData={roundPieData} class={isZoom ? "pie-list-zoom" : undefined} />
        </div>
      </div>
    );

    const renderAlarmTopBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          styles.cardBody,
          styles.listBody,
          "air-conditioning-card-body",
          "air-conditioning-list-surface",
          "air-conditioning-surface",
          isZoom ? ["air-conditioning-v2-panel", "air-conditioning-card-theme", "access-control-card-theme", "is-zoom"] : "",
        ]}
        data-no-zoom
      >
        {alarmTop.arr.length > 0 ? (
          alarmTop.arr.map((item, index) => (
            <EventAlarmItem
              key={item.id ?? `${item.name}-${index}`}
              sort={index + 1}
              name={item.name}
              count={item.alarmNum}
              ratio={`${item.ratio}%`}
            />
          ))
        ) : (
          <NoData />
        )}
      </div>
    );

    const renderRealtimeAlarmBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          styles.cardBody,
          styles.tableBody,
          "air-conditioning-card-body",
          "air-conditioning-table-surface",
          "air-conditioning-surface",
          "access-control-table-surface",
          isZoom ? ["air-conditioning-v2-panel", "air-conditioning-card-theme", "access-control-card-theme", "is-zoom"] : "",
        ]}
        data-no-zoom
      >
        <RollTable column={columns.value} data={data.arr} onClickRow={handelClickRow} limitScrollNum={7} />
      </div>
    );

    return (): JSX.Element => (
      <div class={[styles.panelColumn, "air-conditioning-v2-root"]}>
        <SubPanelTemplate
          title="空调类型分布"
          class={PANEL_CLASS}
          zoomable
          zoom-title="空调类型分布详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="air-conditioning-distribution" />,
            "zoom-content": () => renderDistributionBody(true),
            default: () => renderDistributionBody(false),
          }}
        />
        <SubPanelTemplate
          title="报警事件top5"
          class={PANEL_CLASS}
          zoomable
          zoom-title="报警事件top5详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="air-conditioning-alarm" />,
            extra: () => (
              <div class="air-conditioning-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={eventInfo.value}
                  onUpdate:modelValue={(v) => {
                    eventInfo.value = v;
                  }}
                  onSearch={alarmEventTop}
                />
              </div>
            ),
            "zoom-content": () => renderAlarmTopBody(true),
            default: () => renderAlarmTopBody(false),
          }}
        />
        <SubPanelTemplate
          title="实时报警数据"
          class={PANEL_CLASS}
          zoomable
          zoom-title="实时报警数据详情"
          zoom-width={1000}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="air-conditioning-records" />,
            "zoom-content": () => renderRealtimeAlarmBody(true),
            default: () => renderRealtimeAlarmBody(false),
          }}
        />
      </div>
    );
  },
});

export default AirConditioningRight;
