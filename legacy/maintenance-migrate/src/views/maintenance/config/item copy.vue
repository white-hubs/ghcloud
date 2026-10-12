<template>
	<g-table
		ref="tableRef"
		title="维保项"
		:api="api"
		:btns="[]"
		:search="search"
		:editMode="'page'"
		:columns="columns"
		:beforeGet="beforeGet"
		:rowSelection="true"
		:scrollX="600"
	>
		<template v-slot:btn="{ record }">
			<a-button type="link" @click="subProb(record)">配置 </a-button>
		</template>
	</g-table>
	<!--  @ok="save" @cancel="cancel" -->
	<a-modal v-model:visible="visible" centered title="维保内容">
		<a-form ref="modalForm" :model="model" :rules="rules">
			<a-form-item label="设备类型" name="equipType">
				<span>{{ model.equipName }}</span>
			</a-form-item>
			<a-form-item label="维保内容">
				<a-button type="primary" @click="contentAdd">添加</a-button>
			</a-form-item>
			<a-form-item>
				<div class="itemCtr">
					<div
						v-for="(item, index) in model.maintenanceCont"
						:key="index"
						class="flex-start maintenItem"
					>
						<div class="inputCtr">
							<label>维保内容：</label>
							<a-input
								v-model:value="item.name"
								:style="{ maxWidth: '180px', marginRight: '12px' }"
								:maxLength="20"
							></a-input>
						</div>
						<div class="iconCtr">
							<DeleteOutlined @click="deleteCont(item.name)" style="color: red" />
						</div>
					</div>
				</div>
			</a-form-item>
		</a-form>
	</a-modal>
</template>
<script lang="jsx">
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs, ref } from 'vue'
import { timeFormat, millennial } from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common'
import { useRouter, useRoute } from 'vue-router'
import { DeleteOutlined } from '@ant-design/icons-vue'
import _ from 'lodash'
export default defineComponent({
	components: {
		DeleteOutlined
	},
	setup() {
		const state = reactive({
			api: {
				list: 'inspectPlandangerDegree',
				deleteSingle: 'delete',
				path: '/problemsDetails'
			},
			search: [{ label: '', value: 'keyword', placeholder: '名称' }],
			columns: [
				{
					dataIndex: 'receiveNames',
					title: '序号',
					slots: {
						customRender: 'receiveNames'
					},
					ellipsis: true,
					customRender: ({ text }) => {
						return (
							<PopOver position="topLeft" content={text ? text : ''}>
								{text ? text : '--'}
							</PopOver>
						)
					}
				},
				{
					dataIndex: 'pointNum',
					title: '设备类型',
					slots: {
						customRender: 'pointNum'
					},
					ellipsis: true,
					customRender: ({ text }) => {
						return (
							<PopOver
								position="topLeft"
								content={text || text === 0 ? millennial(text, false) : ''}
							>
								{text || text === 0 ? millennial(text, false) : '--'}
							</PopOver>
						)
					}
				},
				{
					dataIndex: 'startTime',
					title: '维保项',
					slots: {
						customRender: 'startTime'
					},
					ellipsis: true,
					customRender: ({ text }) => {
						return (
							<PopOver position="topLeft" content={text ? timeFormat(text, true) : ''}>
								{text ? timeFormat(text, true) : '--'}
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
					fixed: 'right',
					width: 60
				}
			],
			visible: false,
			model: {
				equipName: '名称',
				maintenanceCont: [{ name: 1 }, { name: 2 }, { name: 3 }]
			}
			// rules: {}
		})

		const subProb = (item) => {
			state.visible = true
		}

		const contentAdd = () => {
			const a = _.cloneDeep(state.model.maintenanceCont)
			const num = a.length
				? _.cloneDeep(
						a.sort((a, b) => {
							return b.name - a.name
						})[0].name
				  )
				: 0
			state.model.maintenanceCont.push({ name: num + 1 })
		}

		const deleteCont = (key) => {
			state.model.maintenanceCont = state.model.maintenanceCont.filter((item) => item.name != key)
		}

		const save = () => {
		}

		const cancel = () => {
			state.visible = false
		}

		return {
			...toRefs(state),
			contentAdd,
			deleteCont,
			subProb,
			cancel,
			save
		}
	}
})
</script>
<style lang="less" scoped>
.itemCtr {
	max-height: 200px;
	overflow-y: auto;
	padding: 12px;
	.maintenItem {
		width: 100%;

		&:not(:first-child) {
			border: 1px solid #f5f5f6;
			border-top: none;
		}
		&:first-child {
			border: 1px solid #f5f5f6;
		}
		.inputCtr {
			width: 90%;
			height: 100%;
			padding: 12px;
			border-right: 1px solid #f5f5f6;
		}
		.iconCtr {
			width: 57px;
			height: 100%;
			text-align: center;
		}
	}
}
</style>
