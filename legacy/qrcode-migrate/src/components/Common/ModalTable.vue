<template>
	<a-modal
		v-model:visible="visible"
		:title="title"
		centered="centered"
		@ok="save"
		@cancel="cancel"
		:width="width"
		:getContainer="(triggerNode) => triggerNode.parent"
	>
		<div class="pb2" v-if="searchLength > 0">
			<a-form ref="formRef" :model="form" layout="inline">
				<template v-for="item in search" :key="item.value">
					<a-form-item :label="item.label" :name="item.value">
						<component
							:is="item.component ? item.component : 'a-input'"
							v-model:value="form[item.value]"
							:placeholder="item.placeholder"
							:url="item.url ? item.url : ''"
							:params="item.params ? item.params : {}"
							:options="item?.options ? item.options : null"
							:field="item?.field ? item.field : null"
							@pressEnter="searchForm"
							style="width: 180px"
						></component>
					</a-form-item>
				</template>
				<a-form-item>
					<a-space :size="16">
						<a-button type="primary" @click="searchForm">查询</a-button>
						<a-button type="default" v-if="searchLength > 1">重置</a-button>
					</a-space>
				</a-form-item>
			</a-form>
		</div>
		<a-table
			:loading="loading"
			:columns="columns"
			:dataSource="dataSource"
			:rowKey="rowKey"
			:pagination="false"
			:rowSelection="rowSelection ? selection : null"
			size="small"
		></a-table>
		<div class="pt2 pagi" v-if="pagination &amp;&amp; page.total > 0">
			<a-pagination
				v-model:current="page.pageNumber"
				v-model:pageSize="page.pageSize"
				:total="page.total"
				:default-current="1"
				:show-total="() => `共 ${page.total} 条数据`"
				@change="onShowSizeChange"
				size="small"
			></a-pagination>
		</div>
	</a-modal>
</template>

<script>
import {
	getCurrentInstance,
	defineComponent,
	createVNode,
	onMounted,
	reactive,
	computed,
	toRefs,
	watch,
	ref,
	unref
} from 'vue'

import { useRouter } from 'vue-router'
import _ from 'lodash'
export default defineComponent({
	props: {
		title: {
			type: String,
			default: '列表名称'
		},
		rowKey: {
			type: String,
			default: 'id'
		},
		url: String,
		columns: Array,
		rowSelection: { type: Boolean, default: true },
		search: { type: Array, default: () => [] },
		disabledKeys: { type: Array },
		searchLength: {
			type: Number,
			default: 0
		},
		width: [String, Number],
		params: {
			type: Object,
			default: () => {
				return {}
			}
		},
		selectType: {
			type: String,
			default: 'radio'
		},
		value: {
			type: Boolean,
			default: false
		},
		pagination: {
			type: Boolean,
			default: true
		},
		selectedKeys: {
			type: Array,
			default: () => []
		},
		selectedRows: {
			type: Array,
			default: () => []
		}
	},
	setup(props, { emit }) {
		const route = useRouter()
		const formRef = ref()
		const visible = ref(false)
		const { proxy } = getCurrentInstance()
		const alreadySelected = ref(props.selectedKeys || [])
		const state = reactive({
			dataSource: [],
			form: {},
			page: {
				pageSize: 10,
				pageNumber: 1,
				total: 0
			},
			loading: false,
			selectedItem: [],
			disabledList: []
		})

		const setSearch = () => {
			props.search.forEach((item) => {
				if (!item?.component || item?.component !== 'span') {
					Object.assign(state.form, {
						[item.value]: item.defaultValue || item.defaultValue === false ? item.defaultValue : ''
					})
				}
			})
		}

		const getData = () => {
			if (props.url) {
				state.loading = true
				const params = {
					...props.params,
					...state.form,
					pageNumber: state.page.pageNumber,
					pageSize: state.page.pageSize
				}
				proxy.$api[props.url](params, 'get')
					.then((res) => {
						if (res && res.records) {
							state.page.total = res.total
							state.dataSource = res.records
						} else {
							state.dataSource = res
						}
					})
					.finally(() => {
						state.loading = false
					})
			}
		}

		const searchForm = () => {
			state.page.pageNumber = 1
			getData()
		}

		const onShowSizeChange = (current, pageSize) => {
			state.page.pageNumber = current
			state.page.pageSize = pageSize
			getData()
		}

		const changeSelected = (selectedRowKeys, selectedRow) => {
			alreadySelected.value = selectedRowKeys //当前选中的表格keys
			state.selectedItem = selectedRow //当前选中的表格项
		}

		const onSelectAll = (selected, selectedRows, changeRows) => {
			if (selected) {
				state.selectedItem = state.selectedItem.concat(changeRows)
				alreadySelected.value = state.selectedItem.map((item) => item[props.rowKey])
			} else {
				const changeKeys = changeRows.map((item) => item[props.rowKey])
				alreadySelected.value = _.difference(alreadySelected.value, changeKeys)
				state.selectedItem = _.differenceWith(state.selectedItem, changeRows, _.isEqual)
			}
		}

		const onSelect = (record, selected) => {
			if (props.selectType === 'checkbox') {
				if (selected) {
					alreadySelected.value.push(record[props.rowKey])
					state.selectedItem.push(record)
				} else {
					alreadySelected.value = alreadySelected.value.filter(
						(item) => item !== record[props.rowKey]
					)
					state.selectedItem = state.selectedItem.filter(
						(item) => item[props.rowKey] !== record[props.rowKey]
					)
				}
			} else {
				state.selectedItem = [record]
				alreadySelected.value = [record[props.rowKey]]
			}
		}

		const selection = computed(() => {
			return {
				type: props.selectType,
				selectedRowKeys: unref(alreadySelected),
				// onChange: changeSelected,
				// 解决翻页数据丢失
				onSelectAll: onSelectAll,
				onSelect: onSelect,
				getCheckboxProps: (record) => ({
					disabled: state.disabledList?.length
						? state.disabledList?.includes(record[props.rowKey])
						: false
				})
				// getCheckboxProps: (record) => {
				//   if (state.disabledList?.length) {
				//     if (state.disabledList.includes(record[props.rowKey])) {
				//       Object.assign(record, { disabled: true });
				//     }
				//     return {
				//       disabled: state.disabledList.includes(
				//         record[props.rowKey] ? true : false
				//       ),
				//     };
				//   }
				//   return {
				//     disabled: state.disabledList.includes(
				//       record[props.rowKey] ? true : false
				//     ),
				//   };
				// },
			}
		})

		const save = () => {
			emit('modal-save', alreadySelected.value, state.selectedItem)
			cancel()
		}

		const cancel = async () => {
			alreadySelected.value = []
			state.selectedItem = []
			state.page = { pageSize: 10, pageNumber: 1, total: 0 }
			// 筛选条件清空
			if (formRef?.value) {
				await formRef?.value.resetFields()
			}
			emit('update:value', false)
		}

		onMounted(() => {
			getData()
			setSearch()
		})

		watch(
			() => props.value,
			(n) => {
				visible.value = props.value
				if (n) {
					alreadySelected.value = _.cloneDeep(props.selectedKeys)
					state.selectedItem = _.cloneDeep(props.selectedRows)
					state.page = { pageSize: 10, pageNumber: 1, total: 0 }
					getData()
				}
			}
		)
		watch(
			() => props.disabledKeys,
			(n) => {
				state.disabledList = n
			}
		)

		return {
			formRef,
			visible,
			selection,
			...toRefs(state),
			onShowSizeChange,
			searchForm,
			getData,
			cancel,
			save
		}
	}
})
</script>

<style lang="less" scoped>
.pagi {
	text-align: right;
}
.ant-input {
	width: 180px;
}
.ant-input-select {
	width: 180px;
}
</style>
