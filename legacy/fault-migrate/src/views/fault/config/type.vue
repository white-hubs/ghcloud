<template>
	<g-table
		:title="pageTitle"
		:columns="columns"
		:btns="btns"
		:search="search"
		:api="api"
		:modal="modal"
		tableCode="FAULT_TYPE"
		:rules="rules"
		:modalTitle="modalTitle"
		:scrollX="600"
	>
	</g-table>
</template>

<script lang="jsx">
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import { tuple } from 'ant-design-vue/lib/_util/type';
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
	setup() {
		const { pageTitle } = usePageName()
		const state = reactive({
			modalTitle: `类型`,
			// 表头
			columns: [
				{
					title:  `类型`,
					dataIndex: 'name',
					key: 'name'
				},
				{
					dataIndex: 'action',
					title: '操作',
					slots: {
						customRender: 'action'
					}
				}
			],
			// 接口
			api: {
				list: 'faultType',
				add: 'faultTypeAdd',
				edit: 'faultTypeId',
				detail: 'record',
				deleteSingle: 'faultTypeId'
			},
			// 操作按钮
			btns: ['add', 'edit', 'deleteSingle'],
			search: [
				{
					label: '',
					value: 'keyword',
					placeholder: '名称'
				}
			],
			// 对话框弹窗
			modal: [
				{
					label: '类型名称',
					value: 'name',
					placeholder: '请输入类型名称',
					maxlength: 20
				}
			],
			rules: {
				name: [{ required: true, message: '类型不能为空' }]
			}
		})

		return {
			...toRefs(state),
      pageTitle
		}
	}
})
</script>

<style></style>
