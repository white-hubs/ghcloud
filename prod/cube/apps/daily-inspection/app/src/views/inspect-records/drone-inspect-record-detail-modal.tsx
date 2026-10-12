import { defineComponent, type PropType, type VNode } from "vue";

import { Image, ImagePreviewGroup, Modal, PopOver } from "@ghcloud/cube-ui";

import {
  buildDroneDetailRecordFromPoint,
  formatDroneDateTime,
  getCoordinateText,
  getDroneAltitude,
  getDroneDeviceName,
  getDroneInspectMethod,
  getDroneMediaUrls,
  getDronePointSeq,
  getDroneRouteName,
  getInspectItemDetails,
  getInspectTimeValue,
  getResultDisplay,
  getResultValue,
  toDroneDisplayText,
  type DroneInspectRecordDetail,
} from "./drone-inspect-record-detail";

import styles from "./drone-inspect-record-detail.module.less";

const renderResult = (value: unknown): VNode => {
  const { label, color } = getResultDisplay(value);
  return (
    <PopOver content={label}>
      <span style={{ color }}>{label}</span>
    </PopOver>
  );
};

const renderDetailInfoItem = (label: string, value: unknown, className?: string): VNode => {
  const text = toDroneDisplayText(value);
  return (
    <div class={styles.detailInfoItem}>
      <span>{label}</span>
      <div class={className}>{text}</div>
    </div>
  );
};

export const DroneInspectRecordDetailModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    record: {
      type: Object as PropType<DroneInspectRecordDetail | null>,
      default: null,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const handleClose = (): void => {
      emit("close");
    };

    return (): VNode => {
      const record = props.record;
      const routeName = record ? getDroneRouteName(record) : "--";
      const pointSeq = record ? getDronePointSeq(record) : "--";
      const inspectMethod = record ? getDroneInspectMethod(record) : "--";
      const isRobotDog = /机器狗|ROBOT_DOG/i.test(inspectMethod);
      const routeLabel = isRobotDog ? "路线名称" : "航线名称";
      const pointLabel = isRobotDog ? "点位" : "航点";
      const resultDisplay = getResultDisplay(record ? getResultValue(record) : "");
      const itemDetails = record ? getInspectItemDetails(record) : [];
      const mediaUrls = record ? getDroneMediaUrls(record) : [];

      return (
        <Modal
          visible={props.visible}
          title={`巡检记录 - ${pointLabel} ${pointSeq}${routeName !== "--" ? ` · ${routeName}` : ""}`}
          width="960px"
          destroyOnClose
          okText="关闭"
          cancelButtonProps={{ style: { display: "none" } }}
          onOk={handleClose}
          onCancel={handleClose}
        >
          {record ? (
            <div class={styles.droneDetailModal}>
              <div class={styles.detailInfoGrid}>
                {renderDetailInfoItem(routeLabel, routeName)}
                {renderDetailInfoItem(`${pointLabel}序号`, pointSeq)}
                {renderDetailInfoItem("坐标（WGS84）", getCoordinateText(record), styles.coordinateCell)}
                {renderDetailInfoItem("相对高度", getDroneAltitude(record))}
                {renderDetailInfoItem("巡检方式", inspectMethod)}
                {renderDetailInfoItem("巡检设备", getDroneDeviceName(record))}
                {renderDetailInfoItem("巡检时间", formatDroneDateTime(getInspectTimeValue(record)))}
                <div class={styles.detailInfoItem}>
                  <span>巡检结果</span>
                  <div style={{ color: resultDisplay.color }}>{resultDisplay.label}</div>
                </div>
              </div>

              <div class={styles.detailSectionTitle}>巡检项明细</div>
              <div class={styles.detailTableWrap}>
                <table class={styles.detailTable}>
                  <thead>
                    <tr>
                      <th>巡检项名称</th>
                      <th>巡检标准</th>
                      <th>巡检结果</th>
                      <th>备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemDetails.length ? (
                      itemDetails.map((item, index) => (
                        <tr key={`${item.name}-${index}`}>
                          <td>{item.name}</td>
                          <td>{item.standard}</td>
                          <td>{renderResult(item.result)}</td>
                          <td>{item.remark}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colspan={4} class={styles.emptyDetailCell}>
                          该{pointLabel}暂无巡检项明细
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div class={styles.detailSectionTitle}>巡检抓拍</div>
              {mediaUrls.length ? (
                <div style={{ minHeight: "100px", display: "flex", alignItems: "center" }}>
                  <ImagePreviewGroup>
                    {mediaUrls.map((url, index) => (
                      <Image
                        key={`${url}-${String(index)}`}
                        src={url}
                        style={{ width: "100px", height: "100px" }}
                        width={100}
                        height={100}
                        preview={{ getContainer: () => document.body }}
                      />
                    ))}
                  </ImagePreviewGroup>
                </div>
              ) : (
                <div class={styles.emptyMedia}>暂无巡检抓拍</div>
              )}
            </div>
          ) : null}
        </Modal>
      );
    };
  },
});

export { buildDroneDetailRecordFromPoint };
