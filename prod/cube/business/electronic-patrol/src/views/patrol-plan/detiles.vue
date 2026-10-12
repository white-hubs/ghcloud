<!-- eslint-disable no-console -->
<template>
  <GLayout :title="type === 'task' ? '巡更任务' : '巡更计划'" :showfooter="true">
    <template #content-data>
      <Tabs v-model:activeKey="activeKey" hide-add type="card" @change="tabchange">
        <TabPane key="基础信息" tab="基础信息">
          <div v-if="type === 'plan'" class="pl-60px pr-60px select" style="height: 500px; overflow-y: auto">
            <Form ref="planref" layout="inline" :model="planbasicInfo" :label-col="{ style: 'width: 110px' }">
              <Row class="w-100%">
                <Col :span="12">
                  <FormItem label="计划名称:" name="planName" :rules="[{ required: true, message: '请输入计划名称', trigger: 'blur' }]">
                    <Input
                      v-if="!disabled"
                      v-model:value="planbasicInfo.planName"
                      :maxlength="20"
                      :disabled="disabled"
                      class="w-100%"
                      placeholder="请输入计划名称"
                    />
                    <div v-else v-text="planbasicInfo.planName" />
                  </FormItem>
                </Col>

                <Col :span="12">
                  <FormItem label="计划状态:" name="status" :rules="[{ required: true, message: '请选择计划状态', trigger: 'change' }]">
                    <Select
                      v-if="!disabled"
                      v-model:value="planbasicInfo.status"
                      :options="PLAN_STATUS_OPTIONS"
                      :disabled="disabled"
                      placeholder="请选择计划状态"
                    />

                    <div v-else>
                      {{ PLAN_STATUS_OPTIONS.find((item) => item.value === planbasicInfo.status)?.label || "--" }}
                    </div>
                  </FormItem>
                </Col>
              </Row>
              <Row class="w-100% mt-15px">
                <Col :span="12">
                  <FormItem
                    label="计划生效时间:"
                    name="startData"
                    :rules="[
                      {
                        required: true,
                        message: '请选择计划生效时间',
                        trigger: 'change',
                      },
                    ]"
                  >
                    <ConfigProvider v-if="!disabled" prefix-cls="electronic-patrol" :locale="zhCN">
                      <DatePicker
                        v-model:value="planbasicInfo.startData"
                        :disabled="disabled"
                        class="w-100%"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        show-time
                        @change="starttime"
                      />
                    </ConfigProvider>
                    <div v-else>
                      {{ dayjs(planbasicInfo.startData).format("YYYY-MM-DD HH:mm:ss") }}
                    </div>
                  </FormItem>
                </Col>

                <Col :span="12">
                  <FormItem
                    label="计划失效时间:"
                    name="endData"
                    :rules="[
                      {
                        required: true,
                        message: '请选择计划失效时间',
                        trigger: 'change',
                      },
                    ]"
                  >
                    <DatePicker
                      v-if="!disabled"
                      v-model:value="planbasicInfo.endData"
                      :disabled="disabled"
                      class="w-100%"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      show-time
                      @change="endtime"
                    />
                    <div v-else>
                      {{ dayjs(planbasicInfo.endData).format("YYYY-MM-DD HH:mm:ss") }}
                    </div>
                  </FormItem>
                </Col>
              </Row>
              <Row class="w-100% mt-15px">
                <Col :span="12">
                  <FormItem
                    label="巡更周期:"
                    name="patrolCycle"
                    :rules="[{ required: true, message: '请选择巡更周期', trigger: 'change' }]"
                  >
                    <Select
                      v-if="!disabled"
                      v-model:value="planbasicInfo.patrolCycle"
                      placeholder="请选择巡更周期"
                      :disabled="disabled"
                      :options="PATROL_CYCLE_OPTIONS"
                    />
                    <div v-else>
                      {{ planbasicInfo.patrolCycle === "circulate" ? "循环" : "单次" }}
                    </div>
                  </FormItem>
                </Col>

                <Col :span="12">
                  <FormItem
                    label="巡更日期:"
                    :disabled="disabled"
                    :name="planbasicInfo.patrolDataType === 'day' ? '' : 'patrolData'"
                    :rules="[{ required: true, message: '请选择巡更日期', trigger: 'blur' }]"
                  >
                    <div class="flex">
                      <div v-if="!disabled" style="width: 100%">
                        <Select
                          v-if="planbasicInfo.patrolDataType !== 'day'"
                          v-model:value="planbasicInfo.patrolData"
                          placeholder="请选择巡更日期"
                          :disabled="disabled"
                          :options="planbasicInfo.patrolDataType === 'month' ? mouthselect : weekselect"
                          mode="multiple"
                        />
                      </div>

                      <span v-else>
                        <span v-if="planbasicInfo.patrolDataType === 'day'"> 每天 </span>
                        <span v-else>
                          {{
                            datetimeshow(planbasicInfo.patrolData) === "undefined" ? "今日" : datetimeshow(planbasicInfo.patrolData)
                          }}</span
                        >
                      </span>
                      <!-- <span >{{ planbasicInfo.patrolData.map((res:number)=>{
                        if(planbasicInfo.patrolDataType==='mouth'){
                          return `${res}号`
                        }else{
                          return `周${res===7?'天':res}`
                        }
                      }).join(',') }}</span> -->

                      <Select
                        v-if="!disabled"
                        v-model:value="planbasicInfo.patrolDataType"
                        :disabled="disabled"
                        :options="PATROL_DATA_TYPE_OPTIONS"
                        :style="planbasicInfo.patrolDataType === 'day' ? 'width:100%' : 'width: 80px'"
                      />
                      <!-- <span v-else style="margin-left:10px">{{ planbasicInfo.patrolDataType==='mouth'?'按月':'按周' }}</span> -->
                    </div>
                  </FormItem>
                </Col>
              </Row>
              <!-- <Row class="w-100% mt-15px">
                <Col :span="12">
                  <FormItem
                    label="执行时间段:"
                    name="executeData"
                    :rules="[
                      { required: true, message: '请选择执行时间段', trigger: 'change' },
                    ]"
                  >
                    <TimeRangePicker
                      v-if="!disabled"
                      v-model:value="planbasicInfo.executeData"
                      :disabled="disabled"
                      format="HH:mm"
                      value-format="HH:mm"
                    />
                    <div v-else>{{ planbasicInfo.executeData?.join("-") }}</div>
                  </FormItem>
                </Col>
              </Row> -->
              <Row class="w-100% mt-15px">
                <Col :span="12">
                  <FormItem
                    label="巡更方式:"
                    name="patrolWayList"
                    :rules="[{ required: true, message: '请选择巡更方式', trigger: 'change' }]"
                  >
                    <Select
                      v-if="!disabled"
                      v-model:value="planbasicInfo.patrolWayList"
                      mode="multiple"
                      :disabled="disabled"
                      :options="PATROL_WAY_OPTIONS"
                      placeholder="请选择巡更方式"
                    />

                    <div v-else>
                      {{ formatPatrolWayList(planbasicInfo.patrolWayList) }}
                    </div>
                  </FormItem>
                </Col>
              </Row>
              <Row v-if="planHasGpsPatrol" class="w-100% mt-15px">
                <Col :span="12">
                  <FormItem name="rule" label="规则:" :rules="gpsRuleRules">
                    <div class="gps-rule">
                      <span>满足当距离 &lt;</span>
                      <InputNumber
                        v-if="!disabled"
                        v-model:value="planbasicInfo.rule.gpsDistanceMeters"
                        :min="1"
                        :precision="0"
                        class="gps-rule-number"
                        placeholder="米"
                      />
                      <span v-else>{{ planbasicInfo.rule.gpsDistanceMeters || "--" }}</span>
                      <span>，停留时长 &gt;</span>
                      <InputNumber
                        v-if="!disabled"
                        v-model:value="planbasicInfo.rule.gpsStayMinutes"
                        :min="1"
                        :precision="0"
                        class="gps-rule-number"
                        placeholder="分钟"
                      />
                      <span v-else>{{ planbasicInfo.rule.gpsStayMinutes || "--" }}</span>
                      <span>分钟，系统自动巡更。</span>
                    </div>
                    <div class="gps-rule-tip">温馨提示：需要打开手机定位功能。</div>
                  </FormItem>
                </Col>
              </Row>
              <Row class="w-100% mt-15px">
                <Col :span="12">
                  <PatrolWay ref="PatrolWayRef" />
                </Col>
              </Row>
            </Form>
          </div>
          <div v-else class="pl-60px pr-60px">
            <Form ref="taskfrom" layout="inline" :model="taskBasicInfo" :label-col="{ style: 'width: 100px' }">
              <Row class="w-100%">
                <Col :span="12">
                  <FormItem label="任务名称:" name="taskName" :rules="[{ required: true, message: '请输入任务名称', trigger: 'blur' }]">
                    <Input v-model:value="taskBasicInfo.taskName" class="w-100%" placeholder="请输入任务名称" />
                  </FormItem>
                </Col>

                <!-- <Col :span="12">
                  <FormItem
                    label="巡更时间段:"
                    name="executeData"
                    :rules="[
                      { required: true, message: '请选择时间段', trigger: 'change' },
                    ]"
                  >
                    <TimeRangePicker
                      v-model:value="taskBasicInfo.executeData"
                      format="HH:mm"
                      value-format="HH:mm"
                    />
                  </FormItem>
                </Col> -->
                <!-- <Input v-model:value="taskBasicInfo.executeData" class="w-100%" /> -->
              </Row>
              <Row class="w-100% mt-15px">
                <Col :span="12">
                  <FormItem
                    label="巡更方式:"
                    name="patrolWayList"
                    :rules="[{ required: true, message: '请选择巡更方式', trigger: 'change' }]"
                  >
                    <Select
                      v-if="!disabled"
                      v-model:value="taskBasicInfo.patrolWayList"
                      mode="multiple"
                      :disabled="disabled"
                      :options="PATROL_WAY_OPTIONS"
                      placeholder="请选择巡更方式"
                    />
                    <div v-else>
                      {{ formatPatrolWayList(taskBasicInfo.patrolWayList) }}
                    </div>
                  </FormItem>
                </Col>
                <Row v-if="taskHasGpsPatrol" class="w-100% mt-15px">
                  <Col :span="12">
                    <FormItem name="rule" label="规则:" :rules="gpsRuleRules">
                      <div class="gps-rule">
                        <span>满足当距离 &lt;</span>
                        <InputNumber
                          v-if="!disabled"
                          v-model:value="taskBasicInfo.rule.gpsDistanceMeters"
                          :min="1"
                          :precision="0"
                          class="gps-rule-number"
                          placeholder="米"
                        />
                        <span v-else>{{ taskBasicInfo.rule.gpsDistanceMeters || "--" }}</span>
                        <span>，停留时长 &gt;</span>
                        <InputNumber
                          v-if="!disabled"
                          v-model:value="taskBasicInfo.rule.gpsStayMinutes"
                          :min="1"
                          :precision="0"
                          class="gps-rule-number"
                          placeholder="分钟"
                        />
                        <span v-else>{{ taskBasicInfo.rule.gpsStayMinutes || "--" }}</span>
                        <span>分钟，系统自动巡更。</span>
                      </div>
                      <div class="gps-rule-tip">温馨提示：需要打开手机定位功能。</div>
                    </FormItem>
                  </Col>
                </Row>
                <Row class="w-100% mt-15px">
                  <Col :span="12">
                    <PatrolWay ref="PatrolWayRef" />
                  </Col>
                </Row>
              </Row>
            </Form>
          </div>
        </TabPane>
        <TabPane key="巡更路线" tab="巡更路线">
          <PatrolLine ref="PatrolLineref" :datainfo="linedatainfo" :disabled="disabled" />
        </TabPane>
        <TabPane key="巡更人员" tab="巡更人员">
          <PatrolUser ref="PatrolUserref" :datainfo="userdatainfo as any" :disabled="disabled" />
        </TabPane>
      </Tabs>
    </template>
    <template #footer-page>
      <Button class="mr-15px" @click="back">返回</Button>
      <Button v-if="handle !== 'detiles'" type="primary" @click="addInfo">
        {{ handle === "copy" ? "复制" : "保存" }}
      </Button>
    </template>
  </GLayout>
</template>
<script lang="ts">
import { DatePicker } from "ant-design-vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from "dayjs";
import { computed, onMounted, reactive, ref, watch, nextTick } from "vue";
import { useRoute } from "vue-router";

import { Button, message } from "@ghcloud/cube-ui";

import { addplan, addplanone, updatePlan } from "@/api/plan-api";
import { addtask } from "@/api/task-api";
import GLayout from "@/components/common/g-layout.vue";
import PatrolLine from "@/components/patrol-line.vue";
import PatrolUser from "@/components/patrol-user.vue";

dayjs.locale("zh-cn");
</script>
<script setup lang="ts">
// 常量定义
const WEEK_NAMES = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"] as const;
const WEEK_DATA: Record<number, string> = {
  1: "周一",
  2: "周二",
  3: "周三",
  4: "周四",
  5: "周五",
  6: "周六",
  7: "周日",
};

const PATROL_WAY_OPTIONS = [
  { label: "NFC巡更", value: "NFC" },
  { label: "蓝牙巡更", value: "BLUETOOTH" },
  { label: "二维码巡更", value: "QRCODE" },
  { label: "GPS巡更", value: "GPS" },
] as const;

const PATROL_CYCLE_OPTIONS = [
  { label: "循环", value: "circulate" },
  { label: "单次", value: "one" },
] as const;

const PATROL_DATA_TYPE_OPTIONS = [
  { label: "按月", value: "month" },
  { label: "按周", value: "week" },
  { label: "按天", value: "day" },
] as const;

const PLAN_STATUS_OPTIONS = [
  { label: "启用", value: "ENABLE" },
  { label: "停用", value: "STOP" },
  { label: "结束", value: "END" },
] as const;

// 工具函数

// 生成日期选项
const weekselect: { label: string; value: number }[] = WEEK_NAMES.map((name, index) => ({
  label: name,
  value: index + 1,
}));

const mouthselect: { label: string; value: number }[] = Array.from({ length: 31 }, (_, i) => ({
  label: `${i + 1}号`,
  value: i + 1,
}));

// 数据定义
const linedatainfo = ref({
  routerId: "",
  inOrder: false,
  locationIds: [] as unknown[],
});

const userdatainfo = ref({
  onDuty: false,
  conditionParticipate: null as unknown,
});

// 组件引用
const taskfrom = ref();
const planref = ref();
const PatrolLineref = ref();
const PatrolUserref = ref();
const PatrolWayRef = ref(null);

// 路由参数
const route = useRoute();
const { type, id, handle } = route.query;

// 状态
const disabled = ref<boolean>(false);
const activeKey = ref("基础信息");
const currentInfo = ref<unknown>();
const createGpsPatrolRule = (): Plan.GpsPatrolRule => ({
  gpsDistanceMeters: "",
  gpsStayMinutes: "",
});

const taskBasicInfo = reactive<TASK.AddTask>({
  taskName: "",
  planId: "",
  routeId: "",
  inOrder: false,
  taskList: [],
  onDuty: false,
  executeData: null,
  locationIds: [],
  patrolWayList: [],
  conditionParticipate: null,
  rule: createGpsPatrolRule(),
});

const planbasicInfo = ref<Plan.AddPlan>({
  startData: "",
  endData: "",
  patrolCycle: "circulate",
  taskList: [],
  patrolDataType: "month",
  locationIds: [],
  planName: "",
  executeData: null,
  patrolData: [],
  onDuty: false,
  routeId: "",
  inOrder: false,
  status: "ENABLE",
  patrolWayList: [],
  conditionParticipate: null,
  rule: createGpsPatrolRule(),
});

// 格式化巡更日期显示
const datetimeshow = (patrolData: string | number[] | undefined): string => {
  if (!patrolData) return "";
  if (typeof patrolData === "string") {
    const parts = patrolData.split(",").sort();
    return parts
      .map((res) => {
        const num = parseInt(res, 10);
        if (planbasicInfo.value.patrolDataType === "month") {
          return `${num}号`;
        } else {
          return WEEK_DATA[num] || res;
        }
      })
      .join(",");
  }
  return "";
};

// 格式化巡更方式显示
const formatPatrolWayList = (patrolWayList: string[] | undefined): string => {
  if (!patrolWayList || patrolWayList.length === 0) {
    return "--";
  }
  return patrolWayList.map((way) => convertPatrolWayToDisplay(way)).join(",");
};

// 转换巡更方式值（显示值转代码值）
const convertPatrolWayToCode = (way: string): string => {
  const wayMap: Record<string, string> = {
    NFC巡更: "NFC",
    蓝牙巡更: "BLUETOOTH",
    二维码巡更: "QRCODE",
    GPS巡更: "GPS",
  };
  return wayMap[way] || way;
};

// 转换巡更方式值（代码值转显示值）
const convertPatrolWayToDisplay = (way: string): string => {
  const wayMap: Record<string, string> = {
    QRCODE: "二维码巡更",
    NFC: "NFC巡更",
    BLUETOOTH: "蓝牙巡更",
    GPS: "GPS巡更",
  };
  return wayMap[way] || way;
};

const hasGpsPatrolWay = (patrolWayList: string[] | undefined): boolean => {
  return patrolWayList?.some((way) => convertPatrolWayToCode(way) === "GPS") || false;
};

const planHasGpsPatrol = computed(() => hasGpsPatrolWay(planbasicInfo.value.patrolWayList));
const taskHasGpsPatrol = computed(() => hasGpsPatrolWay(taskBasicInfo.patrolWayList));

const gpsRuleRules = [
  {
    required: true,
    validator: (_rule: unknown, value: Plan.GpsPatrolRule | undefined): Promise<void> => {
      if (!value || value.gpsDistanceMeters === "" || value.gpsStayMinutes === "") {
        return Promise.reject(new Error("请输入GPS巡更规则"));
      }
      return Promise.resolve();
    },
    trigger: "change",
  },
];

watch(
  () => planbasicInfo.value.patrolDataType,
  () => {
    if (handle === "detiles") return;
    planbasicInfo.value.patrolData = [];
  },
);
// 验证组件数据
const validateComponents = (): boolean => {
  if (!PatrolLineref.value || !PatrolUserref.value) {
    message.error("请检查数据是否填写完毕");
    return false;
  }
  if (PatrolLineref.value.patrolline.locationIds.length === 0) {
    message.error("请选择巡更点");
    return false;
  }
  const validateResult = PatrolUserref.value.validate();
  if (!validateResult.valid) {
    message.error(validateResult.message || "请选择巡更人员");
    return false;
  }
  return true;
};

// 合并组件数据到目标对象
const mergeComponentData = (target: Record<string, unknown>): void => {
  if (PatrolLineref.value) {
    Object.assign(target, PatrolLineref.value.patrolline);
  } else {
    Object.assign(target, linedatainfo.value);
  }
  if (PatrolUserref.value) {
    Object.assign(target, PatrolUserref.value.patrolline);
  } else {
    Object.assign(target, userdatainfo.value);
  }
};

// 处理任务列表数据
const processTaskList = (): unknown[] => {
  const wayRef = PatrolWayRef.value as { dynamicValidateForm?: { domains?: unknown[] } } | null;
  if (!wayRef?.dynamicValidateForm?.domains) {
    return [];
  }
  return wayRef.dynamicValidateForm.domains.map((item: unknown) => {
    const taskItem = item as Record<string, unknown>;
    if (Array.isArray(taskItem.timeRange)) {
      taskItem.timeRange = taskItem.timeRange.join("-");
    }
    return taskItem;
  });
};

// 处理巡更点数据（去重）
const processLocationIds = (locationIds: unknown[]): unknown[] => {
  const seen = new Set<string>();
  return locationIds.filter((item: unknown) => {
    const locationItem = item as { id?: string };
    if (!locationItem?.id) return false;
    if (seen.has(locationItem.id)) return false;
    seen.add(locationItem.id);
    return true;
  });
};

// 处理巡更方式数据
const processPatrolWayList = (patrolWayList: string[]): string[] => {
  return patrolWayList.map((way) => convertPatrolWayToCode(way));
};

const syncGpsRulePayload = (data: Record<string, unknown>): void => {
  const patrolWayList = (data.patrolWayList as string[]) || [];
  if (hasGpsPatrolWay(patrolWayList)) {
    const rule = data.rule as Plan.GpsPatrolRule | undefined;
    data.gpsDistanceMeters = rule?.gpsDistanceMeters;
    data.gpsStayMinutes = rule?.gpsStayMinutes;
    delete data.rule;
    return;
  }
  delete data.rule;
  delete data.gpsDistanceMeters;
  delete data.gpsStayMinutes;
};

const validatePatrolWayTasks = async (): Promise<void> => {
  const wayRef = PatrolWayRef.value as { rule?: () => Promise<void> } | null;
  if (wayRef?.rule) {
    await wayRef.rule();
  }
};

const validatePatrolLine = async (): Promise<void> => {
  await PatrolLineref.value?.validateFields?.();
};

const back = () => {
  history.go(-1);
};

// 标签页切换处理
const tabchange = (value: string | number) => {
  const isEditMode = handle === "detiles" || handle === "copy" || handle === "edit";
  if (!isEditMode || !currentInfo.value) return;

  if (value === "巡更路线") {
    nextTick(() => {
      const info = currentInfo.value as { routeId?: string; locationList?: unknown[]; inOrder?: boolean };
      linedatainfo.value.routerId = info.routeId || "";
      linedatainfo.value.locationIds = info.locationList || [];
      linedatainfo.value.inOrder = info.inOrder || false;
      if (PatrolLineref.value?.patrolline?.routeId === "") {
        PatrolLineref.value.setInfo(linedatainfo.value, handle === "detiles");
      }
    });
  } else if (value === "巡更人员") {
    const info = currentInfo.value as { conditionParticipate?: unknown; onDuty?: boolean };
    userdatainfo.value.conditionParticipate = info.conditionParticipate || null;
    userdatainfo.value.onDuty = info.onDuty || false;
    nextTick(() => {
      if (PatrolUserref.value?.patrolline?.conditionParticipate !== undefined) return;
      PatrolUserref.value?.setInfo(userdatainfo.value.conditionParticipate, userdatainfo.value.onDuty, handle === "detiles");
    });
  }
};
// 准备计划提交数据
const preparePlanData = (): Record<string, unknown> => {
  const data = JSON.parse(JSON.stringify(planbasicInfo.value)) as Record<string, unknown>;
  data.patrolData = Array.isArray(data.patrolData) ? data.patrolData.join(",") : data.patrolData;
  data.locationIds = processLocationIds((data.locationIds as unknown[]) || []);
  data.taskList = processTaskList();
  data.patrolWayList = processPatrolWayList((data.patrolWayList as string[]) || []);
  syncGpsRulePayload(data);
  return data;
};

const addInfo = async (): Promise<void> => {
  if (type === "plan") {
    // 验证表单
    if (planref.value) {
      await planref.value.validateFields();
    }
    await validatePatrolWayTasks();

    // 验证组件数据（所有模式都需要验证）
    if (!validateComponents()) {
      return;
    }

    await validatePatrolLine();

    // 合并组件数据
    mergeComponentData(planbasicInfo.value);

    // 准备提交数据
    const data = preparePlanData();

    // 根据操作类型提交
    if (handle === "edit") {
      data.id = id;
      await updatePlan(data as unknown as Plan.AddPlan);
    } else {
      await addplan(data as unknown as Plan.AddPlan);
    }

    history.go(-1);
  } else {
    // 任务模式
    if (taskfrom.value) {
      await taskfrom.value.validateFields();
    }
    await validatePatrolWayTasks();

    if (!validateComponents()) {
      return;
    }

    await validatePatrolLine();
    mergeComponentData(taskBasicInfo);

    const data = JSON.parse(JSON.stringify(taskBasicInfo)) as Record<string, unknown>;
    data.taskList = processTaskList();
    data.patrolWayList = processPatrolWayList((data.patrolWayList as string[]) || []);
    syncGpsRulePayload(data);

    await addtask(data as unknown as TASK.AddTask);
    history.go(-1);
  }

  // 设置巡更方式文字
  const wayRef = PatrolWayRef.value as { setWord?: () => void } | null;
  wayRef?.setWord?.();
};
// 时间验证
const starttime = () => {
  if (planbasicInfo.value.endData && planbasicInfo.value.startData) {
    if (new Date(planbasicInfo.value.startData).getTime() > new Date(planbasicInfo.value.endData).getTime()) {
      message.error("开始时间不能大于结束时间");
      planbasicInfo.value.startData = null;
    }
  }
};

const endtime = () => {
  if (planbasicInfo.value.startData && planbasicInfo.value.endData) {
    if (new Date(planbasicInfo.value.endData).getTime() < new Date(planbasicInfo.value.startData).getTime()) {
      message.error("结束时间不能小于开始时间");
      planbasicInfo.value.endData = null;
    }
  }
};
// 初始化数据
onMounted(async () => {
  disabled.value = handle === "detiles";
  if (!id) return;

  const { data } = await addplanone(id as string);
  data.rule = {
    ...createGpsPatrolRule(),
    ...(data.rule || {}),
    gpsDistanceMeters: data.gpsDistanceMeters ?? data.rule?.gpsDistanceMeters ?? "",
    gpsStayMinutes: data.gpsStayMinutes ?? data.rule?.gpsStayMinutes ?? "",
  };

  // 格式化日期
  data.endData = dayjs(data.endData).format("YYYY-MM-DD HH:mm:ss");
  data.startData = dayjs(data.startData).format("YYYY-MM-DD HH:mm:ss");

  // 详情模式下转换巡更方式显示值
  if (disabled.value && Array.isArray(data.patrolWayList)) {
    data.patrolWayList = data.patrolWayList.map((way: string) => convertPatrolWayToDisplay(way));
  }

  currentInfo.value = data;

  // 设置路线信息
  linedatainfo.value.routerId = data.routeId || "";
  linedatainfo.value.locationIds = data.locationList || [];
  linedatainfo.value.inOrder = data.inOrder || false;

  // 设置人员信息
  userdatainfo.value.onDuty = data.onDuty || false;
  userdatainfo.value.conditionParticipate = data.conditionParticipate || null;

  // 设置计划基本信息
  Object.assign(planbasicInfo.value, data);

  // 设置巡更方式信息
  const wayRef = PatrolWayRef.value as { setInfo?: (taskList: unknown[], disabled: boolean) => void } | null;
  wayRef?.setInfo?.(data.taskList || [], disabled.value);

  // 处理巡更日期数据
  setTimeout(() => {
    if (handle === "copy") {
      planbasicInfo.value.status = "ENABLE";
    }
    if ((handle === "copy" || handle === "edit") && typeof data.patrolData === "string") {
      planbasicInfo.value.patrolData = data.patrolData
        .split(",")
        .map((part: string) => parseInt(part, 10))
        .filter((num: number) => !isNaN(num));
    }
  }, 0);
});
</script>
<style lang="less" scoped>
// @import url("@/style/theme/color.less");
:deep(.electronic-patrol-form-item-with-help) {
  margin-bottom: 0 !important;
}

.gps-rule {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 32px;
}

.gps-rule :deep(.electronic-patrol-form-item) {
  margin-bottom: 0;
}

.gps-rule-number {
  width: 90px;
}

.gps-rule-tip {
  width: 100%;
  margin-top: 8px;
  padding: 6px 12px;
  color: #d46b08;
  line-height: 20px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 2px;
}

//
</style>
