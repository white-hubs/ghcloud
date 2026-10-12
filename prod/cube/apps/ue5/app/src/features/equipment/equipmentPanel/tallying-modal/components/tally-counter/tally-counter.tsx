import { CloseOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent } from "vue";

import type { NorthDeviceDetail } from "@ghcloud/cube-iot-center-service";
import type { ArrangeLastInfoVo } from "@ghcloud/cube-slide-rail-service";

import { CardState } from "../card-state/card-state";
import { Card } from "../card/card";
import { Monitor } from "../monitor/monitor";
import { TallyBaseInfo } from "../tally-base-info/tally-base-info";
import { TallyData } from "../tally-data/tally-data";
import { TallyNumInfo } from "../tally-num-info/tally-num-info";

import style from "./tally-counter.module.less";

interface Props {
  data: {
    device?: NorthDeviceDetail;
    slide?: ArrangeLastInfoVo;
  };
}
/** 理货台 */
export const TallyCounter = defineComponent({
  props: ["data"],
  emits: ["close"],
  setup: (props: Props, { emit }) => {
    // 设备名称
    const cardTitle = computed(() => {
      return props.data?.device?.deviceName || "";
    });
    // 设备ID
    const deviceId = computed(() => {
      return props.data?.device?.deviceId || "";
    });
    // 理货状态
    const status = computed(() => {
      return props.data?.slide?.porkArrangeStatus;
    });
    // 商铺信息
    const tallyBaseInfo = computed(() => {
      return props.data?.slide?.supplierInfo;
    });
    // 理货信息
    const slideInfo = computed(() => {
      return props.data?.slide;
    });
    const close = () => {
      emit("close");
    };
    const cardSlots = {
      "card-state": () => {
        return (
          <div class={style.closeBtn}>
            <CardState state={status.value} />
            <CloseOutlined onClick={close} class={style.closeIcon} style={{ fontSize: "16px" }} />
          </div>
        );
      },
      "card-body": () => {
        return (
          <>
            <div class={`${style.mt10}`}>
              <TallyBaseInfo info={tallyBaseInfo.value} />
              <TallyNumInfo info={slideInfo.value} />
              <Monitor id={deviceId.value as string} info={slideInfo.value} />
              <TallyData info={slideInfo.value} />
            </div>
          </>
        );
      },
    };
    return () => <Card title={cardTitle.value || "理货台"} v-slots={cardSlots} />;
  },
});
