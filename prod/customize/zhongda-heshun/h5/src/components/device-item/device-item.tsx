import styles from "./device-item.module.less";
import { getAssetsFile } from "@/utils";
import type { DeviceVO } from "@ghcloud/cube-zhongda-heshun-service";
import { computed, defineComponent, type PropType } from "vue";
import { useRouter } from "vue-router";

export const DeviceItem = defineComponent({
  props: {
    record: {
      type: Object as PropType<DeviceVO>,
      required: true,
    },
    recordIndex: {
      type: Number,
      required: true,
    },
  },
  emits: ["handleInfo"],
  setup: (props, { emit }) => {
    const router = useRouter();

    const handleDetails = (): void => {
      router.push({
        path: `/device-detail/${props.record.id}`,
      });
    };
    const mlValue = computed(() => props.record?.propList?.find((item) => item.propCode === "mosquito_dosage_ml"));
    return (): JSX.Element => (
      <div class={styles["device-item"]} onClick={handleDetails}>
        <div class={styles["device-header"]}>
          <div class={styles["device-top"]}>
            <div class={styles["device-img"]}>
              <img src={getAssetsFile("device-default.png")} alt="设备图标" />
            </div>

            <div class={[styles.status, styles[props.record.status.onlineState ? "online" : "offline"]]}>
              {props.record.status.onlineState ? (
                <img src={getAssetsFile("connect-icon.png")} alt="在线状态" />
              ) : (
                <img src={getAssetsFile("disconnect-icon.png")} alt="在线状态" />
              )}

              {props.record.status.onlineState ? "在线" : "离线"}
            </div>
          </div>
          <div class={styles["device-name"]}>{decodeURIComponent(props.record.name)}</div>
          <div class={styles["category-name"]}>{props.record?.productInfo?.name || ""}</div>
        </div>

        <div class={styles["device-item-content"]}>
          {/* {props.record?.propList && props.record?.propList?.length > 0 ? (
            props.record?.propList?.slice(0, 2)?.map((item, index) => {
              const config = item.dataConstraint ? JSON.parse(item.dataConstraint ?? "[]") : [];
              const value = ["enum", "boolean"].includes(item.dataType ?? "")
                ? config.find((c: { label: string; value: unknown }) => c.value === item.value)?.label
                : item.value;
              return (
                <div class={styles["info-row"]} key={index}>
                  <div class={styles["info-label"]}>{item.propName}</div>
                  <div class={styles["info-value"]}>
                    {value !== "null" && value !== "" ? value : "-"}
                    {item.unitName}
                  </div>
                </div>
              );
            })
          ) : (
            <>
              <div class={styles["info-row"]}>
                <div class={styles["info-label"]}></div>
                <div class={styles["info-value"]}>暂无属性</div>
              </div>
            </>
          )} */}
          <div class={styles["device-item-content-ml"]}>
            <span>剩余药水量</span>
            <span class={styles["device-item-content-ml-value"]}>
              {mlValue.value && mlValue.value.value !== "null" ? mlValue.value.value : 0}
              {mlValue.value?.unitName}
            </span>
          </div>
        </div>
      </div>
    );
  },
});
