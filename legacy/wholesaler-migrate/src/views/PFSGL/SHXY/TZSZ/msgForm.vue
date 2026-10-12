<template>
	<div>
		<a-form-model ref="form" :model="model" label-width="100px">
			<span class="title">{{ model.name }}</span>
			<a-form-model-item label="通知方式：">
				<a-checkbox-group v-model="model.channelParams" @change="change">
					<a-checkbox :value="`${item.terminal}&${item.value}&${item.terminalName}`" v-for="(item,i) in noticeMethod" :key="item.value+i">
						{{ item.label }}
					</a-checkbox>
				</a-checkbox-group>
			</a-form-model-item>
		</a-form-model>
	</div>
</template>
<script>
export default {
	data() {
		return {

		};
	},
		props: {
			model: {
				type: Object,
			},
			noticeMethod: {
				type: Array,
			},
		},
	methods: {
		change(e) {
			this.$emit("changeItem", e);
		},
		// itemChange(e, item) {
		// 	this.$emit("itemChange", e.target.checked, item);
		// },
	},
};
</script>
<style scoped lang="less">
.title {
	font-weight: 500;
	font-size: 16px;
}
</style>
