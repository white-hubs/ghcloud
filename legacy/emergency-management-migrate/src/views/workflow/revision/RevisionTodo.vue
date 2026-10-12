<script setup lang="ts">
import { computed, onActivated, onMounted, ref, shallowRef } from "vue";
import { useRouter } from "vue-router";

import type {
  RevisionStartResult,
  RevisionTodoGroupData,
  RevisionTodoItem,
  RevisionTodoResponse,
  RevisionTodoType,
} from "./revision-todo-types";
import RevisionTodoGroup from "./RevisionTodoGroup.vue";
import { emergencyFileRevisionTodo, startEmergencyFileRevision } from "@/api/emergency";

import "../workflow.css";

const router = useRouter();
const loading = shallowRef(false);
const startingId = shallowRef<string>();
const revisionTypes: RevisionTodoType[] = ["FORCED", "REJECTED", "SUGGESTED", "PERIODIC"];
const typeLabel: Record<RevisionTodoType, string> = {
  FORCED: "强制修订",
  REJECTED: "驳回待修订",
  SUGGESTED: "建议修订",
  PERIODIC: "定期修订",
};
const normalizeGroups = (source: RevisionTodoGroupData[]): RevisionTodoGroupData[] =>
  revisionTypes.map((revisionType) => source.find((group) => group.revisionType === revisionType) || { revisionType, count: 0, items: [] });
const groups = shallowRef<RevisionTodoGroupData[]>(normalizeGroups([]));
const statistics = computed(() =>
  groups.value.map((group) => ({
    type: group.revisionType,
    count: group.count,
    label: typeLabel[group.revisionType],
  })),
);

const load = async (): Promise<void> => {
  loading.value = true;
  try {
    const data = (await emergencyFileRevisionTodo()) as RevisionTodoResponse;
    groups.value = normalizeGroups(data.groups);
  } finally {
    loading.value = false;
  }
};

const startRevision = async (item: RevisionTodoItem): Promise<void> => {
  startingId.value = item.id;
  try {
    const result = (await startEmergencyFileRevision(item.id)) as RevisionStartResult;
    await router.push({
      path: "/planGenerate",
      query: {
        type: "edit",
        id: result.emergencyFileId,
        revisionId: result.revisionId,
        baseVersionText: result.baseVersionText,
        lockToken: result.lockToken,
      },
    });
  } catch {
    // 请求错误由全局响应拦截器统一提示。
  } finally {
    startingId.value = undefined;
  }
};

const revisionActivatedOnce = ref(false);
onMounted(load);
onActivated(() => {
  // keepAlive 缓存下从审批详情跳回时刷新待办，避免驳回记录不显示
  if (revisionActivatedOnce.value) {
    load();
  }
  revisionActivatedOnce.value = true;
});
</script>

<template>
  <div class="workflow-page revision-page">
    <main class="revision-content">
      <header class="revision-header">
        <span>预案编制 / 修订待办</span>
        <h1>修订待办工作台</h1>
      </header>
      <a-spin :spinning="loading">
        <section class="revision-statistics">
          <article v-for="item in statistics" :key="item.type" :class="`revision-stat revision-stat--${item.type.toLowerCase()}`">
            <strong>{{ item.count }}</strong
            ><span><i />{{ item.label }}</span>
          </article>
        </section>
        <div class="revision-groups">
          <RevisionTodoGroup
            v-for="group in groups"
            :key="group.revisionType"
            :group="group"
            :starting-id="startingId"
            @start="startRevision"
          />
        </div>
      </a-spin>
    </main>
  </div>
</template>

<style scoped>
.revision-page {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.revision-content {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
}
.revision-header {
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.05);
}
.revision-header span {
  color: #94a3b8;
  font-size: 12px;
}
.revision-header h1 {
  margin: 2px 0 0;
  color: #1f2937;
  font-size: 20px;
  line-height: 28px;
}
.revision-statistics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}
.revision-stat {
  display: flex;
  height: 80px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  background: #fff;
  border: 1px solid #edf0f3;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
}
.revision-stat strong {
  color: var(--tone);
  font-size: 24px;
  line-height: 28px;
}
.revision-stat span {
  display: flex;
  align-items: center;
  color: #64748b;
  font-size: 13px;
}
.revision-stat i {
  width: 14px;
  height: 14px;
  margin-right: 5px;
  border-radius: 50%;
  background: var(--tone);
}
.revision-stat--forced {
  --tone: #ff4d4f;
  border-color: #ffb3b3;
}
.revision-stat--rejected {
  --tone: #a640d4;
}
.revision-stat--suggested {
  --tone: #fa8c16;
}
.revision-stat--periodic {
  --tone: #3578e5;
}
.revision-groups {
  display: grid;
  gap: 12px;
  margin-top: 12px;
  padding-bottom: 4px;
}
@media (max-width: 900px) {
  .revision-statistics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 520px) {
  .revision-content {
    padding: 8px;
  }
  .revision-statistics {
    grid-template-columns: 1fr;
  }
}
</style>
