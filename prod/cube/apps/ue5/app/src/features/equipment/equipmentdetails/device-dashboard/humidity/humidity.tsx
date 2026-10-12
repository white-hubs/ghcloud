import { defineComponent } from "vue";

import ChartData from "./components/chart-data";

import "./humidity.module.less";

export const Humidity = defineComponent({
  name: "Humidity",
  props: {
    data: { type: Object, default: () => ({}) },
    productPropVoList: { type: Array, default: () => [] },
    deviceInfo: { type: Object, default: () => ({}) },
  },
  setup(props) {
    return (): JSX.Element => <ChartData productPropVoList={props.productPropVoList} data={props.data} />;
  },
});

export default Humidity;
