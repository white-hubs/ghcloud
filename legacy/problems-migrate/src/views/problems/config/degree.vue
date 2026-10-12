<template>
	<g-table :title="pageTitle" :api="api" :columns="columns" :btns="btns" tableCode="PROBLEM_DEGREE" :modal="modal"
		:rules="rules" :scrollX="600">
	</g-table>
</template>
<script lang="jsx">
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs, ref } from 'vue'
import { timeFormat, millennial } from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common'
import { useRouter, useRoute } from 'vue-router'
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
	setup() {
		const { pageTitle } = usePageName()
		const router = useRouter()
		const state = reactive({
			api: {
				list: 'dangerDegree',
				deleteSingle: 'dangerDegreeId',
				edit: 'dangerDegreeId',
				detail: 'record',
				add: 'dangerDegreeAdd'
			},
			btns: ['add', 'edit', 'deleteSingle'],
			modal: [
				{
					label: '隐患程度',
					value: 'name',
					maxLength: 20,
					placeholder: '请输入隐患程度'
				}
			],
			rules: {
				name: [{ required: true, message: '请输入隐患程度' }]
			},
			columns: [
				{
					dataIndex: 'name',
					title: '隐患程度',
					slots: {
						customRender: 'name'
					},
					ellipsis: true,
					customRender: ({ text }) => {
						return (
							<PopOver content={text} position="topLeft">
								{text ? text : '--'}
							</PopOver>
						)
					}
				},
				{
					dataIndex: 'action',
					title: '操作',
					slots: {
						customRender: 'action'
					},
					fixed: 'right'
				}
			]
		})

		return {
			...toRefs(state),
			pageTitle
		}
	}
})
</script>
