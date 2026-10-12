<template>
  <template v-if="state.alarmSnapshotDetail.length">
    <div class="title">报警数据</div>
    <div class="content">
      <div class="item alarm-value-item" v-for="(item, index) in state.alarmSnapshotDetail" :key="`${item.propCode}-${index}`">
        <div class="alarm-value-field">
          <div class="label">报警阈值：</div>
          <div class="value">
            <span class="alarm-condition-tag">{{ formatAlarmThreshold(item) }}</span>
          </div>
        </div>
        <div class="alarm-value-field">
          <div class="label">报警数据：</div>
          <div class="alarm-condition-tag">{{ formatAlarmData(item) }}</div>
        </div>
      </div>
      <div class="item" v-if="componentsChartDetail.length">
        <div class="label">数据快照：</div>
        <div class="value">
          <div class="content" v-for="item in componentsChartDetail" :key="item.propCode">
            <component
              v-if="AlarmChartComponent[item.propCode]"
              :is="AlarmChartComponent[item.propCode]"
              :min="item.minValue"
              :max="item.maxValue"
              :label="item.propName"
              :value="`${item.propValue}`"
              :unit="item.unit"
            ></component>
            <div v-else>{{ item.propName }}:{{ item.propValue }} {{ item.unit }}</div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed } from "vue";

import { AlarmChartComponent } from "./alarm-data-components";
import { cubeDeviceCenterService } from "@/api/service";
const numberDataType = ["int", "long", "float", "double"];
const comparatorLabel: Record<string, string> = {
  EQ: "等于",
  NE: "不等于",
  GT: "大于",
  GE: "大于等于",
  LT: "小于",
  LE: "小于等于",
  IN: "包含",
  NOT_IN: "不包含",
};
const formatConditionExpression = (condition: string, unit: string) => {
  let hasConditionExpression = false;
  const formattedExpression = condition
    .replace(/\[[^\]]+\]\s*(?=(?:NOT_IN|EQ|NE|GT|GE|LT|LE|IN)\s*\[)/g, "")
    .replace(/(NOT_IN|EQ|NE|GT|GE|LT|LE|IN)\s*\[([^\]]*)\]/g, (_match, operator, value) => {
      hasConditionExpression = true;
      return ` ${comparatorLabel[operator] ?? operator} ${value}${unit}`;
    })
    .replace(/\s*(?:&&|\bAND\b)\s*/gi, " 且 ")
    .replace(/\s*(?:\|\||\bOR\b)\s*/gi, " 或 ");

  return hasConditionExpression ? formattedExpression : condition;
};
const formatAlarmThreshold = (item: Record<string, string>) => {
  if (!item.condition) {
    return "--";
  }
  return `${item.propName}${formatConditionExpression(item.condition, item.unit)}`;
};
const formatAlarmData = (item: Record<string, string>) => {
  if (item.propValue === undefined || item.propValue === null || item.propValue === "") {
    return "--";
  }
  return `${item.propName} ${item.propValue}${item.unit}`;
};
const componentsChartDetail = computed(() => {
  const componentKeys = new Set(Object.keys(AlarmChartComponent));
  const snapshotKeys = new Set(state.alarmSnapshotDetail.map((item) => item.propCode));
  const intersectionKeys = [...componentKeys].filter((x) => snapshotKeys.has(x));
  return state.alarmSnapshotDetail.filter((item) => intersectionKeys.includes(item.propCode));
});
/**
 * 数据部分
 */
const state = reactive<{ alarmSnapshotDetail: Record<string, string>[] }>({
  alarmSnapshotDetail: [],
});

const props = defineProps<{
  alarmInfo: Record<string, any>;
  id: String;
}>();
onMounted(() => {
  handleAlarmSnapshot();
});
const handleAlarmSnapshot = async () => {
  const { alarmSnapshot, alarmTargetKey } = props.alarmInfo;
  if (!alarmSnapshot) return;

  const { matchSnapshot } = JSON.parse(alarmSnapshot);
  if (!Array.isArray(matchSnapshot)) {
    state.alarmSnapshotDetail = [];
    return;
  }

  const params = { deviceId: alarmTargetKey, withPropertySpec: true, withSnapShot: true };
  const result = (await cubeDeviceCenterService.getNorthDeviceDetail(params)) as unknown as Record<string, any>;
  const alarmSnapshotDetail = matchSnapshot.map((item) => {
    let propValue = "";
    const deviceAttribute = result.productPropVoList.find((attr) => attr.propCode === item.propCode);
    if (deviceAttribute.dataType === "enum" || deviceAttribute.dataType === "boolean") {
      const findValue = deviceAttribute.dataConstraint.find((keyValue) => String(keyValue.value) === String(item.propValue));
      propValue = findValue ? findValue.label : item.propValue;
    } else {
      propValue = item.propValue;
    }
    return {
      propName: deviceAttribute.propName,
      propValue,
      propCode: item.propCode,
      condition: String(item.condition ?? ""),
      minValue: numberDataType.includes(deviceAttribute.dataType) ? Math.min(...deviceAttribute.dataConstraint) : 0,
      maxValue: numberDataType.includes(deviceAttribute.dataType) ? Math.max(...deviceAttribute.dataConstraint) : 0,
      unit: deviceAttribute.unitName || "",
      time: item.propValueTs,
    };
  });
  state.alarmSnapshotDetail = alarmSnapshotDetail;
};
</script>

<style scoped lang="less">
.title {
  width: 100%;
  height: auto !important;
  // line-height: 35px;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #000000d9;
  border-top: 1px solid #e8e8e88c;
  padding-top: 16px !important;
  font-family: PingFang SC-Medium;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;

  &:first-child {
    border: none;
    padding-top: 0 !important;
  }
}

.content {
  .item {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    &.alarm-value-item {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 32px;
    }

    .alarm-value-field {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .alarm-condition-tag {
      display: inline-flex;
      align-items: center;
      min-height: 32px;
      padding: 4px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      background: #fff;
      color: rgba(0, 0, 0, 0.85);
      line-height: 22px;
    }

    .label {
      text-align: right;
      width: 105px;
      flex-shrink: 0;
    }

    .value {
      .content {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 26px;
      }
    }
  }
}
</style>
