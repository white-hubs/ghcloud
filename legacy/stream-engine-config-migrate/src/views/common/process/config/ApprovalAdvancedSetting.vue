<template>
	<div>
		<el-form label-position="left" label-width="100px" class="advanced-setting-form">
			<!-- <template v-if='selectNode.type==="APPROVAL"'> -->
			<el-form-item label="是否支持加签" prop="text">
				<el-switch v-model="nodeProps.countersign"></el-switch>
			</el-form-item>
			<div>
				<el-form-item label="手写签名" prop="text">
          <div style="align-items: center;display: flex;">
            <el-switch v-model="nodeProps.sign"></el-switch>
            <el-checkbox v-model="nodeProps.signConfig.useLastSign" v-show="nodeProps.sign" style="margin-left: 10px;">是否使用上次签名</el-checkbox>
          </div>
				</el-form-item>
			</div>
			<el-form-item label="审批意见" prop="text">
				<el-switch v-model="nodeProps.opinion"></el-switch>
			</el-form-item>
			<el-form-item label="指定审批人" prop="text">
				<el-switch v-model="nodeProps.designatedApprover"></el-switch>
			</el-form-item>
			<div class="limit-approval">
				<el-form-item label="限时审批" prop="text">
					<el-switch v-model="nodeProps.limitTimeApproval"></el-switch>
				</el-form-item>
				<div class="limit-time-option" v-show="nodeProps.limitTimeApproval">
					<div>
						<el-checkbox v-model="nodeProps.limitTimeApprovalConfig.limitTimeNotify.checked">限时提醒</el-checkbox>
					</div>
					<div class="limit-time-option" v-show="nodeProps.limitTimeApprovalConfig.limitTimeNotify.checked">
						<div class="limit-time-remind">
							<div class="limit-time-remind-item"
								v-for="(remindItem,index) in nodeProps.limitTimeApprovalConfig.limitTimeNotify.approvalReminder"
								:key="index">
								<span>流程到达该审批节点超过</span>
								<el-input class="time-value-input" v-model="remindItem.value" oninput="value=value.replace(/[^\d]/g,'')"
									size="small" @blur="normalizeMinuteValue(remindItem)">
									<template slot="suffix">
										<el-select v-model="remindItem.unit" placeholder="" size="small">
											<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
										</el-select>
									</template>
								</el-input>
								<span>未处理时提醒</span>
								<el-button v-show="index===0" @click="handleAddRemind" type="primary" icon="el-icon-plus" circle
									style="margin-left:10px" size="mini"></el-button>
								<el-button v-show="index!==0" @click="handleDelRemind(index)" type="primary" icon="el-icon-minus" circle
									style="margin-left:10px" size="mini"></el-button>
								<div class="remind-person">
									<div class="label">被提醒人:</div>
								</div>
								<div class="notify-user">
										<el-radio-group v-model="remindItem.notifyType">
											<el-radio v-for="t in notifyTypes" :label="t.type" :key="t.type" :disabled="t.disabled">
												{{ t.name }}
											</el-radio>
										</el-radio-group>
										<div v-if="remindItem.notifyType === 'DESIGNATED_PERSONNEL'">
											<el-button size="mini" icon="el-icon-plus" type="primary" @click="selectUser(remindItem)" round>选择人员</el-button>
											<org-items v-model="remindItem.notifyUsers" />
										</div>
										<div v-else-if="remindItem.notifyType === 'ROLE'">
											<el-button size="mini" icon="el-icon-plus" type="primary" @click="selectRole(remindItem)" round>选择系统角色</el-button>
											<org-items v-model="remindItem.notifyRole" />	
										</div>
										<div v-else-if="remindItem.notifyType === 'POST'">
											<el-button size="mini" icon="el-icon-plus" type="primary" @click="selectPost(remindItem)" round>选择职位</el-button>
											<org-items v-model="remindItem.notifyPost" />
										</div>
										<div v-else-if="remindItem.notifyType === 'APPOINTMENT'">
											<el-button size="mini" icon="el-icon-plus" type="primary" @click="selectAppointment(remindItem)" round>选择岗位</el-button>
											<org-items v-model="remindItem.notifyAppointment" />
										</div>
										<div v-else-if="remindItem.notifyType === 'FORM_USER'">
											<el-form-item label="选择表单人员项" prop="text" class="approve-end">
												<el-select style="width: 80%;" size="small" v-model="remindItem.formUser" placeholder="请选择包含人员的表单项">
													<el-option v-for="op in forms" :label="op.title" :value="op.id" :key="op.id"></el-option>
												</el-select>
											</el-form-item>
										</div>
								</div>	
							</div>

						</div>
					</div>
					<div style="margin-top: 10px;border-top: 1px solid #f6f6f6;padding-top: 10px">
						<el-checkbox label="limitTimeApproval"
							v-model="nodeProps.limitTimeApprovalConfig.limitTimeApproval.checked">限时审批</el-checkbox>
					</div>
					<div class="limit-pass-option" v-show="nodeProps.limitTimeApprovalConfig.limitTimeApproval.checked">
						<div class="limit-pass-time-row">
							<span>流程到达该审批节点超过</span>
							<el-input class="time-value-input" oninput="value=value.replace(/[^\d]/g,'')"
								v-model="nodeProps.limitTimeApprovalConfig.limitTimeApproval.value" size="small"
								@blur="normalizeMinuteValue(nodeProps.limitTimeApprovalConfig.limitTimeApproval)">
								<template slot="suffix">
									<el-select v-model="nodeProps.limitTimeApprovalConfig.limitTimeApproval.unit" placeholder="" size="small">
										<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
									</el-select>
								</template>
							</el-input>
							<span>未处理时</span>
						</div>
						<div class="limit-pass-action-row">
							<el-radio-group v-model="nodeProps.limitTimeApprovalConfig.limitTimeApproval.type" size="small">
								<el-radio-button label="PASS">自动通过</el-radio-button>
								<el-radio-button label="TRANSFER">自动转交</el-radio-button>
							</el-radio-group>
						</div>
						<div class="limit-transfer-option" v-show="nodeProps.limitTimeApprovalConfig.limitTimeApproval.type === 'TRANSFER'">
							<el-button size="mini" icon="el-icon-plus" type="primary" @click="selectLimitTransferUser" round>选择指定人员</el-button>
							<org-items v-model="nodeProps.limitTimeApprovalConfig.limitTimeApproval.targetUsers" />
						</div>
					</div>
				</div>
			</div>

			<!-- </template> -->
			<!-- <template v-if='selectNode.type==="CC"'>
				<el-form-item label="指定抄送人" prop="text">
					<el-switch v-model="nodeProps.designatedApprover"></el-switch>
				</el-form-item>
			</template> -->
		</el-form>
		<!-- <el-divider></el-divider>
		<el-form label-position="left" label-width="100px" class="advanced-setting-form">
			<el-form-item label="超时提醒" prop="text">
				<el-switch></el-switch>
			</el-form-item>
			<div class="time-over">
				流程到达该审批节点超过
				<el-input class="time-value-input" size="small">
					<template slot="suffix">
						<el-select v-model="value" placeholder="" size="small">
							<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</template>
				</el-input>
				未处理时提醒
			</div>
			<el-divider></el-divider>
		</el-form>
		<el-form label-position="top" label-width="100px" class="advanced-setting-form">
			<el-form-item label="被提醒人" prop="text">
				<el-radio label="1">当前审批人</el-radio>
			</el-form-item>
			<el-form-item label="提醒方式" prop="text">
				<el-checkbox-group  v-model="checkList">
					<el-checkbox label="消息提醒"></el-checkbox>
					<el-checkbox label="待办"></el-checkbox>
					<el-checkbox label="短信"></el-checkbox>
				</el-checkbox-group>
			</el-form-item>
		</el-form> -->
		<org-picker :title="pickerTitle" :multiple="multiple" :type="orgPickerType" ref="orgPicker"
      :selected="orgPickerSelected" @ok="selected" @close="closed" />
	</div>
</template>
<script>

import OrgPicker from "@/components/common/OrgPicker";
import OrgItems from "../OrgItems";

export default {
	name: "ApprovalAdvancedSetting",
	components: { OrgPicker, OrgItems },
	data() {
		return {
			checkboxValue: ['limitTimeApproval'],
			value: null,
			options: [
				{
					value: "MINUTE",
					label: "分",
				},
				{
					value: "HOUR",
					label: "时",
				},
				{
					value: "DAY",
					label: "天",
				}
			],
			value: "HOUR",
			checkList: [],
			orgPickerType: 'getStaffList',
			orgPickerSelected: [],
			currentRemindItem: null,
			currentPickerScene: null,
		};
	},
	computed: {
		notifyTypes() {
      const list = [
        { name: '当前审批人', type: 'currentApproval', disabled: false },
				{ name: '指定人员', type: 'DESIGNATED_PERSONNEL', disabled: false },
        { name: '角色', type: 'ROLE', disabled: false },
        { name: '管理部门职位', type: 'POST', disabled: false, },
        { name: '所在部门岗位', type: 'APPOINTMENT', disabled: false, },
				{ name: '表单内联系人', type: 'FORM_USER', disabled: false },
      ]
      return list
    },
		forms() {
      return this.$store.state.design.formItems.filter(f => {
        return f.name === 'UserPicker' || f.name === 'TelPhone'
      })
    },
		selectNode() {
			return this.$store.state.selectedNode
		},
		nodeProps() {
			return this.$store.state.selectedNode.props;
		},
		pickerTitle() {
      switch (this.orgPickerType) {
        case 'getStaffList':
          return '请选择人员';
        case 'getRoles':
          return '请选择系统角色';
        default:
          return '请选择';
      }
    },
		multiple() {
      switch (this.orgPickerType) {
        case 'getStaffList':
          return true
        case 'getRoles':
          return true
        case 'getPositionList':
          return true
        case 'getAppointmentList':
          return true
        default:
          return true
      }
    },
	},
	mounted() {
		this.initLimitTimeApprovalConfig()
		// 兼容历史数据，确保所有 remindItem 都有必要的字段和正确的数据类型
		if (this.nodeProps.limitTimeApprovalConfig && 
				this.nodeProps.limitTimeApprovalConfig.limitTimeNotify && 
				this.nodeProps.limitTimeApprovalConfig.limitTimeNotify.approvalReminder) {
				
			this.nodeProps.limitTimeApprovalConfig.limitTimeNotify.approvalReminder.forEach(remindItem => {
				// 初始化其他缺失的字段
				if (!remindItem.notifyUsers) {
					this.$set(remindItem, 'notifyUsers', [])
				}
				if (!remindItem.notifyRole) {
					this.$set(remindItem, 'notifyRole', [])
				}
				if (!remindItem.notifyPost) {
					this.$set(remindItem, 'notifyPost', [])
				}
				if (!remindItem.notifyAppointment) {
					this.$set(remindItem, 'notifyAppointment', [])
				}
				if (!remindItem.formUser) {
					this.$set(remindItem, 'formUser', null)
				}
			})
		}
	},
	methods: {
		initLimitTimeApprovalConfig() {
			if (!this.nodeProps.limitTimeApprovalConfig) {
				this.$set(this.nodeProps, 'limitTimeApprovalConfig', {})
			}
			const config = this.nodeProps.limitTimeApprovalConfig
			if (!config.limitTimeApproval) {
				const autoPass = config.autoPass || {}
				this.$set(config, 'limitTimeApproval', {
					checked: Boolean(autoPass.checked),
					unit: autoPass.unit || 'DAY',
					value: autoPass.value || null,
					type: 'PASS',
					targetAccount: '',
					targetUsers: [],
				})
			}
			if (!config.limitTimeApproval.type) {
				this.$set(config.limitTimeApproval, 'type', 'PASS')
			}
			if (!config.limitTimeApproval.targetUsers) {
				this.$set(config.limitTimeApproval, 'targetUsers', [])
			}
			this.syncLimitTransferTargetAccount()
		},
		syncLimitTransferTargetAccount() {
			const approval = this.nodeProps.limitTimeApprovalConfig.limitTimeApproval
			const targetAccount = approval.targetUsers && approval.targetUsers.length
				? approval.targetUsers.map(item => item.id || item.value).join(',')
				: ''
			this.$set(approval, 'targetAccount', targetAccount)
		},
		normalizeMinuteValue(config) {
			if (config && config.unit === 'MINUTE' && Number(config.value) > 0 && Number(config.value) < 5) {
				this.$set(config, 'value', 5)
			}
		},
		handleAddRemind() {
			this.nodeProps.limitTimeApprovalConfig.limitTimeNotify.approvalReminder.push({
				unit: 'DAY',
				value: null,
				notifyType: 'currentApproval',
				notifyUsers: [],
				notifyRole: [],
				notifyPost: [],
				notifyAppointment: [],
				formUser: null
			})
		},
		handleDelRemind(index) {
			this.nodeProps.limitTimeApprovalConfig.limitTimeNotify.approvalReminder.splice(index, 1)
		},
		selectUser(remindItem) {
      this.orgPickerType = 'getStaffList'
      this.orgPickerSelected = remindItem.notifyUsers
			this.currentRemindItem = remindItem
			this.currentPickerScene = 'remind'
      this.$nextTick(() => {
        this.$refs.orgPicker.show(this.orgPickerSelected)
      })
    },
		selectLimitTransferUser() {
			this.orgPickerType = 'getStaffList'
			this.orgPickerSelected = this.nodeProps.limitTimeApprovalConfig.limitTimeApproval.targetUsers
			this.currentPickerScene = 'limitTransfer'
			this.$nextTick(() => {
				this.$refs.orgPicker.show(this.orgPickerSelected)
			})
		},
		selectRole(remindItem) {
      this.orgPickerType = 'getRoles'
      this.orgPickerSelected = remindItem.notifyRole
			this.currentRemindItem = remindItem
			this.currentPickerScene = 'remind'
      this.$nextTick(() => {
        this.$refs.orgPicker.show(this.orgPickerSelected)
      })
    },
		selectPost(remindItem) {
      this.orgPickerType = 'getPositionList'
      this.orgPickerSelected = remindItem.notifyPost
			this.currentRemindItem = remindItem
			this.currentPickerScene = 'remind'
      this.$nextTick(() => {
        this.$refs.orgPicker.show(this.orgPickerSelected)
      })
    },
		selectAppointment(remindItem) {
      this.orgPickerType = 'getAppointmentList'
      this.orgPickerSelected = remindItem.notifyAppointment
			this.currentRemindItem = remindItem
			this.currentPickerScene = 'remind'
      this.$nextTick(() => {
        this.$refs.orgPicker.show(this.orgPickerSelected)
      })
    },
		selected(select) {
      this.orgPickerSelected.length = 0
      this.orgPickerSelected.reverse()
      select.forEach(val => this.orgPickerSelected.push(val))
      
      // 处理选中数据
      const simplifiedData = select.map(item => ({
        id: item.id || item.value,
        name: item.name || item.label
      }))
			if (this.currentPickerScene === 'limitTransfer') {
				const approval = this.nodeProps.limitTimeApprovalConfig.limitTimeApproval
				this.$set(approval, 'targetUsers', simplifiedData)
				this.syncLimitTransferTargetAccount()
				return
			}
      
      if (this.currentRemindItem) {
        // 先清除所有类型的数据
        this.$set(this.currentRemindItem, 'notifyUsers', [])
        this.$set(this.currentRemindItem, 'notifyRole', [])
        this.$set(this.currentRemindItem, 'notifyPost', [])
        this.$set(this.currentRemindItem, 'notifyAppointment', [])
        this.$set(this.currentRemindItem, 'formUser', null)
        // 然后根据当前类型设置对应的数据
        switch (this.orgPickerType) {
          case 'getStaffList':
            this.$set(this.currentRemindItem, 'notifyUsers', simplifiedData)
            break
          case 'getRoles':
            this.$set(this.currentRemindItem, 'notifyRole', simplifiedData)
            break
          case 'getPositionList':
            this.$set(this.currentRemindItem, 'notifyPost', simplifiedData)
            break
          case 'getAppointmentList':
            this.$set(this.currentRemindItem, 'notifyAppointment', simplifiedData)
            break
        }
      }
    },
    closed() {
			this.currentRemindItem = null
			this.currentPickerScene = null
		},
	},
};
</script>
<style scoped lang="less">
.advanced-setting-form {
	/deep/ .el-form-item {
		margin-bottom: 0;
	}
}

.time-value-input {
	width: 197px;
	margin: 0 6px;

	/deep/ .el-input__suffix {
		right: 0;

		.el-input__inner {
			width: 50px;
			padding: 0;
			padding-left: 10px;
			height: 30px;
			transform: translate(-1px, 1px);
			border: 0;
			border-left: 1px solid #d9d9d9;
			border-top-left-radius: 0;
			border-bottom-left-radius: 0;
		}

		.el-input__suffix {
			transform: translateY(1px);
		}
	}
}

.limit-time-option,
.limit-pass-option {
	margin-top: 20px;
}

.limit-transfer-option {
	margin-top: 12px;
}

.limit-pass-time-row,
.limit-pass-action-row {
	display: flex;
	align-items: center;
}

.limit-pass-action-row {
	margin-top: 14px;
}

.sign-config {
	margin: 12px 0;
}

.limit-time-remind-item {
	padding: 20px 0;
	border-bottom: 1px solid rgb(246, 246, 246);

	&:last-child {
		margin-bottom: 0;
		border-bottom: none
	}
}

.remind-person {
	margin-top: 10px;
	display: flex;
	align-items: center;
	gap: 10px;
}

.notify-user {
  /deep/ .el-radio {
    width: 110px;
    margin-top: 10px;
    margin-bottom: 20px;
  }
}

.time-over {
	font-size: 14px;
	font-weight: normal;
	color: #3d3d3d;
	display: flex;
	align-items: center;
}
</style>
