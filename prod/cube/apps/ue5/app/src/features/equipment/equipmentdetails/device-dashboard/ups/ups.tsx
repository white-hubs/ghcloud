import { defineComponent } from "vue";

import BatteryTabData from "./components/battery-tab-data";
import InputTabData from "./components/input-tab-data";
import ListData from "./components/list-data";
import OutData from "./components/out-data";

export const Ups = defineComponent({
  name: "Ups",
  props: {
    data: { type: Object, default: () => ({}) },
    productPropVoList: { type: Array, default: () => [] },
    deviceInfo: { type: Object, default: () => ({}) },
  },
  setup(props) {
    return (): JSX.Element => (
      <>
        <ListData baseInfo={props.deviceInfo} productPropVoList={props.productPropVoList} data={props.data} />
        <BatteryTabData productPropVoList={props.productPropVoList} data={props.data} />
        <InputTabData productPropVoList={props.productPropVoList} data={props.data} />
        <OutData productPropVoList={props.productPropVoList} data={props.data} />
      </>
    );
  },
});

export default Ups;
