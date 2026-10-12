import { AlarmRuleAttr } from "./alarm-rule-attr";
import type { RuleGroupType } from "./alarm-rule-model";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useAsyncEffect } from "@ghcloud/cube-iot-center-app/hooks/use-async-effect";
import { logger } from "@ghcloud/cube-iot-center-app/log";
import { getMonthList, guid } from "@ghcloud/cube-iot-center-app/utils/common";
import { period, weekList } from "@ghcloud/cube-iot-center-app/utils/enum";
import { Button, Col, DatePicker, Row, Select, TimePicker } from "antd";
import FormItem from "antd/es/form/FormItem";
import dayjs, { type Dayjs } from "dayjs";
import type { ReactElement } from "react";
import { useImmer } from "use-immer";

/** 报警规则条件组 */
export const AlarmRuleDevice = (props: {
  deviceIndex: number;
  groupItem: RuleGroupType;
  setInfo: (e: RuleGroupType, index: number) => void;
}) => {
  const urlParams = new URLSearchParams(location.search);
  const { groupItem, setInfo, deviceIndex } = props;

  const [ruleData, setRuleData] = useImmer<RuleGroupType>(groupItem);
  useAsyncEffect(async () => {
    logger.info("groupItem", ruleData);
    setInfo(ruleData, deviceIndex);
  }, [ruleData]);
  return (
    <>
      <div style={{ marginBottom: "10px", fontSize: "14px" }}>
        <span style={{ marginRight: "10px" }}>触发条件</span>
        {urlParams.get("type") !== "detail" && (
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => {
              addRule();
            }}
          >
            添加
          </Button>
        )}
      </div>
      {ruleData.emergencyRuleConditions.map((item, index) => (
        <AlarmRuleAttr
          key={item.id}
          groupItem={item}
          attrIndex={index}
          deleteAttr={() => {
            deleteAlarmRule(item.id);
          }}
          getInfo={(value) => {
            setRuleData((e) => {
              e.emergencyRuleConditions[index] = value;
            });
          }}
        />
      ))}
      <div className="title">报警时段</div>

      <FormItem label="时段类型:">
        <Row gutter={21}>
          <Col span={3}>
            <Select
              disabled={urlParams.get("type") === "detail"}
              value={ruleData.emergencyRuleTime.timeType}
              getPopupContainer={() => document.querySelector(".alarm-container") as unknown as HTMLElement}
              placeholder="时段(按配置的时段规则生效)"
              options={period}
              onChange={(e) => {
                setRuleData((draft) => {
                  draft.emergencyRuleTime.timeConditions = "";
                  if (e === "TIME") {
                    draft.emergencyRuleTime.timeList = [
                      {
                        beginTime: "00:00:00",
                        endTime: "23:59:59",
                      },
                    ];
                    draft.emergencyRuleTime.timeConditions = JSON.stringify(draft.emergencyRuleTime.timeList);
                  }

                  draft.emergencyRuleTime.timeType = e;
                });
              }}
            />
          </Col>
          <Col>
            {ruleData.emergencyRuleTime.timeType !== "ALL" ? (
              <FormItem label="报警时间:">
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {setTimeType(ruleData.emergencyRuleTime.timeList, ruleData.emergencyRuleTime.timeType)}
                </div>
              </FormItem>
            ) : null}
          </Col>
        </Row>
      </FormItem>
    </>
  );
  function setTimeType(
    list: { beginTime: string; endTime: string }[],
    type: "ALL" | "WEEK" | "MONTH" | "TIME",
  ): ReactElement | ReactElement[] {
    if (type === "TIME") {
      return list.map((item, index) => {
        // 处理清空的值
        const rangePickerValue = (): [Dayjs, Dayjs] | null => {
          if (item.beginTime === "" || item.endTime === "") {
            return null;
          }
          const beginTime = dayjs(`${dayjs().format("YYYY-MM-DD")} ${item.beginTime}`);
          const endTime = dayjs(`${dayjs().format("YYYY-MM-DD")} ${item.endTime}`);
          return [beginTime, endTime];
        };
        return (
          <div key={index}>
            <TimePicker.RangePicker
              disabled={urlParams.get("type") === "detail"}
              value={rangePickerValue()}
              format="HH:mm:ss"
              onChange={(e) => {
                const e1 = e as Dayjs[];
                setRuleData((draft) => {
                  draft.emergencyRuleTime.timeList[index].beginTime = e1 ? e1[0].format("HH:mm:ss") : "";
                  draft.emergencyRuleTime.timeList[index].endTime = e1 ? e1[1].format("HH:mm:ss") : "";
                  draft.emergencyRuleTime.timeConditions = JSON.stringify(draft.emergencyRuleTime.timeList);
                });
              }}
            />
            {urlParams.get("type") !== "detail" &&
              (index === 0 ? (
                <Button
                  style={{ marginLeft: "10px" }}
                  size="small"
                  type="primary"
                  shape="circle"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    addTime();
                  }}
                />
              ) : (
                <Button
                  style={{ marginLeft: "10px" }}
                  size="small"
                  danger
                  type="primary"
                  shape="circle"
                  icon={<MinusOutlined />}
                  onClick={() => {
                    deleteTime(index);
                  }}
                />
              ))}
          </div>
        );
      });
    }
    if (type === "MONTH") {
      return (
        <Select
          disabled={urlParams.get("type") === "detail"}
          style={{ width: "100px" }}
          placeholder="请选择"
          value={ruleData.emergencyRuleTime.timeConditions === "" ? [] : JSON.parse(ruleData.emergencyRuleTime.timeConditions)}
          options={getMonthList()}
          mode="multiple"
          onChange={(e) => {
            const e1 = e as string[];
            setRuleData((draft) => {
              draft.emergencyRuleTime.timeConditions = JSON.stringify(e1);
            });
          }}
          getPopupContainer={() => document.querySelector(".alarm-container") as unknown as HTMLElement}
        />
      );
    }
    if (type === "WEEK") {
      return (
        <Select
          disabled={urlParams.get("type") === "detail"}
          style={{ width: "100px" }}
          placeholder="请选择"
          value={ruleData.emergencyRuleTime.timeConditions === "" ? [] : JSON.parse(ruleData.emergencyRuleTime.timeConditions)}
          options={weekList}
          mode="multiple"
          onChange={(e) => {
            const e1 = e;
            setRuleData((draft) => {
              draft.emergencyRuleTime.timeConditions = JSON.stringify(e1);
            });
          }}
          getPopupContainer={() => document.querySelector(".alarm-container") as unknown as HTMLElement}
        />
      );
    } else {
      return <DatePicker.RangePicker disabled={urlParams.get("type") === "detail"} picker="week" />;
    }
  }
  function deleteTime(timeIndex: number): void {
    setRuleData((e) => {
      e.emergencyRuleTime.timeList.splice(timeIndex, 1);
    });
  }
  function addRule(): void {
    setRuleData((e) => {
      e.emergencyRuleConditions.push({
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
      });
    });
  }
  function deleteAlarmRule(index: string): void {
    setRuleData((e) => {
      e.emergencyRuleConditions = e.emergencyRuleConditions.filter((item) => item.id !== index);
    });
  }
  function addTime(): void {
    setRuleData((e) => {
      e.emergencyRuleTime.timeList.push({
        beginTime: "",
        endTime: "",
      });
    });
  }
};
