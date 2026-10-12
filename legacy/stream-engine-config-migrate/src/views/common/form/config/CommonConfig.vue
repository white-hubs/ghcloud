<template>
	<el-form-item :label="value.paramsLabel ?? '关联参数'" v-if="value.hasOwnProperty('params')">
		<el-select v-model="value.params" placeholder="请选择" size="small" clearable>
			<el-option v-for="item in options" :key="item.id" :label="item.title" :value="item.id"> </el-option>
		</el-select>
	</el-form-item>
</template>

<script>
/*人员档案基础配置*/
export default {
	name: "ArchivesInput",
	components: {},
	props: {
		value: {
			type: Object,
			default: () => {
				return {};
			},
		},
	},
	created() {
		this.getData();
	},
	computed: {
		forms() {
			return this.$store.state.design.formItems;
		},
	},
	data() {
		return {
			options: [],
		};
	},
	methods: {
		getData() {
			this.options = this.$store.state.design.formItems;
		},
	},
};
</script>

<style scoped></style>
