<template>
  <div class="alarm-rule-attr">
    <a-form-item label="规则:" class="rule-form-item">
      <a-row class="rule-trigger-row">
        <a-col class="rule-base-col">
          <a-form-item class="rule-control-item">
            <a-cascader
              :fieldNames="{
                label: 'categoryName',
                value: 'categoryCode',
              }"
              :value="
                ruleData.deviceProdCategoryCodeConcat === '' || ruleData.deviceProdCategoryCodeConcat === undefined
                  ? []
                  : ruleData.deviceProdCategoryCodeConcat.split('-')
              "
              @change="
                (value) => {
                  getModel(value);
                }
              "
              :disabled="type === 'detail'"
              :options="deviceInfo.deviceType"
              changeOnSelect
              placeholder="请选择产品品类"
            />
          </a-form-item>
        </a-col>
        <a-col class="rule-base-col">
          <a-form-item class="rule-control-item">
            <a-select
              :disabled="type === 'detail'"
              :value="ruleData.deviceProdId"
              @change="
                (value) => {
                  value && getCondition(value);
                }
              "
              placeholder="请选择产品名称"
            >
              <a-select-option :value="item.id" v-for="item in deviceInfo.deviceModel" :key="item.id">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col class="rule-base-col">
          <a-form-item class="rule-control-item">
            <a-select
              :disabled="type === 'detail'"
              :value="ruleData.conditionType"
              @change="
                (value) => {
                  ruleData.emergencyRuleConditionExps = [
                    {
                      propCode: undefined,
                      op: null,
                      oprand: '',
                      id: guid(),
                      delayTime: 0,
                      propName: '',
                      propUnit: '',
                      emergencyRuleConditionId: '',
                      emergencyRuleId: '',
                      startDelayTime: 0,
                      endDelayTime: 0,
                    },
                  ];
                  ruleData.conditionType = value;
                }
              "
              placeholder="请选择条件类型"
              :options="attributeType"
            />
          </a-form-item>
        </a-col>
        <a-col class="rule-condition-col">
          <div class="rule-condition-wrap">
            <div v-if="ruleData.conditionType" class="rule-condition-content">
              <template v-if="ruleData.conditionType === 'CUSTOM_RULE_CONDITION'">
                <div v-for="(item, index) in ruleData.emergencyRuleConditionExps" :key="item.id">
                  <a-row class="rule-exp-row">
                    <a-col class="rule-exp-col">
                      <a-form-item class="rule-control-item">
                        <a-select
                          :disabled="type === 'detail'"
                          :value="item.propCode"
                          @change="
                            (e) => {
                              const name = deviceInfo.devicePropCode.find((item) => {
                                return item.propCode === e;
                              })?.propName;
                              ruleData.emergencyRuleConditionExps[index].propCode = e;
                              ruleData.emergencyRuleConditionExps[index].propName = name;
                            }
                          "
                          placeholder="请选择设备属性"
                        >
                          <a-select-option :value="item.propCode" v-for="item in deviceInfo.devicePropCode" :key="item.id">
                            {{ item.propName }}
                          </a-select-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                    <a-col class="rule-exp-col">
                      <a-form-item class="rule-control-item">
                        <a-select
                          :disabled="type === 'detail'"
                          :value="item.op"
                          @change="
                            (e) => {
                              ruleData.emergencyRuleConditionExps[index].op = e;
                            }
                          "
                          placeholder="比较操作"
                          :options="comparator"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col class="rule-exp-col">
                      <a-form-item class="rule-control-item">
                        <a-input
                          :disabled="type === 'detail'"
                          :value="item.oprand"
                          @change="
                            (e) => {
                              ruleData.emergencyRuleConditionExps[index].oprand = e.target.value;
                            }
                          "
                          placeholder="请输入属性值"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col class="rule-exp-col rule-delay-col">
                      <a-form-item class="rule-control-item">
                        <a-input-number
                          :disabled="type === 'detail'"
                          :value="item.delayTime"
                          :formatter="(value) => `${value} 秒`"
                          :min="0"
                          @change="
                            (e) => {
                              const time = e;
                              ruleData.emergencyRuleConditionExps[index].delayTime = e;
                            }
                          "
                          placeholder="状态持续时延"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col class="rule-action-col">
                      <a-button
                        v-if="type !== 'detail' && index === 0"
                        type="link"
                        :style="{ color: '#00ba8b' }"
                        @click="
                          () => {
                            addPropList();
                          }
                        "
                        >添加</a-button
                      >
                      <a-button
                        v-if="type !== 'detail' && index !== 0"
                        type="link"
                        danger
                        @click="
                          () => {
                            deletePropList(item.id);
                          }
                        "
                        >删除</a-button
                      >
                    </a-col>
                  </a-row>
                </div>
              </template>
              <template v-else-if="ruleData.conditionType === 'DEVICE_EVENT_CONDITION'">
                <div class="rule-event-condition">
                  <a-form-item class="rule-event-select">
                    <a-select
                      :disabled="type === 'detail'"
                      :value="ruleData.deviceEventCode"
                      @change="
                        (e) => {
                          const data = deviceInfo.deviceEventCode.find((item) => item.eventCode === e);
                          deviceInfo.propCode = data.eventConfig.eventRelatedProp.map((propItem) => {
                            return {
                              label: propItem,
                              value: propItem,
                            };
                          });
                          ruleData.deviceEventCode = e;

                          // 事件类型 属性事件 原生事件
                          const options = deviceInfo.deviceEventCode;
                          triggerType = options.find((ele) => ele.eventCode === e)?.eventConfig.triggerType;
                        }
                      "
                      placeholder="请选择设备事件"
                    >
                      <a-select-option v-for="item in deviceInfo.deviceEventCode" :value="item.eventCode">{{
                        item.eventName
                      }}</a-select-option>
                    </a-select>
                  </a-form-item>
                  <template v-if="triggerType === 'SIMPLE'">
                    <div>
                      <div v-for="(item, index) in ruleData.emergencyRuleConditionExps" :key="item.id" class="rule-event-delay">
                        <a-col>
                          <a-form-item class="rule-control-item">
                            <a-input-number
                              class="rule-delay-input"
                              :disabled="type === 'detail'"
                              :value="item.delayTime"
                              @change="
                                (e) => {
                                  const time = e;
                                  ruleData.emergencyRuleConditionExps[index].delayTime = time;
                                }
                              "
                              :formatter="(value) => `${value} 秒`"
                              :min="0"
                              placeholder="状态持续时延"
                            />
                          </a-form-item>
                        </a-col>
                        <a-button
                          v-if="type !== 'detail' && index === 0"
                          type="link"
                          style="color: #00ba8b"
                          @click="
                            () => {
                              addPropList();
                            }
                          "
                          >添加</a-button
                        >
                        <a-button
                          v-if="type !== 'detail' && index !== 0"
                          type="link"
                          danger
                          @click="
                            () => {
                              deletePropList(item.id);
                            }
                          "
                          >删除</a-button
                        >
                      </div>
                    </div>
                  </template>
                </div>
              </template>
              <template v-else-if="ruleData.conditionType === 'BASIC_INFORMATION'">
                <div v-for="(item, index) in ruleData.emergencyRuleConditionExps" :key="item.id">
                  <a-row class="rule-exp-row">
                    <a-col class="rule-exp-col">
                      <a-form-item class="rule-control-item">
                        <a-select
                          :disabled="type === 'detail'"
                          placeholder="请选择"
                          :options="[{ label: '创建时间', value: 'createTime' }]"
                          :value="item.propCode"
                          @change="
                            (e, option) => {
                              ruleData.emergencyRuleConditionExps[index].propCode = option.value;
                              ruleData.emergencyRuleConditionExps[index].propName = option.label;
                            }
                          "
                        />
                      </a-form-item>
                    </a-col>
                    <a-col class="rule-basic-range-col">
                      <a-form-item class="rule-control-item" label="距今日">
                        <div class="rule-basic-range">
                          <a-select
                            :value="item.op"
                            @change="
                              (e) => {
                                ruleData.emergencyRuleConditionExps[index].op = e;
                              }
                            "
                            :disabled="type === 'detail'"
                            placeholder="请选择"
                            :options="[
                              { label: '大于', value: 'GT' },
                              { label: '大于等于', value: 'GE' },
                            ]"
                          />
                          <a-input
                            type="number"
                            :disabled="type === 'detail'"
                            :value="item.oprand"
                            @change="
                              (e) => {
                                ruleData.emergencyRuleConditionExps[index].oprand = e.target.value;
                              }
                            "
                            addon-after="天"
                            placeholder="请输入属性值"
                          />
                        </div>
                      </a-form-item>
                    </a-col>
                    <a-col class="rule-action-col">
                      <a-button
                        v-if="type !== 'detail' && index === 0"
                        type="link"
                        :style="{ color: '#00ba8b' }"
                        @click="
                          () => {
                            addPropList();
                          }
                        "
                        >添加</a-button
                      >
                      <a-button
                        v-if="type !== 'detail' && index !== 0"
                        type="link"
                        danger
                        @click="
                          () => {
                            deletePropList(item.id);
                          }
                        "
                        >删除</a-button
                      >
                    </a-col>
                  </a-row>
                </div>
              </template>
              <template v-else> </template>
            </div>
            <a-col>
              <a-button
                type="link"
                danger
                @click="
                  () => {
                    deleteAlarmRule();
                  }
                "
                v-if="type !== 'detail' && atIndex !== 0 && ruleData.emergencyRuleConditionExps?.length > 0"
                >删除规则</a-button
              >
            </a-col>
          </div>
        </a-col>
      </a-row>
    </a-form-item>
  </div>
</template>
<script lang="jsx">
import { onMounted, defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { cubeDeviceCenterService } from "@/api/service";
import { guid } from "@/utils/common";
import { attributeType, comparator } from "@/utils/enum";
export default defineComponent({
  props: {
    ruleData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    attrIndex: {
      type: Number,
      default: 0,
    },
  },
  setup(props, { emit }) {
    const route = useRoute();
    const ruleData = ref();
    const atIndex = ref(0);
    const deviceInfo = ref({
      deviceType: [],
      deviceEventCode: [],
    });
    const triggerType = ref("");
    const type = route.query.type;
    ruleData.value = props.ruleData;
    atIndex.value = props.attrIndex;
    onMounted(async () => {
      const data = await cubeDeviceCenterService.getIotProductCategoryTree();
      deviceInfo.value.deviceType = data;
      getDeviceModel(ruleData.value.deviceProdCategoryCodeConcat);
      getVoList(ruleData.value.deviceProdId);
    });
    const deleteAlarmRule = () => {
      emit("deleteAttr");
    };
    const getModel = (value) => {
      ruleData.value.deviceProdId = "";
      const info = value[value.length - 1];
      getDeviceModel(info);
      ruleData.value.deviceProdCategoryCodeConcat = value.join("-");
    };
    const getDeviceModel = async (value) => {
      try {
        if (!value) return;
        const data = await cubeDeviceCenterService.getProductModel(value);
        deviceInfo.value.deviceModel = data;
      } catch (error) {
        message.error(error.toJSON().errorMessage);
      }
    };
    const getCondition = (value) => {
      ruleData.value.deviceProdId = value;
      getVoList(value);
    };
    const getVoList = async (id) => {
      if (!id) return;
      const { data } = await cubeDeviceCenterService.getDeviceCondition({
        prodIds: id,
        withPropertySpec: true,
      });
      if (data.length === 0) return;
      deviceInfo.value.devicePropCode = data[0]?.productPropVoList;
      deviceInfo.value.deviceEventCode = data[0]?.productEventVoList;
      triggerType.value = deviceInfo.value.deviceEventCode.find(
        (ele) => ele.eventCode === ruleData.value.deviceEventCode,
      )?.eventConfig.triggerType;
    };
    const addPropList = () => {
      ruleData.value.emergencyRuleConditionExps.push({
        propCode: undefined,
        op: null,
        oprand: "",
        delayTime: 0,
        id: guid(),
        startDelayTime: 0,
        endDelayTime: 0,
        propName: "",
        propUnit: "",
        emergencyRuleConditionId: "",
        emergencyRuleId: "",
      });
    };
    const deletePropList = (index) => {
      ruleData.value.emergencyRuleConditionExps = ruleData.value.emergencyRuleConditionExps.filter((item) => item.id !== index);
    };
    return {
      ruleData,
      deviceInfo,
      type,
      atIndex,
      attributeType,
      comparator,
      triggerType,
      guid,
      deleteAlarmRule,
      getModel,
      getCondition,
      addPropList,
      deletePropList,
    };
  },
});
</script>
<style lang="less" scoped>
.alarm-rule-attr {
  width: 100%;
  min-width: 760px;
  margin-bottom: 8px;
}

.rule-form-item {
  width: 100%;
  margin-bottom: 0;

  :deep(.ant-form-item-control) {
    flex: 1;
    min-width: 0;
  }
}

.rule-trigger-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  width: 100%;
  gap: 8px;
}

.rule-base-col {
  flex: 0 0 160px;
  max-width: 160px;
}

.rule-condition-col {
  flex: 1 0 420px;
  max-width: none;
}

.rule-condition-wrap {
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
}

.rule-condition-content {
  flex: 1;
  min-width: 0;
}

.rule-control-item {
  width: 100% !important;
  margin-bottom: 8px;
}

.rule-control-item,
.rule-event-select {
  :deep(.ant-select),
  :deep(.ant-cascader-picker),
  :deep(.ant-input),
  :deep(.ant-input-number) {
    width: 100%;
  }
}

.rule-exp-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}

.rule-exp-col {
  flex: 0 0 130px;
  max-width: 130px;
}

.rule-delay-col {
  flex-basis: 120px;
  max-width: 120px;
}

.rule-basic-range-col {
  flex: 0 0 260px;
  max-width: 260px;
}

.rule-basic-range {
  display: flex;
  width: 100%;

  :deep(.ant-select) {
    flex: 0 0 92px;
  }

  :deep(.ant-input-group-wrapper) {
    flex: 1;
    min-width: 0;
  }
}

.rule-action-col {
  flex: 0 0 80px;
  max-width: 80px;
  white-space: nowrap;
}

.rule-event-condition {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.rule-event-select {
  flex: 0 0 200px;
  width: 200px;
  margin-bottom: 8px;
}

.rule-event-delay {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.rule-delay-input {
  width: 110px;
}
</style>
