<script setup lang="ts">
import { DeleteOutlined, HolderOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { getCurrentInstance, onMounted, ref, shallowRef, watch } from "vue";

import type { EmergencyPlanTaskDraft } from "@ghcloud/cube-services-client/emergency-plan-ai.client";

import { clonePlanTasks, createPlanTaskClientKey } from "./planTask";
import TaskExecutorSelect from "./TaskExecutorSelect.vue";
import TaskLocationPicker from "./TaskLocationPicker.vue";

type DepartmentNode = {
  id: string | number;
  name: string;
  children?: DepartmentNode[];
};

const props = defineProps<{
  modelValue: EmergencyPlanTaskDraft[];
  readonly?: boolean;
  singleTask?: boolean;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: EmergencyPlanTaskDraft[]): void;
}>();

const { proxy } = getCurrentInstance()!;
const departments = shallowRef<DepartmentNode[]>([]);
const departmentsLoading = shallowRef(false);
let departmentsLoaded = false;

const loadDepartments = async () => {
  if (departmentsLoaded || departmentsLoading.value) {
    return;
  }
  departmentsLoading.value = true;
  try {
    const result = await proxy.$api.getOrganizations();
    departments.value = Array.isArray(result) ? result : [];
    departmentsLoaded = true;
  } catch {
    message.error("部门列表加载失败，请重试");
  } finally {
    departmentsLoading.value = false;
  }
};

onMounted(() => {
  void loadDepartments();
});

const createPersonExecutor = () => ({ clientKey: createPlanTaskClientKey(), executorType: "PERSON" as const, executorId: "" });

const normalizeExecutorsToPeople = (taskList: EmergencyPlanTaskDraft[]) => {
  taskList.forEach((task) => {
    task.executors = task.executors.length
      ? task.executors.slice(0, 1).map((executor) => ({ ...executor, executorType: "PERSON" }))
      : [createPersonExecutor()];
  });
  return taskList;
};

const tasks = ref<EmergencyPlanTaskDraft[]>(normalizeExecutorsToPeople(clonePlanTasks(props.modelValue)));
let syncingFromProps = false;

watch(
  () => props.modelValue,
  (value) => {
    syncingFromProps = true;
    tasks.value = normalizeExecutorsToPeople(clonePlanTasks(value));
    queueMicrotask(() => {
      syncingFromProps = false;
    });
  },
  { deep: true },
);

watch(
  tasks,
  (value) => {
    if (!syncingFromProps) {
      emit("update:modelValue", clonePlanTasks(value));
    }
  },
  { deep: true },
);

const addTask = () => {
  tasks.value.push({
    clientKey: createPlanTaskClientKey(),
    name: "",
    sortNo: tasks.value.length + 1,
    durationMinutes: null,
    executionContents: [""],
    equipment: [],
    locationDesc: "",
    remark: "",
    sourceType: "MANUAL",
    sourceTemplateId: null,
    templateName: null,
    templateConfidence: null,
    templateReason: null,
    executors: [createPersonExecutor()],
  });
};

const draggingTaskIndex = shallowRef<number | null>(null);

const normalizeTaskSortNo = () => {
  tasks.value = tasks.value.map((task, index) => ({ ...task, sortNo: index + 1 }));
};

const dragStart = (event: DragEvent, index: number) => {
  draggingTaskIndex.value = index;
  event.dataTransfer?.setData("text/plain", String(index));
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
  }
};

const dragOver = (event: DragEvent, targetIndex: number) => {
  if (props.singleTask) {
    return;
  }
  event.preventDefault();
  const sourceIndex = draggingTaskIndex.value;
  if (sourceIndex === null || sourceIndex === targetIndex) {
    return;
  }
  const nextTasks = [...tasks.value];
  const [task] = nextTasks.splice(sourceIndex, 1);
  if (!task) {
    return;
  }
  nextTasks.splice(targetIndex, 0, task);
  tasks.value = nextTasks;
  draggingTaskIndex.value = targetIndex;
};

const dragEnd = () => {
  if (props.singleTask) {
    return;
  }
  draggingTaskIndex.value = null;
  normalizeTaskSortNo();
};

const removeTask = (index: number) => {
  tasks.value.splice(index, 1);
  normalizeTaskSortNo();
};

const updateTaskLocation = (task: EmergencyPlanTaskDraft, location: { locationDesc: string; longitude: number; latitude: number }) => {
  task.locationDesc = location.locationDesc;
  task.longitude = location.longitude;
  task.latitude = location.latitude;
};

const addStep = (task: EmergencyPlanTaskDraft) => task.executionContents.push("");
const removeStep = (task: EmergencyPlanTaskDraft, index: number) => task.executionContents.splice(index, 1);
const addEquipment = (task: EmergencyPlanTaskDraft) => task.equipment.push("");
const removeEquipment = (task: EmergencyPlanTaskDraft, index: number) => task.equipment.splice(index, 1);

const sourceText = (task: EmergencyPlanTaskDraft) =>
  task.sourceType === "TEMPLATE" ? `模板 · ${task.templateName || "已匹配"}` : task.sourceType === "MANUAL" ? "手动" : "AI生成";
const executorUserName = (task: EmergencyPlanTaskDraft) => {
  const executor = task.executors[0] as
    | (EmergencyPlanTaskDraft["executors"][number] & { user?: { id?: string | null; name?: string } })
    | undefined;
  return executor?.user?.name && String(executor.user.id) === String(executor.executorId) ? executor.user.name : "";
};
</script>

<template>
  <div class="plan-task-editor">
    <div v-if="!readonly && !singleTask" class="task-editor-toolbar">
      <span>拖动手柄可调整任务顺序</span>
      <a-button size="small" @click="addTask"><PlusOutlined />新增任务</a-button>
    </div>
    <a-empty v-if="!tasks.length" description="暂无结构化任务" />
    <section
      v-for="(task, taskIndex) in tasks"
      :key="task.clientKey"
      class="task-card"
      :class="{ 'task-card-dragging': draggingTaskIndex === taskIndex }"
      @dragover="dragOver($event, taskIndex)"
      @drop.prevent="dragEnd"
    >
      <header class="task-card-header">
        <div>
          <span
            v-if="!readonly && !singleTask"
            class="task-drag-handle"
            title="按住拖动排序"
            draggable="true"
            @dragstart="dragStart($event, taskIndex)"
            @dragend="dragEnd"
            ><HolderOutlined
          /></span>
          <strong>{{ singleTask ? "" : `${taskIndex + 1}. ` }}{{ task.name || "未命名任务" }}</strong>
          <a-tag>{{ sourceText(task) }}</a-tag>
        </div>
        <a-button v-if="!readonly && !singleTask" type="text" danger @click="removeTask(taskIndex)"><DeleteOutlined /></a-button>
      </header>

      <div class="task-form-grid">
        <label class="task-field task-field-wide">
          <span>任务名称</span>
          <a-input v-model:value="task.name" :maxlength="100" :disabled="readonly" placeholder="请输入任务名称" />
        </label>
        <label class="task-field">
          <span>预计耗时（分钟）</span>
          <a-input-number v-model:value="task.durationMinutes" :min="0" :disabled="readonly" class="full-width" />
        </label>
        <label class="task-field">
          <span>执行位置</span>
          <TaskLocationPicker
            :location-desc="task.locationDesc"
            :longitude="task.longitude"
            :latitude="task.latitude"
            :disabled="readonly"
            @update="updateTaskLocation(task, $event)"
          />
        </label>
      </div>

      <div class="task-section">
        <div class="task-section-title">
          <span>执行步骤</span>
          <a-button v-if="!readonly" size="small" type="link" @click="addStep(task)"><PlusOutlined />添加步骤</a-button>
        </div>
        <div v-for="(_step, stepIndex) in task.executionContents" :key="`${task.clientKey}-step-${stepIndex}`" class="task-line">
          <span class="line-index">{{ stepIndex + 1 }}</span>
          <a-input v-model:value="task.executionContents[stepIndex]" :disabled="readonly" placeholder="请输入执行步骤" />
          <a-button v-if="!readonly" type="text" danger @click="removeStep(task, stepIndex)"><DeleteOutlined /></a-button>
        </div>
      </div>

      <div class="task-section">
        <div class="task-section-title">
          <span>所需装备</span>
          <a-button v-if="!readonly" size="small" type="link" @click="addEquipment(task)"><PlusOutlined />添加装备</a-button>
        </div>
        <div
          v-for="(_equipment, equipmentIndex) in task.equipment"
          :key="`${task.clientKey}-equipment-${equipmentIndex}`"
          class="task-line"
        >
          <a-input v-model:value="task.equipment[equipmentIndex]" :disabled="readonly" placeholder="请输入装备名称" />
          <a-button v-if="!readonly" type="text" danger @click="removeEquipment(task, equipmentIndex)"><DeleteOutlined /></a-button>
        </div>
      </div>

      <div class="task-section">
        <div class="task-section-title">
          <span>执行人员</span>
        </div>
        <div class="executor-line">
          <TaskExecutorSelect
            v-model:value="task.executors[0].executorId"
            :user-name="executorUserName(task)"
            :departments="departments"
            :departments-loading="departmentsLoading"
            :disabled="readonly"
            class="executor-value"
            @open-departments="loadDepartments"
          />
        </div>
      </div>

      <label class="task-field task-remark">
        <span>备注</span>
        <a-textarea v-model:value="task.remark" :maxlength="500" :rows="2" :disabled="readonly" placeholder="请输入任务备注" />
      </label>
      <a-alert v-if="task.templateReason" :message="`模板匹配依据：${task.templateReason}`" type="info" show-icon />
    </section>
  </div>
</template>

<style lang="less" scoped>
.plan-task-editor {
  display: grid;
  gap: 14px;
}

.task-editor-toolbar,
.task-card-header,
.task-section-title,
.task-line,
.executor-line {
  display: flex;
  align-items: center;
}

.task-editor-toolbar,
.task-card-header,
.task-section-title {
  justify-content: space-between;
}

.task-editor-toolbar {
  color: #6b7280;
}

.task-card {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.task-card-dragging {
  border-color: #91caff;
  background: #f0f7ff;
}

.task-card-header {
  margin-bottom: 14px;
}

.task-card-header strong {
  margin-right: 10px;
}

.task-drag-handle {
  display: inline-flex;
  align-items: center;
  margin-right: 6px;
  color: #94a3b8;
  cursor: grab;
}

.task-drag-handle:active {
  cursor: grabbing;
}

.task-form-grid {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 12px;
}

.task-field {
  display: grid;
  gap: 6px;
  color: #374151;
  font-size: 12px;
}

.task-field-wide,
.task-remark {
  grid-column: 1 / -1;
}

.task-section {
  margin-top: 14px;
}

.task-section-title {
  min-height: 30px;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
}

.task-line,
.executor-line {
  gap: 8px;
  margin-top: 8px;
}

.line-index {
  flex: none;
  width: 22px;
  color: #6b7280;
  text-align: center;
}

.executor-value {
  flex: 1;
  width: auto !important;
}

.full-width {
  width: 100%;
}

.task-remark {
  margin: 14px 0;
}
</style>
