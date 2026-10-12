<template>
  <WorkPermitAssociatedItems
    ref="associatedItemsRef"
    v-bind="forwardedProps"
    item-type="RISK_CHECK"
    @update:model-value="(value) => emit('update:modelValue', value)"
  />
</template>

<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";

import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { WorkPermitAssociatedItem } from "../../../service/work-permit/work-permit";
import WorkPermitAssociatedItems from "../work-permit-associated-items/work-permit-associated-items.vue";

const emit = defineEmits<{
  (event: "update:modelValue", value: WorkPermitAssociatedItem[]): void;
}>();
const props = withDefaults(
  defineProps<{
    modelValue?: WorkPermitAssociatedItem[] | null;
  }>(),
  {
    modelValue: null,
  },
);
const attrs = useAttrs();
const forwardedProps = computed(() => ({ ...attrs, ...props }));
const associatedItemsRef = ref<FormItemExpose | null>(null);

defineExpose<FormItemExpose>({
  validate: () => associatedItemsRef.value?.validate?.() ?? false,
});
</script>
