import { FormProcessInstanceStatus, type FormFlowInstance, type FormProcessInstance } from '@ghcloud/cube-stream-engine-service/src/type'
import { cubeAttendanceService, cubeFlowService } from '../api/server'
import { FormProcessOperate, ProcessType } from '../process'
import { message, type FormInstance } from 'ant-design-vue'
import { computed, ref } from 'vue'
import type { ApprovalOpinion, FlowForm, PostProcessTaskBack, PostProcessTaskComplete, PostProcessTaskReject } from '../type'
import { formFlowService, getNode } from '../hooks/form-flow.hook'

export class Operates {
  /* 当前任务的详情 */
  private currentTaskDetail!: FormFlowInstance
  /* 获取当前任务的详情 */
  public async getTaskDetail (processId: string): Promise<void> {
    const res = await cubeFlowService.getTaskForm(processId)
    this.currentTaskDetail = res
  }

  /** 获取权限按钮 */
  public getOperateButtons (notOperates: string, currentUser: { id: string; }): FormProcessOperate[] | [] {
    if (!this.currentTaskDetail || notOperates) {
      return []
    }
    const res = getOperates(this.currentTaskDetail.processInstanceRunningInfo, this.currentTaskDetail.remainderOfActive)
    return res
    // 根据接口数据 生成按钮权限数组
    function getOperates (processInstance: FormProcessInstance, permissionUserIds: string[]): FormProcessOperate[] {
      const result = []
      if (currentUser) {
        if (currentUser.id === processInstance.startUserId) {
          switch (processInstance.status) {
            case FormProcessInstanceStatus.ACTIVE:
              result.push(FormProcessOperate.UNDO)
              break
            case FormProcessInstanceStatus.UNDO:
            case FormProcessInstanceStatus.REJECTED:
              result.push(FormProcessOperate.REPEAT)
              break
            case FormProcessInstanceStatus.FINISHED:
            default:
          }
        }
        if (userHaveOperatePower(currentUser, permissionUserIds)) {
          switch (processInstance.status) {
            case FormProcessInstanceStatus.ACTIVE:
              result.push(FormProcessOperate.PASS, FormProcessOperate.BACK, FormProcessOperate.TRANSFER, FormProcessOperate.REJECT)
              break
            case FormProcessInstanceStatus.FINISHED:
            case FormProcessInstanceStatus.UNDO:
            case FormProcessInstanceStatus.REPEATED:
            default:
              break
          }
        }
      }
      return result
    }

    function userHaveOperatePower (user: { id: string; }, permissionUserIds: string[]): boolean {
      return permissionUserIds.includes(user.id)
    }
  }

  /** 新增流程提交 */
  public async processSubmit (
    formRenderRef: {
      formRef: FormInstance;
      formData: Record<string, unknown>;
    },
    flowForm: FlowForm,
    businessType: string,
    userName: string,
    formProcess: {
      selfSelectApproveUsers: Record<string, { id: string; }[]>;
    }
  ): Promise<void> {
    const isLoading = ref(true)
    formRenderRef.formRef.validate().then(async () => {
      let checkRes = true
      // 考勤校验
      try {
        isLoading.value = true
        const CheckParams = {
          formId: flowForm.formDefinitionId,
          formData: JSON.stringify(formRenderRef.formData),
        }
        if (businessType === 'CHANGE_CLASSES') {
          await cubeAttendanceService.postClassesChangeCheck(CheckParams).then((res) => {
            checkRes = res.data as unknown as boolean
          })
        } else if (businessType === 'REPAIR_CLOCK') {
          await cubeAttendanceService.postClockRepairCheck({ businessType, flowData: CheckParams }).then((res) => {
            checkRes = res.data as unknown as boolean
          })
        }
      } catch (error) {
        checkRes = false
      } finally {
        isLoading.value = false
      }

      if (checkRes) {
        try {
          isLoading.value = true
          // 条件变量获取与转换
          const branchArr = formFlowService.getBranches(JSON.parse(flowForm.flowJson))
          const conditions = formFlowService.getConditions(branchArr)
          const variables = formFlowService.convertConditions(conditions, formRenderRef.formData)
          // 隐藏排查、故障报修传参
          if (['FAULT', 'HIDDENDANGER'].includes(businessType)) {
            variables.resource = 'MANUAL_SUBMISSION'
          }
          // 表单内联系人
          const appRovalNodes = formFlowService.getApprovalAndCCNode(JSON.parse(flowForm.flowJson))
          appRovalNodes.forEach(e => {
            if (e.props.assignedType === 'FORM_USER' && e.props.formUser && formRenderRef.formData[e.props.formUser]) {
              const formUserValue = JSON.parse(JSON.stringify(formRenderRef.formData[e.props.formUser])) ?? ''
              if (formUserValue) {
                variables[e.props.formUser] = formUserValue
              }
            }
          })
          // 卡片标题
          let backLogTitle = ''
          if (userName) {
            backLogTitle = userName + '发起的' + flowForm.businessTypeName
          }
          const approveUsers = computed(() => {
            if (!(formProcess?.selfSelectApproveUsers)) {
              return {}
            }
            const approveUsers: Record<string, string> = {}
            for (const key in formProcess.selfSelectApproveUsers) {
              const item = formProcess.selfSelectApproveUsers[key]
              approveUsers[key] = item.map((item: { id: string; }) => item.id).join(',')
            }
            return approveUsers
          })
          const submitParams = {
            type: flowForm.type,
            application: flowForm.application,
            applicationName: flowForm.applicationName,
            businessType,
            flowKey: flowForm.flowKey,
            formKey: flowForm.formKey,
            formDefinitionId: flowForm.formDefinitionId,
            formDefinitionVersion: flowForm.formDefinitionVersion,
            data: JSON.stringify(formRenderRef.formData),
            variables,
            backLogTitle,
            approveUsers: approveUsers.value
          }

          // 考勤走考勤统一接口
          if (['LEAVE', 'CANCEL_LEAVE', 'OVERTIME', 'LEAVE_THE_POST', 'AWAY_BUSINESS'].includes(businessType)) {
            await cubeAttendanceService.attendanceApprovalSubmit(submitParams)
          } else {
            await cubeFlowService.postFormFlowsFirst(submitParams)
          }

          message.success('操作成功')
          this.goBack()
        } catch (error) {
          message.error('表单提交出错')
        } finally {
          isLoading.value = false
        }
      }
      return isLoading.value
    })
  }

  /** 流程节点提交 */
  public async processHandle (
    processType: ProcessType,
    processId: string,
    formRenderRef: {
      formRef: FormInstance;
      formData: Record<string, unknown>;
    },
    operateItem: FormProcessOperate,

  ): Promise<{
      handlingName: string;
      showSignModal: boolean;
    } | undefined> {
    // 当前是否是第一个审批节点
    const isfirstTaskActive = ref(false)
    const showSignModal = ref(false)
    if (processType === ProcessType.DETAIL) {
      const res = await cubeFlowService.firstTaskActive(processId)
      isfirstTaskActive.value = res.data as unknown as boolean
    }
    if (FormProcessOperate.BACK === operateItem && isfirstTaskActive.value) {
      message.error('第一个审批节点不支持回退')
      return
    }
    // 处理流程
    const handlingName = ref('')
    if (handlingName.value) {
      return
    }
    handlingName.value = operateItem
    try {
      // 审批流程加一层校验
      if (operateItem === FormProcessOperate.PASS) {
        await formRenderRef.formRef.validate()
      }
      if ([FormProcessOperate.PASS, FormProcessOperate.REJECT, FormProcessOperate.BACK].includes(operateItem)) {
        // 查看流程配置 是否开启审批意见或者手写签名
        const flowObj = JSON.parse(this.currentTaskDetail.properties.processJson)
        const nowNode = getNode(flowObj, this.currentTaskDetail.key)
        if (isUndefined(nowNode.props.sign)) {
          nowNode.props.sign = true
        }
        if (isUndefined(nowNode.props.opinion)) {
          nowNode.props.opinion = true
        }
        if (nowNode.props.sign || nowNode.props.opinion) {
          // let imageSign: any = null
          showSignModal.value = true
          // signModelFormRef.value?.resetFields()
          // showSign.value = nowNode.props.sign
          // showOpinion.value = nowNode.props.opinion
          // if (nowNode.props?.signConfig?.useLastSign) {
          //   imageSign = await getUserLastWriteSign()
          // } else {
          //   lastSignId = ''
          // }
          // if (imageSign?.data) {
          //   lastSignId = imageSign.data.id
          //   signPicSrc.value = imageSign.data.path
          // }
          return
        }
      }

      if (operateItem === FormProcessOperate.PASS) {
        // 通过
        await this.clickComplete(formRenderRef)
      } else if (operateItem === FormProcessOperate.REJECT) {
        // 拒绝
        await this.clickRefuse(formRenderRef)
      } else if (operateItem === FormProcessOperate.REPEAT) {
        // 再次发起
        await this.clickRepeat(formRenderRef)
      } else if (operateItem === FormProcessOperate.UNDO) {
        // 撤销
        await this.clickUno(processId)
      } else if (operateItem === FormProcessOperate.BACK) {
        // 退回
        await this.clickBack()
      } else if (operateItem === FormProcessOperate.TRANSFER) {
        // 转交
        await this.clickTransfer()
      }
    } catch (error) {
      handlingName.value = ''
    }
    setTimeout(() => {
      handlingName.value = ''
    }, 0)

    function isUndefined (obj: unknown): boolean {
      return typeof obj === 'undefined'
    }
    return {
      handlingName: handlingName.value,
      showSignModal: showSignModal.value
    }
  }

  /** 返回 */
  public goBack (): void {
    if (sessionStorage.getItem('flow-repeat-data')) {
      sessionStorage.removeItem('flow-repeat-data')
      history.go(-3)
      return
    }
    history.back()
  }

  /* 完成 */
  public async clickComplete (formRenderRef: {
    formRef: FormInstance;
    formData: Record<string, unknown>;
  }, approvalOpinion: ApprovalOpinion | null = null): Promise<void> {
  // 表单内联系人
    const branchArr = formFlowService.getBranches(JSON.parse(this.currentTaskDetail.properties.processJson))
    const conditions = formFlowService.getConditions(branchArr)
    const variables = formFlowService.convertConditions(conditions, formRenderRef.formData)

    const appRovalNodes = formFlowService.getApprovalAndCCNode(JSON.parse(this.currentTaskDetail.properties.processJson))
    appRovalNodes.forEach(e => {
      if (e.props.assignedType === 'FORM_USER' && e.props.formUser && formRenderRef.formData[e.props.formUser]) {
        const formUserValue = JSON.parse(JSON.stringify(formRenderRef.formData[e.props.formUser])) ?? ''
        if (formUserValue) {
          variables[e.props.formUser] = formUserValue
        }
      }
    })

    const params: PostProcessTaskComplete = {
      taskId: this.currentTaskDetail.id,
      account: null,
      data: JSON.stringify(formRenderRef.formData),
      result: 'PASS',
      variables
    }
    if (approvalOpinion !== null) {
      params.approvalOpinion = approvalOpinion
    }
    await cubeFlowService.taskComplete(params).then(() => {
      message.success('操作成功')
      this.goBack()
    })
  }

  /* 拒绝 */
  public async clickRefuse (formRenderRef: {
    formRef: FormInstance;
    formData: Record<string, unknown>;
  }, approvalOpinion: ApprovalOpinion | null = null): Promise<void> {
    const params: PostProcessTaskReject = {
      taskId: this.currentTaskDetail.id,
      account: null,
      comment: null,
      data: JSON.stringify(formRenderRef.formData),
    }
    if (approvalOpinion !== null) {
      params.approvalOpinion = approvalOpinion
    }
    await cubeFlowService.postProcessTaskReject(params).then(() => {
      message.success('操作成功')
      this.goBack()
    })
  }

  /* 再次发起 */
  public async clickRepeat (formRenderRef: {
    formRef: FormInstance;
    formData: Record<string, unknown>;
  }): Promise<void> {
    const repeatData: Record<string, unknown> = {}
    for (const key in formRenderRef.formData) {
      if (key.includes('field')) {
        repeatData[key] = formRenderRef.formData[key]
      }
    }
    sessionStorage.setItem('flow-repeat-data', JSON.stringify(repeatData))
    // history.pushState({ current: location.pathname + location.search }, '', `/portal/stream-engine-render/repeat?businessType=${businessType}&title=${flowForm.value.businessTypeName}`)
  }

  /* 撤销 */
  public async clickUno (processId: string): Promise<void> {
    await cubeFlowService.postProcessTaskUndo({
      processInstanceId: processId,
      comment: null,
    }).then(() => {
      message.success('操作成功')
      this.goBack()
    })
  }

  /* 退回 */
  public async clickBack (approvalOpinion: ApprovalOpinion | null = null): Promise<void> {
    const params: PostProcessTaskBack = {
      taskId: this.currentTaskDetail.id,
      account: null,
      comment: null,
      variables: null,
    }
    if (approvalOpinion !== null) {
      params.approvalOpinion = approvalOpinion
    }
    await cubeFlowService.postProcessTaskBack(params).then(() => {
      message.success('操作成功')
      this.goBack()
    })
  }

  /* 转交 */
  public async clickTransfer (): Promise<boolean> {
    return true
  }
}
