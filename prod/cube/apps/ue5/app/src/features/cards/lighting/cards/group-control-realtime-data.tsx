import { defineComponent } from "vue";
import { reactive, onMounted, onBeforeUnmount, watch } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getGroupControlData } from "@/infrastructure/utils/requestData/lighting";
import GroupControl from "@/shared-ui/panel/groupControl";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./group-control-realtime-data.module.less";

export const GroupControlRealtimeData = defineComponent({
  name: "GroupControlRealtimeData",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const groupControlList = reactive([
      {
        img: "crowd.png",
        value: 0,
        label: "群控组总数",
      },
      {
        img: "control.png",
        value: 0,
        label: "控制回路数",
      },
      {
        img: "open.png",
        value: 0,
        label: "开启回路数",
      },
      {
        img: "close.png",
        value: 0,
        label: "关闭回路数",
      },
    ]);
    let timer: any = reactive(null);

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

    // 群控组实时数据
    const getGroupControlInfo = async () => {
      let res = await getGroupControlData();
      groupControlList[0].value = res.groupTotal;
      groupControlList[1].value = res.deviceTotal;
      groupControlList[2].value = res.openTotal;
      groupControlList[3].value = res.closeTotal;
    };

    const init = () => {
      getGroupControlInfo();
    };

    onMounted(() => {
      init();
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
        <SubPanelTemplate title="群控组实时数据">
          <div class="groupControlBox">
            {groupControlList.map((item) => (
              <GroupControl key={item.img} groupControlData={item}></GroupControl>
            ))}
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default GroupControlRealtimeData;
