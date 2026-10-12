<template>
	<TextInput v-model="work.name" :readonly="true" :label="props.label" placeholder="系统自动带入完成时间" />
</template>
<script setup lang="ts">
import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { officialService } from "../../../service/official/official";
import { onMounted, ref } from "vue";
import TextInput from "../../../component/basic/input/text-input.vue";
import { useRoute } from "vue-router";
const props = defineProps<{
	required?: boolean;
	readonly?: boolean;
	label?: string;
	modelValue?: { id: string; name: string };
  placeholder:string
}>();

const work = ref(props.modelValue ?? { id: "", name: "" });
const emits = defineEmits(["update:modelValue"]);
const route = useRoute();

onMounted(async () => {
	if (!props.modelValue) {
		const params = {
			id: (route.query?.businessKey as string) ?? "",
		};
		const res = await officialService.getFocusWorkCompleteTime(params);
		work.value = res;
		emits("update:modelValue", res);
	}
});

defineExpose<FormItemExpose>({
	validate: () => !!work.value,
});
</script>
