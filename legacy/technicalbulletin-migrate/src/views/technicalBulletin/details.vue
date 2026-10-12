<template>
	<g-layout title="通报管理-详情">
		<template v-slot:content-table>
			<a-form ref="form" :model="model">
				<a-form-item label="通报标题" name="topic" class="form-item">
					<span>二十大会议内容</span>
				</a-form-item>
				<a-form-item label="通报说明" name="textarea" class="form-item">
					<a-card t :bodyStyle="{ padding: '0' }">
						<template v-slot:title> </template>
						<a-textarea
							v-model:value="model.textarea"
							placeholder="请输入通报说明"
							:maxlength="200"
							:rows="2"
							:disabled="true"
						/>
					</a-card>
				</a-form-item>
				<!-- 文件上传 -->
				<a-form-item label="附件信息" name="file" class="form-item">
					<a-upload
						v-model:file-list="model.fileList"
						action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
						:disabled="true"
					>
						<a-button>
							<upload-outlined></upload-outlined>
							Upload
						</a-button>
					</a-upload>
				</a-form-item>
				
				<a-form-item label="通报记录" name="topic" class="form-item">
					<!-- <TableInModal :columns='columns' :searchLength='0'> </TableInModal> -->
					 <a-table :dataSource='dataSource' :columns="columns" :bordered='true' />
				</a-form-item>
			</a-form>
		</template>
		<template v-slot:footer-page>
			<a-button type="primary">保存</a-button>
			<a-button>取消</a-button>
		</template>
	</g-layout>
</template>

<script lang="jsx">
import {
	defineComponent,
	getCurrentInstance,
	onMounted,
	reactive,
	toRefs,
	createVNode,
	ref
} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Modal, message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
export default defineComponent({
	components: {},
	setup() {
		const { proxy } = getCurrentInstance
		const router = useRouter()
		const route = useRoute()
		const type = route.query
		const count = ref(1)
		const state = reactive({
			model: {
				topic: '',
				textarea: '国家决定，对医疗农业',
				DepAndMenber: '', //选择部门还是人员
				noticeMode: '', //通知方式
				member: '', //具体的人员或者那个部门
				fileList: [{ name: '20大会议内容' }]
			},
			noticeModeArr: [{ id: 0 }],
			//展示表格记录
			columns: [
				{
					title: '通知时间',
					dataIndex: 'time',
					sorter: true,
					width: '20%'
				},
				{
					title: '人员',
					dataIndex: 'menmber',
					width: '40%'
				},
				{
					title: '结果',
					dataIndex: 'result',
					width: '10%'
				},
			],
			dataSource:[
				{key:1,time:'2015-12-3',menmber:'张三',result:'已通知到'},
				{key:2,time:'2015-12-3',menmber:'张三',result:'已通知到'},
				{key:3,time:'2015-12-3',menmber:'张三',result:'已通知到'},
				{key:4,time:'2015-12-3',menmber:'张三',result:'已通知到'},
			]
		})
		onMounted(function(){})
		//点击新增的时候 增加一栏
		const addNoticeMode = () => {
			state.noticeModeArr.push({ id: count.value })
			count.value++
		}
		//点击去掉的时候 减去一栏
		const reduceNoticeMode = (id) => {
			state.noticeModeArr = state.noticeModeArr.filter((item) => item.id != id)
		}
		return {
			...toRefs(state),
			addNoticeMode,
			reduceNoticeMode
		}
	}
})
</script>

<style lang='less' scoped>
.form-item {
	margin-right: 50px;
	.form-item-but {
		margin: 0 10px;
	}
}
</style>