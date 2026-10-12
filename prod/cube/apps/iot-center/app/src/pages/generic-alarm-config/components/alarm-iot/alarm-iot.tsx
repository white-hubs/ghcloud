import { PlusOutlined } from "@ant-design/icons";
import { Button, Empty, Form } from "antd";
import { forwardRef, useImperativeHandle } from "react";
import { useImmer } from "use-immer";

import { useAsyncEffect } from "@ghcloud/cube-iot-center-app/hooks/use-async-effect";
import { logger } from "@ghcloud/cube-iot-center-app/log";
import { guid } from "@ghcloud/cube-iot-center-app/utils/common";
import { actionTypes } from "@ghcloud/cube-iot-center-app/utils/enum";
import type { DeviceInstancePageParamsAll } from "@ghcloud/cube-iot-center-service";

import { cubeDeviceCenterService } from "../../../../service";
import { getOptionLabel, ReadonlyDescriptions, ReadonlyEmpty } from "../common/read-only/read-only";
import type { AlarmIotModel, AlarmIotRef } from "./alarm-iot-modal";
import { AlarmIotRule } from "./alarm-iot-rule";

import "../components.less";

export const AlarmIot = forwardRef<AlarmIotRef, { info: AlarmIotModel; readonly?: boolean }>(({ info, readonly }, ref) => {
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    // 暴露给父组件的方法
    getValue,
    changeEnabled,
  }));
  const urlParams = new URLSearchParams(location.search);
  const isReadonly = readonly ?? urlParams.get("type") === "detail";

  const [alarmIot, setAlarmIot] = useImmer<AlarmIotModel>({
    enabled: true,
    actionType: "IOT_DEVICE_ACTION",
    actionConfig: [],
    id: "",
  });
  const getValue = async (): Promise<AlarmIotModel> => {
    form.validateFields();
    return alarmIot;
  };
  const [deviceQuery] = useImmer<DeviceInstancePageParamsAll>({
    categoryCode: "",
    lastAreaId: undefined,
    keyword: "",
    pageNumber: 1,
    pageSize: 10,
    productId: "",
    total: 0,
  });

  useAsyncEffect(async () => {
    if (info === undefined) {
      setAlarmIot({
        ...alarmIot,
        enabled: urlParams.get("type") === "add",
      });
      return;
    }
    setAlarmIot(info);
  }, [info]);

  useAsyncEffect(async () => {
    getList();
  }, [deviceQuery]);
  if (isReadonly) {
    if (!alarmIot.enabled) {
      return <ReadonlyEmpty description="未开启设备联动" />;
    }
    return (
      <div>
        {alarmIot.actionConfig.map((item, index) => (
          <div key={item.uuid ?? item.id} className="alarm-detail-card">
            <div className="alarm-detail-card-title">联动设备 {index + 1}</div>
            <ReadonlyDescriptions
              items={[
                { label: "产品品类", value: item.deviceProdCategoryCode },
                { label: "设备产品", value: item.deviceProdId },
                { label: "设备名称", value: item.name },
                { label: "设备指令", value: item.propName || item.propCode },
                { label: "设定值", value: item.propValue },
                { label: "执行方式", value: getOptionLabel(actionTypes, item.executeMode) },
              ]}
            />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div>
      <>
        {!isReadonly && alarmIot.enabled && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              addRule();
            }}
          >
            添加
          </Button>
        )}
        {alarmIot.enabled &&
          alarmIot.actionConfig.map((item, index) => {
            return (
              <div key={item.uuid ?? item.id} style={{ marginTop: "10px" }}>
                <div>
                  <AlarmIotRule
                    deleteCurrent={() => {
                      setAlarmIot((draft) => {
                        draft.actionConfig = draft.actionConfig.filter((e) => e.uuid !== item.uuid);
                      });
                    }}
                    deviceIndex={index}
                    groupItem={item}
                    setInfo={(e) => {
                      logger.info(e);
                      setAlarmIot((draft) => {
                        draft.actionConfig[index] = e;
                      });
                    }}
                  />
                </div>
              </div>
            );
          })}
        {!alarmIot.enabled && <Empty description="未开启设备联动" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      </>
    </div>
  );

  function addRule(): void {
    setAlarmIot((draft) => {
      draft.actionConfig.push({
        uuid: guid(),
        code: "",
        executeMode: "AUTOMATIC",
        deviceProdCategoryCode: "",
        id: "",
        deviceProdId: undefined,
        name: "",
        propCode: null,
        propName: "",
        propValue: "",
        genreId: "",
        modelId: null,
      });
    });
  }

  async function getList(): Promise<void> {
    const data = await cubeDeviceCenterService.getDeviceInstancePageAll(deviceQuery);
    const info = data.records.map((item: any) => {
      return {
        ...item.productInfo,
        ...item.productCategory,
        ...item.area,
        ...item,
      };
    });
    logger.info(info);
  }
  function changeEnabled(checked: boolean): void {
    setAlarmIot((draft) => {
      draft.enabled = checked;
    });
  }
});
