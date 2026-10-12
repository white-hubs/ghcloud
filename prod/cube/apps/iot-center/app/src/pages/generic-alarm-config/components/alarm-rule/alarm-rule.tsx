import { cubeDeviceCenterService } from "../../../../service";
import "../components.less";
import { AlarmRuleDevice } from "./alarm-rule-device";
import type { AlarmRuleRef, AlarmRulesDeviceType, RuleGroupType, RuleTimeType, EmergencyRuleConditionExpsType, RuleDataType } from "./alarm-rule-model";
import { CloseOutlined } from "@ant-design/icons";
import { useAsyncEffect } from "@ghcloud/cube-iot-center-app/hooks/use-async-effect";
import { logger } from "@ghcloud/cube-iot-center-app/log";
import { guid } from "@ghcloud/cube-iot-center-app/utils/common";
import { comparator, conditionType, deviceEventAlarmType, eventConfigType, period, weekList } from "@ghcloud/cube-iot-center-app/utils/enum";
import { DeviceService } from "@ghcloud/cube-service/src/device/device.service";
import { forwardRef, useImperativeHandle, type ReactNode } from "react";
import { getOptionLabel, ReadonlyDescriptions, ReadonlyTags } from "../common/read-only/read-only";
import { useImmer } from "use-immer";

interface DetailLabelMap {
  categoryByCode: Record<string, string>;
  productById: Record<string, string>;
  eventByCode: Record<string, string>;
  propByCode: Record<string, string>;
}

export const AlarmRule = forwardRef<AlarmRuleRef, { info: RuleGroupType[]; readonly?: boolean }>(({ info, readonly }, ref) => {
  useImperativeHandle(ref, () => ({
    getValue,
    addRuleGroup,
  }));

  const [ruleData, setRuleData] = useImmer<RuleGroupType[]>([
    {
      id: guid(),
      emergencyRuleConditions: [
        {
          id: guid(),
          deviceProdCategoryCodeConcat: "",
          deviceProdId: undefined,
          conditionType: null,
          deviceEventCode: undefined,
          deviceEventName: "",
          deviceEventType: "",
          deviceProdCategoryName: "",
          deviceProdName: "",
          emergencyRuleConditionExps: [
            {
              id: guid(),
              propCode: "",
              op: null,
              oprand: "",
              delayTime: 0,
              propName: "",
              propUnit: "",
              emergencyRuleConditionId: "",
              emergencyRuleId: "",
              startDelayTime: 0,
              endDelayTime: 0,
            },
          ],
        },
      ],
      emergencyRuleTime: {
        timeType: "ALL",
        timeConditions: "",
        timeList: [
          {
            beginTime: "",
            endTime: "",
          },
        ],
      },
    },
  ]);
  const getValue = async (): Promise<RuleGroupType[]> => {
    return ruleData;
  };
  const [deviceInfo, setDeviceInfo] = useImmer<AlarmRulesDeviceType>({
    deviceType: [],
    deviceModel: [],
    devicePropCode: [],
    deviceEventCode: [],
    propCode: [],
    conditionType: "CUSTOM_RULE_CONDITION",
  });
  const [detailLabelMap, setDetailLabelMap] = useImmer<DetailLabelMap>({
    categoryByCode: {},
    productById: {},
    eventByCode: {},
    propByCode: {},
  });

  useAsyncEffect(async () => {
    if (info === undefined || info.length === 0) {
      return;
    }
    info.forEach((item) => {
      item.emergencyRuleConditions.forEach((e) => {
        e.id = guid();
        e.emergencyRuleConditionExps.forEach((a) => {
          a.id = guid();
        });
      });
      item.emergencyRuleTime.timeList =
        item.emergencyRuleTime.timeConditions === "" ? "" : JSON.parse(item.emergencyRuleTime.timeConditions);
    });
    setRuleData(info);
  }, [info]);
  useAsyncEffect(async () => {
    logger.info(deviceInfo);
    const data = await cubeDeviceCenterService.getIotProductCategoryTree();
    setDeviceInfo((draft) => {
      draft.deviceType = data;
    });
    setDetailLabelMap((draft) => {
      draft.categoryByCode = getCategoryNameMap(data as unknown as CategoryNode[]);
    });
  }, []);

  useAsyncEffect(async () => {
    if (!readonly || !ruleData.length) {
      return;
    }
    const categoryCodes = Array.from(
      new Set(
        ruleData
          .flatMap((groupItem) => groupItem.emergencyRuleConditions)
          .map((item) => getLastCategoryCode(item.deviceProdCategoryCodeConcat))
          .filter((item): item is string => !!item),
      ),
    );
    const productIds = Array.from(
      new Set(
        ruleData
          .flatMap((groupItem) => groupItem.emergencyRuleConditions)
          .map((item) => item.deviceProdId)
          .filter((item): item is string => !!item),
      ),
    );

    const productEntries = await Promise.all(
      categoryCodes.map(async (categoryCode) => {
        try {
          const productList = await cubeDeviceCenterService.getProductModel(categoryCode);
          return productList.map((item) => [String(item.id), item.name] as const);
        } catch (_ignore) {
          return [];
        }
      }),
    );

    const conditionEntries = await Promise.all(
      productIds.map(async (productId) => {
        try {
          const data = await DeviceService.getDeviceCondition({
            prodIds: productId,
            withPropertySpec: true,
          });
          const first = data[0] as unknown as {
            productPropVoList?: { propCode: string; propName: string }[];
            productEventVoList?: {
              eventCode: string;
              eventName: string;
              eventConfig?: { params?: { param_code: string; name: string }[] };
            }[];
          };
          return {
            propEntries: [
              ...(first?.productPropVoList ?? []).map((item) => [item.propCode, item.propName] as const),
              ...(first?.productEventVoList ?? []).flatMap((eventItem) =>
                (eventItem.eventConfig?.params ?? []).map((item) => [item.param_code, item.name] as const),
              ),
            ],
            eventEntries: (first?.productEventVoList ?? []).map((item) => [item.eventCode, item.eventName] as const),
          };
        } catch (_ignore) {
          return { propEntries: [], eventEntries: [] };
        }
      }),
    );

    setDetailLabelMap((draft) => {
      for (const entry of productEntries.flat()) {
        draft.productById[entry[0]] = entry[1];
      }
      for (const entry of conditionEntries.flatMap((item) => item.eventEntries)) {
        draft.eventByCode[entry[0]] = entry[1];
      }
      for (const entry of conditionEntries.flatMap((item) => item.propEntries)) {
        draft.propByCode[entry[0]] = entry[1];
      }
    });
  }, [readonly, ruleData]);

  if (readonly) {
    return (
      <div>
        {ruleData.map((groupItem, groupIndex) => (
          <div key={groupItem.id} className="alarm-detail-card">
            <div className="alarm-detail-card-title">条件组 {groupIndex + 1}</div>
            {groupItem.emergencyRuleConditions.map((item, index) => (
              <div key={item.id} className="alarm-detail-rule-item">
                <div className="alarm-detail-rule-title">触发条件 {index + 1}</div>
                <ReadonlyDescriptions column={4} items={formatRuleConditionItems(item)} />
              </div>
            ))}
            <ReadonlyDescriptions
              column={4}
              items={[
                { label: "时段类型", value: getOptionLabel(period, groupItem.emergencyRuleTime.timeType) },
                { label: "报警时间", value: <ReadonlyTags values={formatRuleTime(groupItem.emergencyRuleTime)} />, span: 3 },
              ]}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {ruleData.map((groupItem, groupIndex) => (
        <div key={groupItem.id} style={{ border: "1px solid #e8e8e8", padding: "10px", marginTop: "10px", position: "relative" }}>
          <AlarmRuleDevice
            groupItem={groupItem}
            deviceIndex={groupIndex}
            setInfo={(e) => {
              setRuleData((draft) => {
                draft[groupIndex] = e;
              });
            }}
          />
          {groupIndex !== 0 && (
            <div
              onClick={() => {
                deleteGroup(groupIndex);
              }}
              style={{ position: "absolute", right: "10px", top: "10px", cursor: "pointer" }}
            >
              <CloseOutlined style={{ color: "red" }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
  function deleteGroup(index: number): void {
    setRuleData((draft) => {
      draft.splice(index, 1);
    });
  }
  function addRuleGroup(): void {
    setRuleData((draft) => {
      draft.push({
        id: guid(),
        emergencyRuleConditions: [
          {
            id: guid(),
            deviceProdCategoryCodeConcat: "",
            deviceProdId: "",
            conditionType: null,
            deviceEventCode: "",
            deviceEventName: "",
            deviceEventType: "",
            deviceProdCategoryName: "",
            deviceProdName: "",
            emergencyRuleConditionExps: [
              {
                id: guid(),
                propCode: "",
                op: null,
                oprand: "",
                delayTime: 0,
                propName: "",
                propUnit: "",
                emergencyRuleConditionId: "",
                emergencyRuleId: "",
                startDelayTime: 0,
                endDelayTime: 0,
              },
            ],
          },
        ],
        emergencyRuleTime: {
          timeType: "ALL",
          timeConditions: "",
          timeList: [
            {
              beginTime: "",
              endTime: "",
            },
          ],
        },
      });
    });
  }

  function formatRuleConditionItems(item: RuleDataType): { label: string; value: ReactNode; span?: number }[] {
    const baseItems = [
      { label: "设备品类", value: getCategoryName(item) },
      { label: "产品名称", value: getProductName(item) },
      { label: "条件类型", value: getOptionLabel(conditionType, item.conditionType) },
    ];
    if (item.conditionType === "DEVICE_EVENT_CONDITION") {
      const eventConfigTypeValue = item.eventConfigType ?? inferEventConfigTypeFromExps(item.emergencyRuleConditionExps);
      return [
        ...baseItems,
        { label: "设备事件", value: getEventName(item) },
        ...(eventConfigTypeValue ? [{ label: "事件配置", value: getOptionLabel(eventConfigType, eventConfigTypeValue) }] : []),
        { label: "条件配置", value: <ReadonlyTags values={formatDeviceEventExps(item.emergencyRuleConditionExps)} />, span: 3 },
      ];
    }
    return [
      ...baseItems,
      { label: "条件表达式", value: <ReadonlyTags values={formatCustomExps(item.emergencyRuleConditionExps)} />, span: 3 },
    ];
  }

  function inferEventConfigTypeFromExps(
    exps: EmergencyRuleConditionExpsType[],
  ): "THRESHOLD_SETTING" | "PARAMETER_SETTING" | undefined {
    if (!exps.length) {
      return undefined;
    }
    const thresholdCodes = deviceEventAlarmType.map((item) => item.value);
    return exps.every((item) => thresholdCodes.includes(item.propCode as string)) ? "THRESHOLD_SETTING" : "PARAMETER_SETTING";
  }

  function formatCustomExps(exps: EmergencyRuleConditionExpsType[]): string[] {
    return exps.map((item) => {
      const expression = formatCompareExpression(item);
      if (!item.delayTime || item.delayTime <= 0) {
        return expression;
      }
      return `${expression}，持续 ${item.delayTime} 秒`;
    });
  }

  function formatDeviceEventExps(exps: EmergencyRuleConditionExpsType[]): string[] {
    if (!exps.length) {
      return [];
    }
    return exps.map((item) => {
      const thresholdName = getOptionLabel(deviceEventAlarmType, item.propCode ?? "");
      if (thresholdName !== (item.propCode ?? "")) {
        return `${String(thresholdName)}：${item.oprand || "-"} 秒`;
      }
      return formatCompareExpression(item);
    });
  }

  function formatCompareExpression(item: EmergencyRuleConditionExpsType): string {
    const propName = item.propName || (item.propCode ? detailLabelMap.propByCode[item.propCode] : undefined) || item.propCode || "-";
    const comparatorName = item.op ? ` ${String(getOptionLabel(comparator, item.op as unknown as string))} ` : "：";
    const unit = item.propUnit || "";
    return `${propName}${comparatorName}${item.oprand || "-"}${unit}`;
  }

  function getCategoryName(item: RuleDataType): string | undefined {
    const categoryNames = item.deviceProdCategoryCodeConcat
      ?.split("-")
      .filter(Boolean)
      .map((code) => detailLabelMap.categoryByCode[code] ?? code);
    const categoryPathName = categoryNames?.length ? categoryNames.join(" / ") : undefined;
    const lastCategoryCode = getLastCategoryCode(item.deviceProdCategoryCodeConcat);
    return item.deviceProdCategoryName || categoryPathName || lastCategoryCode;
  }

  function getProductName(item: RuleDataType): string | undefined {
    return item.deviceProdName || (item.deviceProdId ? detailLabelMap.productById[item.deviceProdId] : undefined) || item.deviceProdId;
  }

  function getEventName(item: RuleDataType): string | undefined {
    return item.deviceEventName || (item.deviceEventCode ? detailLabelMap.eventByCode[item.deviceEventCode] : undefined) || item.deviceEventCode;
  }

  function getLastCategoryCode(value: string | undefined): string | undefined {
    return value?.split("-").filter(Boolean).at(-1);
  }

  function getCategoryNameMap(list: CategoryNode[]): Record<string, string> {
    return list.reduce<Record<string, string>>((result, item) => {
      result[item.categoryCode] = item.categoryName;
      return {
        ...result,
        ...getCategoryNameMap(item.children ?? []),
      };
    }, {});
  }

  function formatRuleTime(time: RuleTimeType): string[] {
    if (time.timeType === "ALL") {
      return ["全天"];
    }
    if (time.timeType === "TIME") {
      const timeList = Array.isArray(time.timeList) ? time.timeList : [];
      return timeList.map((item) => `${item.beginTime || "-"} - ${item.endTime || "-"}`);
    }
    const values = parseConditions(time.timeConditions);
    if (time.timeType === "WEEK") {
      return values.map((item) => String(getOptionLabel(weekList, item)));
    }
    return values.map((item) => `${item}日`);
  }

  function parseConditions(value: string): (string | number)[] {
    if (!value) {
      return [];
    }
    try {
      const result = JSON.parse(value) as (string | number)[];
      return Array.isArray(result) ? result : [];
    } catch (_ignore) {
      return [];
    }
  }
});

interface CategoryNode {
  categoryCode: string;
  categoryName: string;
  children?: CategoryNode[];
}
