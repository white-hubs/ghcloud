import { computed, defineComponent, ref, watch } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import { DeviceIcon } from "@/infrastructure/utils/enumeratie";
import { getDeviceIcon } from "@/infrastructure/utils/getImage";
import { storeMarket } from "@/visualization-core/stores/other";

import styles from "./device-icon-legend.module.less";
/**
 * 设备图标图例组件
 */
export const DeviceIconLegend = defineComponent({
  name: "DeviceIconLegend",
  setup() {
    const piniaStoreMarket = storeMarket();
    const legendList = computed(() => {
      const res: {
        icon: string;
        iconUrl: string;
        typeNames: string[];
      }[] = [];
      for (let i = 0; i < piniaStoreMarket.deviceIconPioList.length; i++) {
        const find = res.find((item) => item.typeNames.includes(piniaStoreMarket.deviceIconPioList[i].props.deviceData.prodCategory?.name));
        if (find) continue;
        const typeName = piniaStoreMarket.deviceIconPioList[i].props.deviceData.prodCategory?.name;
        const icon = DeviceIcon[typeName as keyof typeof DeviceIcon];
        const findIndex = res.findIndex((item) => item.icon === icon);
        if (findIndex !== -1) {
          res[findIndex].typeNames.push(typeName);
        } else {
          res.push({
            icon,
            iconUrl: getDeviceIcon(icon),
            typeNames: [typeName],
          });
        }
      }
      return res;
    });
    const checkedList = ref(legendList.value.map((item) => item.typeNames.join(",")));
    watch(
      () => checkedList.value.length,
      () => {
        const ueClient = UeClient.getInstance();
        ueClient.send("removePoiByType", { type: "icon" });
        const typeNames = checkedList.value.join(",").split(",");
        ueClient.send("addIconPoiBatch", {
          pois: piniaStoreMarket.deviceIconPioList.filter((item) => typeNames.includes(item.props.deviceData.prodCategory?.name)),
        });
      },
    );

    return (): JSX.Element => {
      return (
        <div class={styles["bar"]} v-show={legendList.value.length > 1}>
          <a-checkbox-group
            v-model:value={checkedList.value}
            options={legendList.value.map((item) => {
              return {
                label: item.typeNames.join(","),
                value: item.typeNames.join(","),
              };
            })}
          />
        </div>
      );
    };
  },
});
