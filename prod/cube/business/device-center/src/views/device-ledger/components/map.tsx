import { defineComponent, ref, nextTick, watch } from "vue";

import { Button, Input } from "@ghcloud/cube-ui";
import { useMapModal } from "@ghcloud/generic-component";

import { cubeOuaaService } from "@/api/service";
import { formatLntAndLat, parseLntAndLat } from "@/utils/parse-lnt-lat";
interface Props {
  address: string;
  isDetail: boolean;
  value: string;
}
export const DMap = defineComponent({
  props: {
    address: {
      type: String,
      default: "",
    },
    isDetail: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: "",
    },
  },
  emits: ["update:value", "addressName"],
  setup(props: Props, { emit, expose }) {
    const lntAndLat = ref(props.value);
    const { showMapModal } = useMapModal();
    watch(
      () => props.value,
      (val) => {
        lntAndLat.value = val;
      },
    );

    const handleOk = (e: { addressValue: string; center: string[]; lntAndLat: string }): void => {
      emit("update:value", e.lntAndLat);
      emit("addressName", e.addressValue);
      lntAndLat.value = e.lntAndLat;
    };

    const openModal = async (longLat: string): Promise<void> => {
      const { code } = JSON.parse(sessionStorage.getItem("GH-NowEnterprise") ?? JSON.stringify({})) as { code?: string };
      const res = await cubeOuaaService.getTenantInfo(code ?? "");
      const { lntAndLat: tenantLntAndLat } = res;
      const option = parseLntAndLat(tenantLntAndLat ?? "") ?? [113.501904, 22.833012];
      await nextTick();
      // 优先定位到已存在的设备经纬度；无有效值时回落到租户默认中心
      const center = parseLntAndLat(longLat) ?? parseLntAndLat(lntAndLat.value) ?? parseLntAndLat(props.value) ?? option;

      showMapModal({
        title: "选择设备位置",
        address: props.address,
        center: {
          lng: center[0],
          lat: center[1],
        },
        modalConfirm: (confirmData) => {
          handleOk({
            addressValue: confirmData.address,
            center: [confirmData.lng.toString(), confirmData.lat.toString()],
            lntAndLat: formatLntAndLat(confirmData.lng, confirmData.lat),
          });
        },
      });
    };
    expose({
      openModal,
    });
    return (): JSX.Element => {
      if (props.isDetail) {
        return <span>{lntAndLat.value || "--"}</span>;
      }
      return (
        <>
          <div style="display: flex ">
            <Input v-model:value={lntAndLat.value} placeholder="获取经纬度" disabled showCount={false} maxlength={100} />
            <Button type="primary" onClick={() => openModal(lntAndLat.value)}>
              选择位置
            </Button>
          </div>
        </>
      );
    };
  },
});
