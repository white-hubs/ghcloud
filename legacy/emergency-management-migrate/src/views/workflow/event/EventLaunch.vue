<script setup lang="ts">
import { message } from "ant-design-vue";
import moment from "moment";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import TaskDeviceSelector from "./TaskDeviceSelector.vue";
import { createEmergencyEvent, planDocumentDetail, planDocumentList, tenantUserList } from "@/api";
import { normalizeStoredPlanTasks } from "@/views/planDocuments/planTask";
import TaskLocationPicker from "@/views/planDocuments/TaskLocationPicker.vue";

import "../workflow.css";

const router = useRouter();
const route = useRoute();
const saving = ref(false);
const taskLoading = ref(false);
const planOptions = ref<any[]>([]);
const userOptions = ref<any[]>([]);
const configuredTasks = ref<any[]>([]);
const form = reactive<any>({
  name: "",
  sourceType: "FILE",
  sourceId: null,
  levelCode: "IMPORTANT",
  commanderId: undefined,
  occurredAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  emergencyFileIds: [],
  taskDevices: [],
});

const taskCount = computed(() => configuredTasks.value.reduce((count, item) => count + item.tasks.length, 0));
const sourceText = (task: any) =>
  task.sourceType === "TEMPLATE" ? task.templateName || "知识库模板" : task.sourceType === "MANUAL" ? "手动配置" : "AI生成";
const taskExecutorOptions = (task: any) => {
  const executorId = task.executors[0]?.executorId;
  const matched = userOptions.value.some((option) => String(option.value) === String(executorId));
  const options = userOptions.value.map((option) =>
    String(option.value) === String(executorId) ? { ...option, value: executorId, label: task.executorUser?.name || option.label } : option,
  );
  return !matched && executorId && task.executorUser?.name ? [{ label: task.executorUser.name, value: executorId }, ...options] : options;
};

const updateTaskLocation = (task: any, location: { locationDesc: string; longitude: number; latitude: number }) => {
  task.locationDesc = location.locationDesc;
  task.longitude = location.longitude;
  task.latitude = location.latitude;
};

const loadConfiguredTasks = async () => {
  if (!form.emergencyFileIds.length) {
    configuredTasks.value = [];
    return;
  }
  taskLoading.value = true;
  try {
    const details = await Promise.all(form.emergencyFileIds.map((id: number) => planDocumentDetail(id)));
    configuredTasks.value = details.map((detail: any) => ({
      planId: detail.id,
      planName: detail.name,
      tasks: normalizeStoredPlanTasks(detail.tasks || []).map((task, index) => ({
        ...task,
        taskId: detail.tasks?.[index]?.id,
        executorUser: detail.tasks?.[index]?.executors?.find((executor: any) => executor.executorType === "PERSON")?.user,
        executionContentText: task.executionContents.join("\n"),
        equipmentText: task.equipment.join("、"),
        linkedDevices: [],
        executors: [
          {
            executorType: "PERSON",
            executorId: task.executors.find((executor) => executor.executorType === "PERSON")?.executorId,
          },
        ],
      })),
    }));
  } finally {
    taskLoading.value = false;
  }
};

const load = async () => {
  const [plans, users] = await Promise.all([
    planDocumentList({ status: "ACTIVE", pageNumber: 1, pageSize: 200 }),
    tenantUserList({ enabled: true, pageNumber: 1, pageSize: 200 }),
  ]);
  const records = plans?.records || [];
  planOptions.value = records.map((item: any) => ({ label: item.name, value: item.id }));
  userOptions.value = (users?.records || users || []).map((item: any) => ({ label: item.name, value: item.id }));
  const plan = records.find((item: any) => String(item.id) === String(route.query.planId));
  if (plan) {
    form.emergencyFileIds = [plan.id];
    form.name = plan.name;
    form.levelCode = plan.levelCode || form.levelCode;
  }
};

const submit = async () => {
  if (!form.name || !form.emergencyFileIds.length || !form.commanderId) {
    message.warning("请完整填写事件信息、关联预案和总指挥");
    return;
  }
  const taskAdjustments = configuredTasks.value.flatMap((plan) =>
    plan.tasks.map((task: any, index: number) => ({
      emergencyFileTaskId: task.taskId,
      name: task.name.trim(),
      sortNo: index + 1,
      durationMinutes: task.durationMinutes,
      executionContentJson: JSON.stringify(
        task.executionContentText
          .split("\n")
          .map((item: string) => item.trim())
          .filter(Boolean),
      ),
      equipmentJson: JSON.stringify(
        task.equipmentText
          .split(/[、,，]/)
          .map((item: string) => item.trim())
          .filter(Boolean),
      ),
      locationDesc: task.locationDesc?.trim() || null,
      longitude: task.longitude ?? null,
      latitude: task.latitude ?? null,
      remark: task.remark?.trim() || null,
      executorId: task.executors[0]?.executorId,
    })),
  );
  const invalidTask = taskAdjustments.find((task) => !task.emergencyFileTaskId || !task.name || !task.executorId);
  if (invalidTask) {
    message.warning("请为每个任务填写名称并选择执行人员");
    return;
  }
  const taskDevices = configuredTasks.value.flatMap((plan) =>
    plan.tasks
      .filter((task: any) => task.linkedDevices.length)
      .map((task: any) => ({
        emergencyFileTaskId: task.taskId,
        devices: task.linkedDevices.map((device: any) => ({
          deviceId: device.id,
          deviceName: device.name,
          deviceCode: device.code,
        })),
      })),
  );
  saving.value = true;
  try {
    const id = await createEmergencyEvent({ ...form, taskDevices, taskAdjustments });
    message.success("事件已创建并下发任务");
    router.push({ path: "/planEvent/detail", query: { id } });
  } finally {
    saving.value = false;
  }
};

watch(() => form.emergencyFileIds, loadConfiguredTasks, { deep: true });
onMounted(load);
</script>

<template>
  <div class="workflow-page">
    <div class="workflow-content">
      <section class="workflow-card">
        <h2 class="workflow-section-title">事件信息</h2>
        <a-form layout="vertical" :model="form">
          <div class="workflow-grid">
            <a-form-item label="事件名称" required><a-input v-model:value="form.name" /></a-form-item>
            <a-form-item label="启动来源" required
              ><a-select
                v-model:value="form.sourceType"
                :options="[
                  { label: '手工启动', value: 'FILE' },
                  { label: '报警触发', value: 'ALARM' },
                ]"
            /></a-form-item>
            <a-form-item v-if="form.sourceType === 'ALARM'" label="报警ID" required
              ><a-input-number v-model:value="form.sourceId" class="full-width"
            /></a-form-item>
            <a-form-item label="事件等级" required
              ><a-select
                v-model:value="form.levelCode"
                :options="[
                  { label: '重要', value: 'IMPORTANT' },
                  { label: '普通', value: 'ORDINARY' },
                ]"
            /></a-form-item>
            <a-form-item label="发生时间" required
              ><a-date-picker v-model:value="form.occurredAt" show-time value-format="YYYY-MM-DD HH:mm:ss" class="full-width"
            /></a-form-item>
            <a-form-item label="总指挥" required
              ><a-select v-model:value="form.commanderId" show-search option-filter-prop="label" :options="userOptions"
            /></a-form-item>
          </div>
          <a-form-item label="关联预案" required
            ><a-select
              v-model:value="form.emergencyFileIds"
              mode="multiple"
              show-search
              option-filter-prop="label"
              :options="planOptions"
              placeholder="选择一个或多个已生效预案"
          /></a-form-item>
          <a-alert type="info" show-icon message="启动时会固化预案版本、任务和设备快照，后续预案修改不会影响本事件。" />
        </a-form>
      </section>

      <section class="workflow-card">
        <h2 class="workflow-section-title">
          <span>任务流程步骤 <small>（启动前可编辑调整）</small></span
          ><span class="workflow-muted">共 {{ taskCount }} 步</span>
        </h2>
        <a-spin :spinning="taskLoading">
          <a-empty v-if="!form.emergencyFileIds.length" description="请选择关联预案后查看任务" />
          <a-empty v-else-if="!taskLoading && !taskCount" description="所选预案未配置任务" />
          <div v-else class="plan-task-list">
            <section v-for="plan in configuredTasks" :key="plan.planId" class="plan-task-group">
              <div class="plan-task-group-title">预案：{{ plan.planName }}</div>
              <article v-for="(task, index) in plan.tasks" :key="task.clientKey" class="launch-task-card">
                <header class="launch-task-header">
                  <strong
                    ><span class="task-index">{{ index + 1 }}</span
                    ><a-input v-model:value="task.name" :maxlength="100" size="small" class="task-name"
                  /></strong>
                  <div class="task-meta">
                    <a-tag>{{ sourceText(task) }}</a-tag>
                    <div class="task-meta-field">
                      <span>限时时间</span>
                      <div class="task-duration-editor">
                        <a-input-number v-model:value="task.durationMinutes" :min="0" size="small" placeholder="限时时间" />
                        <span>分钟</span>
                      </div>
                    </div>
                    <div class="task-meta-field">
                      <span>任务执行人</span>
                      <a-select
                        v-model:value="task.executors[0].executorId"
                        :options="taskExecutorOptions(task)"
                        show-search
                        option-filter-prop="label"
                        size="small"
                        placeholder="选择任务执行人"
                        class="task-executor"
                      />
                    </div>
                  </div>
                </header>
                <div class="launch-task-body">
                  <div class="task-detail">
                    <span>操作步骤</span>
                    <a-textarea v-model:value="task.executionContentText" :auto-size="{ minRows: 3, maxRows: 6 }" />
                  </div>
                  <div class="task-detail-grid">
                    <div class="task-detail">
                      <span>装备</span>
                      <a-input v-model:value="task.equipmentText" placeholder="多个装备使用顿号或逗号分隔" />
                    </div>
                    <div class="task-detail">
                      <span>联动设备</span>
                      <TaskDeviceSelector v-model:value="task.linkedDevices" />
                    </div>
                    <div class="task-detail">
                      <span>执行地点</span>
                      <TaskLocationPicker
                        :location-desc="task.locationDesc || ''"
                        :longitude="task.longitude"
                        :latitude="task.latitude"
                        @update="updateTaskLocation(task, $event)"
                      />
                    </div>
                    <div class="task-detail">
                      <span>备注</span>
                      <a-input v-model:value="task.remark" :maxlength="500" placeholder="请输入备注（选填）" />
                    </div>
                  </div>
                </div>
              </article>
            </section>
          </div>
        </a-spin>
        <div class="workflow-footer">
          <a-button @click="router.back()">取消</a-button><a-button type="primary" :loading="saving" @click="submit">确认启动</a-button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.workflow-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.workflow-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.full-width {
  width: 100%;
}
.workflow-section-title small {
  margin-left: 8px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 400;
}
.plan-task-list {
  display: grid;
  gap: 16px;
}
.plan-task-group {
  display: grid;
  gap: 10px;
}
.plan-task-group-title {
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}
.launch-task-card {
  border: 1px solid #dbe4ee;
  border-radius: 6px;
  overflow: hidden;
}
.launch-task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  background: #f8fafc;
}
.launch-task-header strong {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1f2937;
}
.task-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #1677ff;
  color: #fff;
  font-size: 12px;
}
.task-name {
  width: 240px;
  font-weight: 600;
}
.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 12px;
}
.task-executor {
  width: 180px;
}
.task-meta-field {
  display: grid;
  gap: 4px;
}
.task-meta-field > span {
  color: #64748b;
  font-size: 12px;
}
.task-duration-editor {
  display: flex;
  align-items: center;
  gap: 6px;
}
.launch-task-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.8fr);
  gap: 18px;
  padding: 14px;
}
.task-detail {
  min-width: 0;
}
.task-detail > span {
  color: #64748b;
  font-size: 12px;
}
.task-detail-grid {
  display: grid;
  gap: 10px;
}
@media (max-width: 900px) {
  .launch-task-header,
  .task-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
  .launch-task-body {
    grid-template-columns: 1fr;
  }
}
</style>
