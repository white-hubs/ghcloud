import ActionItem from "./action-item";
import { useChartEditStore } from "@/store/modules/chart-edit-store/chart-edit-store";
import type { InteractiveForm } from "@/store/modules/chart-edit-store/chart-edit-store.d";
import { createUuid } from "@/utils";
import { Button, Icon, Add } from "@ghcloud/visual-view-ui";
import { defineComponent, type VNode, computed } from "vue";
export default defineComponent({
  name: "nav-item",
  setup: () => {
    const chartEditStore = useChartEditStore();
    const addAction = (): void => {
      const interactive = {
        type: "click",
        objectType: "UE5",
        action: "switchModel",
        target: "",
        id: createUuid(),
        labelType: "",
        actorName: "",
        weather: [],
        menuId: createUuid(),
      };
      chartEditStore.addInteractive(interactive as InteractiveForm);
    };
    const interactiveLength = computed(() => chartEditStore.getCurrentBlock?.interactive?.length ?? 0);
    const actionDom = (): VNode => (
      <div>
        <Button block onClick={addAction} disabled={interactiveLength.value > 9}>
          <Icon>
            <Add />
          </Icon>
          新建交互
        </Button>
        {interactiveLength.value > 0 && chartEditStore.getCurrentBlock?.interactive
          ? chartEditStore.getCurrentBlock.interactive.map((interactive, index) => (
              <ActionItem interactive={interactive} index={index + 1} key={index} />
            ))
          : null}
      </div>
    );
    return () => (
      <>
        {actionDom()}
        {/* {chartEditStore.getCurrentBlock?.components ? <div style={{ textAlign: 'center', margin: '20px 0px' }}>暂无配置</div> : actionDom()} */}
      </>
    );
  },
});
