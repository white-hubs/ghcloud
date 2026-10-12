<template>
	<a-input v-model:value="value.name" :placeholder="placeholder" @change="emits('update:modelValue', value)" :rows="4" :disabled="true" />
</template>
<script setup lang="ts">
import { getFocusWorkCompleteTime } from "@/api/official"
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"
const props = withDefaults(
	defineProps<{
		modelValue?: { id: string; name: string } | null;
		placeholder?: string;
		readonly?: boolean;
	}>(),
	{
		modelValue: null,
		placeholder: "自动带入完成时间",
		readonly: false,
	}
);
const emits = defineEmits(["update:modelValue"]);
const route = useRoute();
const value = ref(props.modelValue ?? { id: "", name: "" });

onMounted(async () => {
	try {
		if (!props.modelValue) {
			//此处暂定在路由商获取督办事项ID
			const params = {
				id: (route.query?.businessKey as string) ?? "",
			};
			const res = await getFocusWorkCompleteTime(params);
			value.value = res;
			emits("update:modelValue", value.value);
		}
	} catch (error) {
	}
});
</script>
