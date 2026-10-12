<template>
  <VanField v-if="props.readonly" :label="props.label" :required="props.required" :model-value="selected?.typeName" readonly />
  <template v-else>
    <VanField
      is-link
      readonly
      :label="props.label"
      :required="props.required"
      :model-value="selected?.typeName"
      :placeholder="props.placeholder || '请选择作业类型'"
      :error-message="errorMessage"
      @click="openPicker"
    />
    <VanPopup v-model:show="showPicker" position="right" duration="0.2">
      <div class="work-permit-pop">
        <VanNavBar title="选择作业类型" left-text="返回" @click-left="hidePicker" />
        <VanSearch v-model="searchValue" show-action placeholder="输入作业类型搜索" left-icon="">
          <template #action>
            <div @click.stop="reload">搜索</div>
          </template>
        </VanSearch>
        <div class="list">
          <VanList :loading="loading" :finished="true" finished-text="没有更多了">
            <VanCell v-for="item in options" :key="item.id" :title="item.typeName" @click="selectedCell = item">
              <template #right-icon>
                <VanCheckbox :model-value="selectedCell?.id === item.id" shape="round" />
              </template>
            </VanCell>
          </VanList>
        </div>
        <div class="btn-area">
          <span>{{ selectedCell?.typeName ? `已选择：${selectedCell.typeName}` : "" }}</span>
          <VanButton type="primary" size="small" @click="confirm">确定</VanButton>
        </div>
      </div>
    </VanPopup>
  </template>
</template>

<script setup lang="ts">
import { showNotify } from "vant";
import { computed, onMounted, ref, watch } from "vue";

import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { workPermitService, WorkPermitTypeName } from "../../../service/work-permit/work-permit";

const emits = defineEmits(["update:modelValue"]);
const props = defineProps<{
  modelValue?: WorkPermitTypeName | null;
  required?: boolean;
  readonly?: boolean;
  label?: string;
  placeholder?: string;
}>();

const showPicker = ref(false);
const searchValue = ref("");
const loading = ref(false);
const options = ref<WorkPermitTypeName[]>([]);
const selected = ref<WorkPermitTypeName | null>(null);
const selectedCell = ref<WorkPermitTypeName | null>(null);
const validInput = ref(true);

const errorMessage = computed(() => (!validInput.value && props.required ? `请选择${props.label}` : ""));

async function loadOptions() {
  loading.value = true;
  try {
    options.value = await workPermitService.getTypeNames({ typeName: searchValue.value || undefined });
  } finally {
    loading.value = false;
  }
}

function openPicker() {
  selectedCell.value = selected.value;
  showPicker.value = true;
  loadOptions();
}

function hidePicker() {
  showPicker.value = false;
}

function reload() {
  loadOptions();
}

function confirm() {
  if (!selectedCell.value?.id) {
    showNotify("请选择一项");
    return;
  }
  selected.value = selectedCell.value;
  emits("update:modelValue", { id: selected.value.id, typeName: selected.value.typeName });
  hidePicker();
}

watch(
  () => props.modelValue,
  (value) => {
    selected.value = value || null;
  },
  { immediate: true },
);

onMounted(loadOptions);

defineExpose<FormItemExpose>({
  validate: () => {
    const valid = !!selected.value?.id;
    validInput.value = valid;
    return valid;
  },
});
</script>

<style scoped lang="less">
.work-permit-pop {
  width: 100vw;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.list {
  flex: 1;
  overflow-y: auto;
}
.btn-area {
  min-height: 52px;
  padding: 8px 12px;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.btn-area span {
  color: #666;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
