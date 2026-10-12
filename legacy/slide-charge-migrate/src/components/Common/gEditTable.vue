<template>
	<g-layout class="edit-table" :title="title">
		<template #header-btn>
			<a-button type="primary" @click="addRecord('')" v-if="btns.indexOf('add') > -1"
				>新增</a-button>
		</template>
		<template #content-search>
			<a-form layout="inline" :model="form">
				<template v-for="item in search" :key="item.value">
					<a-form-item :label="item.label" >
						<component
							v-model:value="form[item.value]"
							:is="item.component ? item.component : 'a-input'"
							:placeholder="item.placeholder ? item.placeholder : '请输入'"
							:options="item.options ? item.options : []"
							:field="item.field ? item.field : null"
							allowClear
						/>
					</a-form-item>
				</template>
				<a-form-item>
					<a-button type="primary" @click="searchRecord">查询</a-button>
				</a-form-item>
				<a-form-item>
					<a-button @click="reset" v-if="search.length > 1">重置</a-button>
				</a-form-item>
			</a-form>
		</template>
		<template #content-table>
			<a-table
				:columns="columns"
				:data-source="dataSource"
				:pagination="false"
				:rowKey="rowKey"
				:expandedRowKeys="expandedRowKeys"
				:scroll="{ y: scrollY }"
				@expand="iconExpand"
			>
				<template #expandIcon="props">
					<IconFont
						v-if="props.record.children && props.record.children.length > 0"
						:type="
							expandedRowKeys.includes(props.record[rowKey]) ? 'icon-xiangxia' : 'icon-xiangyou'
						"
						@click="iconExpand(!props.expanded, props.record)"
					/>
				</template>
				<template #name="{ text, record }">
					<div>
						<a-input
							v-if="editableData[record[rowKey]]"
							v-model:value="editableData[record[rowKey]]['name']"
							style="margin: -5px 0"
							placeholder="请输入"
						></a-input>
						<template v-else>
							<div class="rowText">{{ text }}</div>
						</template>
					</div>
				</template>
				<template #enabled="{ record }">
					<a-switch
						v-model:checked="record.enabled"
						key="disabled"
						@change="changeStatus(record)"
						checked-children="启用"
						un-checked-children="禁用"
					/>
				</template>
				<template #action="{ record }">
					<div class="editable-row-operations">
						<span v-if="editableData[record[rowKey]]">
							<a-space :size="16">
								<a @click.stop="saveRecord(record)">保存</a>
								<a-popconfirm
									title="是否取消修改"
									cancelText="取消"
									okText="确定"
									@confirm.stop="cancelRecord(record)"
								>
									<a @click.stop="">取消</a>
								</a-popconfirm>
							</a-space>
						</span>
						<span v-else>
							<a-space :size="16">
								<a
									@click.stop="addRecord(record)"
									v-if="record.level === 1 && btns.indexOf('addChild') > -1"
									>新增下级</a
								>
								<a @click.stop="editRecord(record)" v-if="btns.indexOf('edit') > -1">编辑</a>
								<a-popconfirm
									title="是否删除当前选中？"
									cancelText="取消"
									okText="确定"
									@confirm.stop="DeleteRecord(record)"
								>
									<a class="deleteRow" @click.stop="" v-if="btns.indexOf('delete') > -1">删除</a>
								</a-popconfirm>
							</a-space>
						</span>
					</div>
				</template>
				<template #footer-page>
					<a-pagination
						show-size-changer
						v-if="page.total > 0"
						v-model:pageSize="page.pageSize"
						v-model:current="page.pageNumber"
						:total="page.total"
						:default-current="1"
						@change="onShowSizeChange"
						@showSizeChange="onShowSizeChange"
					></a-pagination>
				</template>
			</a-table>
		</template>
	</g-layout>
</template>
<script lang='jsx'>
import { cloneDeep } from 'lodash-es'
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, ref } from 'vue'

export default defineComponent({
	name: 'gEditTable',
	props: {
		title: {
			type: String,
			default: '列表名称'
		},
		/*表格key*/
		rowKey: {
			type: String,
			default: 'id'
		},
		api: {
			type: Object,
			default: () => {
				return {
					list: 'getChargeProjects',
					delete: 'deleteChargeProject',
					add: 'postChargeProject',
					edit: 'putChargeProject',
					detail: null,
					path: null //详情页面路由
				}
			}
		},
		columns: {
			type: Array,
			default: () => {
				return [
					{
						dataIndex: 'name',
						key: 'name',
						title: '收费项目名称',
						slots: {
							customRender: 'name'
						}
						// width: 650,
					},
					{
						dataIndex: 'enabled',
						key: 'enabled',
						title: '启用状态',
						slots: {
							customRender: 'enabled'
						}
					},
					{
						title: '操作',
						dataIndex: 'action',
						key: 'action',
						slots: {
							customRender: 'action'
						},
						width: 400,
						fixed: 'right'
					}
				]
			}
		},
		/*搜索表单{label:'表单名称',value:'参数',component:'组件',placeholder:'文字提示'}*/
		search: {
			type: Array,
			default: () => {
				return []
			}
		},
		btns: {
			type: Array,
			default: () => {
				return ['add', 'delete', 'edit', 'addChild']
			}
		}
	},
	setup(props) {
		const { proxy } = getCurrentInstance()
		const editableData = reactive({})
		const state = reactive({
			dataSource: [],
			form: {},
			scrollY: 500,
			expandedRowKeys: [],
			selectedRowKeys: [],
			modalVisible: false,
			moreSearch: false,
			operation: 'add',
			modalName: '新增',
			page: {
				pageSize: 10,
				pageNumber: 1,
				total: 0
			}
		})

		/*搜索表单*/
		const resetSearch = () => {
			props.search.forEach((item) => {
				state.form[item.value] = item.defaultValue ? item.defaultValue : null
			})
		}

		/*获取table高度*/
		const getScrollY = () => {
			const layoutContentHeight = document.getElementsByClassName('layout-content')[0]
			const contentSearchHeight = document.getElementsByClassName('content-search')[0]
			state.scrollY = layoutContentHeight.offsetHeight - contentSearchHeight.offsetHeight - 50
		}

		//获取列表数据
		const getData = () => {
			if (props.api.list) {
				state.loading = true
				const params = {
					...state.form,
					pageNumber: state.page.pageNumber,
					pageSize: state.page.pageSize
				}
				proxy.$api[props.api.list](params,'get').then((res) => {
					state.dataSource = res.records ? res.records : res
					state.page.total = res.total ? res.total : 0
					state.loading = false
				})
			}
		}

		onMounted(() => {
			resetSearch()

			getData()

			getScrollY()
			window.onresize = () => {
				getScrollY()
			}
		})

		/*点击查询*/
		const searchRecord = () => {
			state.page.pageNumber = 1
			getData()
		}

		/*点击重置*/
		const reset = () => {
			resetSearch()
			getData()
		}

		const iconDerection = (record) => {
			if (state.expandedRowKeys.includes(record[props.rowKey])) {
				return 'icon-xiangxia'
			} else {
				return 'iocon-xiangyou'
			}
		}

		//新增数据
		const addRecord = (record) => {
			if (record) {
				iconExpand(true, record)
				state.dataSource.forEach((item) => {
					if (item[props.rowKey] === record[props.rowKey]) {
						let add = {
							name: '',
							enabled: true,
							parentId: record[props.rowKey],
							children: []
						}
						add[props.rowKey] = 'add' + Math.random()
						item.children.push(add)
						editableData[add[props.rowKey]] = cloneDeep(add)
					}
				})
			} else {
				let add = {
					name: '',
					enabled: true,
					parentId: '',
					children: []
				}
				add[props.rowKey] = 'add' + Math.random()
				state.dataSource.push(add)
				editableData[add[props.rowKey]] = cloneDeep(add)
			}
		}
		//点击编辑
		const editRecord = (record) => {
			editableData[record[props.rowKey]] = cloneDeep(record)
		}
		//删除
		const DeleteRecord = (record) => {
			if (props.api.delete) {
				proxy.$api[props.api.delete](record,'delete').then(() => {
					getData()
					proxy.$message.success('操作成功')
				})
			}
		}
		//保存编辑
		const saveRecord = (record) => {
			editableData[record[props.rowKey]].enabled = record.enabled
			state.dataSource.forEach((item) => {
				if (item.children && item.children.length > 0) {
					item.children.forEach((c) => {
						if (record[props.rowKey] === c[props.rowKey]) {
							c = Object.assign(c, editableData[record[props.rowKey]])
						}
					})
				}
			})
			if (!editableData[record[props.rowKey]].name) {
				proxy.$message.warn('请输入')
				return
			}
			if (record[props.rowKey].indexOf('add') > -1) {
				if (props.api.add) {
					proxy.$api[props.api.add]({
						name: editableData[record[props.rowKey]].name,
						parentId: editableData[record[props.rowKey]].parentId,
						enabled: editableData[record[props.rowKey]].enabled
					},'post').then(() => {
						delete editableData[record[props.rowKey]]
						proxy.$message.success('操作成功')
						getData()
					})
				}
			} else {
				if (props.api.edit) {
					proxy.$api[props.api.edit]({
						...editableData[record[props.rowKey]],
						enabled: record.enabled
					},'put').then(() => {
						delete editableData[record[props.rowKey]]
						proxy.$message.success('操作成功')
						getData()
					})
				}
			}
		}
		//取消编辑
		const cancelRecord = (record) => {
			if (record[props.rowKey].indexOf('add') > -1) {
				state.dataSource.forEach((item, index) => {
					if (record[props.rowKey] === item[props.rowKey]) {
						state.dataSource.splice(index, 1)
					} else if (item.children && item.children.length > 0) {
						item.children.forEach((c, ci) => {
							if (record[props.rowKey] === c[props.rowKey]) {
								item.children.splice(ci, 1)
							}
						})
					}
				})
			}
			delete editableData[record[props.rowKey]]
		}

		const iconExpand = (expanded, record) => {
			if (expanded) {
				state.expandedRowKeys.push(record[props.rowKey])
			} else {
				if (state.expandedRowKeys.length) {
					state.expandedRowKeys = state.expandedRowKeys.filter((item) => {
						return item !== record[props.rowKey]
					})
				}
			}
		}

		const changeStatus = (record) => {
			if (props.api.edit && record.id.indexOf('add') === -1) {
				proxy.$api[props.api.edit](record,'put').then(() => {
					proxy.$message.success('操作成功')
					getData()
				})
			}
		}

		/*翻页*/
		const onShowSizeChange = (current, pageSize) => {
			state.page.pageNumber = current
			state.page.pageSize = pageSize
			getData()
		}
		return {
			...toRefs(state),
			editableData,
			searchRecord,
			getScrollY,
			addRecord,
			editRecord,
			saveRecord,
			cancelRecord,
			DeleteRecord,
			reset,
			iconExpand,
			iconDerection,
			changeStatus,
			onShowSizeChange
		}
	}
})
</script>
<style lang="less" scoped>
.table-container {
	width: 100%;
	height: 100%;
	background: #ffffff;
	border-radius: 4px;
	padding: 0 8px;
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;

	> div {
		width: 100%;

		&.table-header {
			height: 53px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-bottom: 1px solid #f3f3f3;

			.ant-btn {
				margin-left: 14px;
			}
		}

		&.table-content {
			flex: 1;
			display: flex;
			flex-direction: column;
			flex-wrap: wrap;
			overflow: hidden;

			> div {
				width: 100%;

				&.content-search {
					padding-top: 16px;
					position: relative;

					.more-search {
						position: absolute;
						right: 0;
						top: 50%;
						transform: translate(0, -50%);
					}

					.ant-form-item {
						margin-bottom: 16px;
						&:last-child{
							margin-right: 96px !important;
						}
					}
				}

				&.content-table {
					flex: 1;

					.ant-table-content {
						border-bottom: none !important;
					}
				}
			}
		}

		&.table-footer {
			height: 71px;
			border-top: 1px solid #f3f3f3;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.footer-btn {
				.ant-btn {
					margin-left: 14px;
				}
			}
		}
	}
}
</style>
<style lang="less">
.edit-table {
	.table-footer {
		.footer-btn {
			.ant-btn {
				margin-left: 14px;
			}
		}
	}

	.content-table {
		.ant-table-content {
			border-bottom: none !important;
		}
		.ant-table-tbody {
			tr.ant-table-row {
				> td:first-child {
					flex: 1;
					display: flex;
					justify-content: flex-start;
					align-items: center;
				}
			}
		}
	}

	.content-search {
		.ant-form-item {
			.ant-select {
				width: 194px !important;
				text-align: left;
			}
		}
	}

	.action-btn {
		.ant-btn {
			&:first-child {
				padding-left: 0;
			}
		}
	}
}
</style>
