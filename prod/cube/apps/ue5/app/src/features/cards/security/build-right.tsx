import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-table";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplates from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getstatus } from "@/infrastructure/api/alarm";
import { VideoType } from "@/infrastructure/api/models/vmonitor";
import bus from "@/infrastructure/utils/bus";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import H5Video from "@/shared-ui/panel/H5Video";
import noData from "@/shared-ui/panel/noData";
import Pie from "@/shared-ui/panel/pie";
import TipsCount from "@/shared-ui/panel/tipsCount";
import useCommon from "@/visualization-core/hooks/useCommon";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./build-right.module.less";

export const BuildRight = defineComponent({
  name: "BuildRight",
  setup(_props, ctx) {
    let cameraList = ref<VideoType[]>([]);
    const cameraListTotal = ref([]);
    const clickCamera = (item) => {
      bus.emit("switchCamera", item);
    };
    let pieData = reactive([]);
    let listData = reactive([]);
    let alarmsNumber = ref<number>(0);
    const num = ref(0);
    let timer: any = reactive(null);
    let falg = ref<number>(0);
    const alarmModalShow = ref<boolean>(false);
    const alarmParameter = reactive<Record<string, any>>({
      dateRange: [],
    });
    const column = reactive([
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        width: 120,
      },
      {
        title: "报警级别",
        dataIndex: "alarmLevelName",
      },
      {
        title: "报警事件",
        dataIndex: "alarmEventName",
      },
      {
        title: "状态",
        dataIndex: "alarmStatus",
        slots: {
          customRender: "alarmStatus",
        },
      },
    ]);
    const { takeNotes, getAlarmTakeNotes, videoList } = useCommon();
    const { globalState } = useStateStore();

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
    // 报警记录
    async function changeTakeNotes() {
      alarmParameter.dateRange = takeNotes.value.dateRange;
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: takeNotes.value.dateRange.join(","),
        type: takeNotes.value.timeType,
        alarmStatusEnum: "",
        pageSize: 100,
        pageNumber: 1,
      };
      let data = await getAlarmTakeNotes(param);
      let res = await getstatus(param);
      listData = data.listData;
      alarmsNumber.value = data.alarmsNumber;
      pieData = data.pieData;
      pieData = [
        {
          value: res.alarmStatusStatistics[0].alarmNum,
          itemStyle: {
            color: "#F14545",
          },
          name: "未处理数",
        },
        {
          value: res.alarmStatusStatistics[3].alarmNum,
          itemStyle: {
            color: "#00f27b",
          },
          name: "超时报警数",
        },
      ];
      falg.value++;
    }
    async function getVideo() {
      cameraListTotal.value = await videoList();
      if (cameraListTotal.value.length !== 0) {
        cameraList.value = cameraListTotal.value[num.value];
      }
    }
    // 切换视频
    const changeVideo = () => {
      if (num.value === cameraListTotal.value.length - 1) {
        num.value = 0;
      } else {
        num.value++;
      }
      if (cameraListTotal.value.length !== 0) {
        cameraList.value = cameraListTotal.value[num.value];
      }
    };
    const handelClickRow = (record) => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };
    const handelClickAlarmNum = () => {
      alarmModalShow.value = true;
    };
    const closeModal = () => {
      alarmModalShow.value = false;
    };
    function init() {
      changeTakeNotes();
      getVideo();
    }
    onMounted(() => {
      getVideo();
      timer = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplates title="视频监控" class="monitor">
            <template>
              <div class="right-bar" onClick={changeVideo} class={[cameraListTotal.length - 1 === 0 ? "forbidden" : ""]}>
                <div> 切换</div>
                <img src={getAssetsImage("changingOver.png")} alt />
              </div>
            </template>
            <div class="body">
              <div class="title"> 监控组</div>
              <div class="group">
                {cameraList.map((item, index) => (
                  <div class="camera" key={index} onClick={clickCamera(item)}>
                    {" "}
                    <H5Video cameraItem={item} idStr={item.token + index}></H5Video>
                  </div>
                ))}
              </div>
              <div class="group">
                {" "}
                <noData></noData>
              </div>
            </div>
          </SubPanelTemplates>
          <SubPanelTemplate title="报警记录" class="alarm-record">
            <template>
              {" "}
              <a onClick={handelClickAlarmNum}> 查看更多</a>
            </template>
            <div class="header">
              {" "}
              <DateInlineForm
                modelValue={takeNotes}
                onUpdate:modelValue={(v) => {
                  takeNotes.value = v;
                }}
                onSearch={changeTakeNotes}
              ></DateInlineForm>
            </div>
            <div class="chart">
              <Pie data={alarmsNumber.value} x-data={pieData} />
              {pieData.map((item, index) => (
                <TipsCount status={String(index)} count={item.value || 0} />
              ))}
            </div>
            <div class="footer">
              <RollTable showLength={10} key={falg.value} column={column} data={listData} onClickRow={handelClickRow}>
                <template>
                  {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                  {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                  <span style="color: #00f27b"> 已处理</span>
                </template>
              </RollTable>
            </div>
          </SubPanelTemplate>
        </div>
        <modal-alarm-table show-modal={alarmModalShow.value} onClose={closeModal} parameter={alarmParameter}></modal-alarm-table>
      </>
    );
  },
});

export default BuildRight;
