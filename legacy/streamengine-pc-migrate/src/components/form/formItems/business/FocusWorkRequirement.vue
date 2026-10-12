<template>
	<a-textarea v-model:value="value.name" :placeholder="placeholder" @change="emits('update:modelValue', value)" :rows="4" :disabled="true" />
</template>
<script setup lang="ts">
import { getFocusWorkRequirement } from "@/api/official"
import { onMounted, ref, watch } from "vue"
const props = withDefaults(
	defineProps<{
		modelValue?: { id: string; name: string } | null;
		placeholder?: string;
		readonly?: boolean;
		params: string;
		formData: any;
	}>(),
	{
		modelValue: null,
		placeholder: "自动带入工作要求",
		readonly: false,
	}
);
const emits = defineEmits(["update:modelValue"]);
const value = ref(props.modelValue ?? { id: "", name: "" });
watch(
	() => props.formData[props.params],
	() => {
		getData();
	}
);

const getData = async () => {
	try {
		//此处暂定在路由商获取督办事项ID
		const params = {
			id: props.formData[props.params].id ?? "",
		};
		const res = await getFocusWorkRequirement(params);
		value.value = res;
		emits("update:modelValue", value.value);
	} catch (error) {
	}
};

// onMounted(()=>{
//   if(props.formData[props.params]){
//     getData()
//   }
// })
</script>
