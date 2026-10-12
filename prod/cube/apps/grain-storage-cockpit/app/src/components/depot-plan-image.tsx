import { defineComponent } from "vue";

import depotPlanImage from "@/assets/images/depot-plan.png";

export const DepotPlanImage = defineComponent({
  name: "DepotPlanImage",
  emits: {
    open: (): boolean => true,
  },
  setup: (_props, { emit }) => {
    const openWarehouse = (): void => emit("open");
    const handleKeydown = (event: KeyboardEvent): void => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      openWarehouse();
    };

    return (): JSX.Element => (
      <div class="depot-plan" role="button" tabindex={0} aria-label="查看粮仓详情" onClick={openWarehouse} onKeydown={handleKeydown}>
        <img src={depotPlanImage} alt="霞凝直属库仓房平面分布图" />
      </div>
    );
  },
});
