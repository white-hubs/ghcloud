<template>
	<div class="ctr" ref="ctr">
		<a-modal
			v-model:visible.sync="visible"
			:title="title"
			:getContainer="()=>$refs.ctr"
			centered="centered"
			:forceRender="true"
			:width="800"
			@ok="save"
			@cancel="cancel"
		>
			<a-form ref="form" :model="model" layout="inline">
				<a-form-item label="区域">
					<Cascader
						v-model:value="model.areaId"
						:placeholder="'请选择区域'"
						:dataMethod="'getAreaListforBoothInfo'"
						:treeCheckable="false"
						style="width: 208px"
						:field="{ label: 'name', value: 'id' }"
					></Cascader>
				</a-form-item>
				<a-form-item label="">
					<a-input v-model:value="model.keyword" placeholder="名称"></a-input>
				</a-form-item>
				<a-form-item>
					<a-space :size="16">
						<a-button type="primary" @click="search">查询</a-button>
						<a-button type="default" @click="reset">重置</a-button>
					</a-space>
				</a-form-item>
			</a-form>
			<div class="pt1">
				<a-table
					:columns="columns"
					:dataSource="tableData"
					:pagination="pagination"
					:rowKey="rowKey"
					:loading="loading"
					:rowSelection="rowSelection"
					:customRow="customRow"
				></a-table>
			</div>
		</a-modal>
	</div>
</template>
<script>
import {
	computed,
	defineComponent,
	reactive,
	toRefs,
	unref,
	ref,
	onMounted,
	getCurrentInstance,
	watch
} from 'vue'
export default defineComponent({
	props: {
		methodName: String,
		referObjectId: String,
		referObjectCategory: String,
		modalVisible: Boolean,
		title: String,
		rowKey: {
			type: [String, Function],
			default: () => {
				return 'id'
			}
		},
		modalColumns: Array,
		modalType: [String],
		selectRow: [Array],
		selectType: {
			type: [String],
			defalut: () => {
				return 'checkbox'
			}
		},
		unChecked: {
			type: Array,
			default: () => {
				return []
			}
		},
		searchList: {
			type: Array,
			default: () => {
				return []
			}
		},
		inspectPointType: [String],
		selectedItem: [Array]
	},
	setup(props, { emit }) {
		const layout = {
			labelCol: {
				style: {
					width: '50px'
				}
			},
			wrapperCol: {
				style: {
					width: 'calc(100% - 50px)'
				}
			}
		}

		const ctr = ref()
		const { proxy } = getCurrentInstance()

		const state = reactive({
			model: {
				areaId: null,
				keyword: ''
			}
		})

		const visible = computed(() => {
			return props.modalVisible
		})

		const columns = computed(() => {
			return props.modalColumns
		})

		const tableState = reactive({
			tableData: null,
			pagination: {
				total: 0,
				pageNumber: 1,
				pageSize: 10,
				size: 'small'
			},
			loading: false,
			selectedKeys: props.selectRow,
			selectedItem: props.selectedItem ? props.selectedItem : []
		})

		const getData = async (obj) => {
			tableState.loading = true
			const params = { ...tableState.pagination, ...obj, ...state.model }
			const data = await proxy.$api[props.methodName]('get', params)
			if (data && data.records) {
				tableState.tableData = data.records
				tableState.pagination.total = data.total
			} else {
				tableState.tableData = data
			}
			tableState.loading = false
		}

		const rowSelection = computed(() => {
			return {
				type: props.selectType,
				selectedRowKeys: unref(tableState.selectedKeys),
				onChange: Selected,
				getCheckboxProps: (record) => {
					// 不关联本身
					if (props.unChecked.includes(record.id)) {
						Object.assign(record, { disabled: true })
						return {
							disabled: true
						}
					} else {
						Object.assign(record, { disabled: false })
					}
				}
			}
		})

		const Selected = async (record, selectedRows) => {
			if (!record.disabled) {
				// 全选和box框的点击--有selectedRows
				if (record instanceof Array) {
					tableState.selectedKeys = record
					// tableState.selectedItem = selectedRows;
					tableState.selectedItem = []

					if (selectedRows) {
						for (let i of selectedRows) {
							const data = {
								inspectObjectCategory: props.inspectPointType, //巡检点类型
								inspectObjectName: i.name ? i.name : i.sceneName, //巡检点名称
								inspectObjectTypeName: i.typeName ? i.typeName : i.sceneTypeName, //巡检点自身类型
								inspectObjectType: i.type ? i.type : i.sceneTypeId, //巡检点自身类型
								inspectObjectId: i.id, //巡检点id
								areaName: i.areaNames ? i.areaNames : i.areaName, //所属区域
								addrDetail: i.addrDetail ? i.addrDetail : i.location, //具体地址
								inspectStandardIds: [], //关联标准的id
								referObjects: [] //关联对象的合集
							}
							if (props.modalType === 'connect') {
								Object.assign(data, {
									referObjectId: props.referObjectId,
									referObjectCategory: props.referObjectCategory
								})
								delete data.referObjects
							}
							Object.assign(i, data)
							tableState.selectedItem.push(data)
						}
					}
					return
				}

				// 行点击--无selectedRows
				if (tableState.selectedKeys) {
					// 构造表格数据和传参数据
					const data = {
						inspectObjectCategory: props.inspectPointType, //巡检点类型
						inspectObjectName: record.name ? record.name : record.sceneName, //巡检点名称
						inspectObjectTypeName: record.typeName ? record.typeName : record.sceneTypeName, //巡检点自身类型
						inspectObjectType: record.type ? record.type : record.sceneTypeId, //巡检点自身类型
						inspectObjectId: record.id, //巡检点id
						areaName: record.areaNames ? record.areaNames : record.areaName, //所属区域
						addrDetail: record.addrDetail ? record.addrDetail : record.location, //具体地址
						inspectStandardIds: [], //关联标准的id
						referObjects: [] //关联对象的合集
					}
					// 关联数据--添加关联的表单表格数据
					if (props.modalType === 'connect') {
						Object.assign(data, {
							referObjectId: props.referObjectId,
							referObjectCategory: props.referObjectCategory
						})
						delete data.referObjects
					}
					// 当前点击的下标
					const index = tableState.selectedKeys.findIndex((item) => item === record.id)
					// 被选中--取消
					if (index !== -1) {
						// tableState.selectedKeys.splice(index, 1);
						tableState.selectedKeys = tableState.selectedKeys.filter((item) => item !== record.id)

						tableState.selectedItem = tableState.selectedItem.filter(
							(item) => item.inspectObjectId !== record.id
						)
					}
					// 没选中--选中
					else {
						tableState.selectedKeys.push(record.id)
						tableState.selectedItem.push(data)
					}
				} else {
					tableState.selectedKeys.push(record.id)
					tableState.selectedItem.push(data)
				}
			}
		}

		const customRow = (record) => {
			return {
				onClick: () => {
					Selected(record)
				}
			}
		}

		const cancel = () => {
			emit('close')
		}

		const search = () => {
			getData()
		}
		const reset = () => {
			state.model.keyword = ''
			state.model.areaId = null
			getData()
		}

		const save = () => {
			emit('saveItem', tableState.selectedItem, props.modalType)
		}

		onMounted(() => {
			getData()
		})

		watch(
			() => props.methodName,
			(newVal, OldVal) => {
				if (newVal !== OldVal) {
					getData()
				}
			}
		)

		return {
			ctr,
			...toRefs(tableState),
			...toRefs(state),
			rowSelection,
			customRow,
			visible,
			columns,
			layout,
			cancel,
			search,
			reset,
			save
		}
	}
})
</script>
<style lang="less" scoped>
:deep(.ant-select-selector) {
	width: 208px;
}
</style>
