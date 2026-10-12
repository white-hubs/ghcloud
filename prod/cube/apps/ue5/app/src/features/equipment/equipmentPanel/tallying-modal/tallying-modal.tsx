import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import { TallyCounter } from "./components/tally-counter/tally-counter";
import { cubeMeattradeService, cubeDeviceCenterService } from "@/infrastructure/api/service";

import styles from "./tallying-modal.module.less";

export const TallyingModal = defineComponent({
  name: "TallyingModal",
  props: {
    id: { type: String, required: true },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const metaInfo = ref();
    const getTallyData = async (): Promise<void> => {
      try {
        const [deviceRes, slideRes] = await Promise.all([
          cubeDeviceCenterService.getNorthDeviceDetail({ deviceId: props.id }),
          cubeMeattradeService.getArrangeLastInfo({ deviceId: props.id }),
        ]);
        metaInfo.value = { device: deviceRes, slide: slideRes };
      } catch (error) {}
    };
    const closeDevicePanel = () => {
      emit("close");
    };
    onMounted(() => {
      getTallyData();
    });

    return (): JSX.Element => (
      <div class="sub-panel">
        {" "}
        <div class="sub-panel-content">
          {" "}
          <TallyCounter data={metaInfo} onClose={closeDevicePanel}></TallyCounter>
        </div>
      </div>
    );
  },
});

export default TallyingModal;
