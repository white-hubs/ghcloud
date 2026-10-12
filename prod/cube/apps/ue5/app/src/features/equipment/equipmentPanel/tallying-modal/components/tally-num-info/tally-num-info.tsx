import { computed, defineComponent } from "vue";

import type { ArrangeLastInfoVo } from "@ghcloud/cube-slide-rail-service";

import { NumDigitalDisplay } from "../num-digital/num-digital";

import styles from "./tally-num-info.module.less";
interface Props {
  info?: ArrangeLastInfoVo;
}
/** 理货数量信息 */
export const TallyNumInfo = defineComponent({
  props: ["info"],
  setup: (props: Props) => {
    // 理货片数
    const slices = computed(() => {
      return props.info?.porkArrange?.slices || 0;
    });
    // 理货重量
    const weight = computed(() => {
      return props.info?.porkArrangeDetail?.weight || 0;
    });
    // 挂钩编号
    const footMarkCode = computed(() => {
      return props.info?.porkArrangeDetail?.label || 0;
    });
    return () => (
      <div class={styles.container}>
        <NumDigitalDisplay value={slices.value} title="当前理货片数" prefix="第" unit="片" digits={4} />

        <NumDigitalDisplay value={weight.value} title="当前理货重量" unit="kg" digits={5} decimal={2} />

        <NumDigitalDisplay value={footMarkCode.value} title="当前挂钩编号" digits={5} activeColor="rgba(80,146,229,1)" />
      </div>
    );
  },
});
