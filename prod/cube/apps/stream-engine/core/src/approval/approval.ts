import type { ApprovalItem, ApprovalOpinion, FormFlowInstance, InterruptData, TaskQueenType } from '@/type'
import { cubeFlowService } from '../api/server'
import { formFlowService, getNode, getNowNode, getPermission } from '../hooks/form-flow.hook'
import { ref } from 'vue'
export class Approval {
  /** 是否需要签名 */
  private needApprovalText = false
  /** 是否需要审批意见 */
  private needApprovalSign = false
  /** 是否复用上次签名 */
  private useLastSign=false
  /** 任务Queen */
  private readonly taskQueen: TaskQueenType = {
    ignore: [],
    success: [],
    fail: [],
    todo: [],
  }
  public taskDataHandleNum=ref<number>(0)

  /** 执行批量审批方法 */
  public async batchApproval (tasks: { taskName: string; businessKey: string;businessType:string }[],
    formState?: { sign: string; opinion: string; }): Promise<{ checkData?: InterruptData;isInterrupt?: boolean;queen?: TaskQueenType; }> {
    this.taskQueen.ignore = []
    this.taskQueen.success = []
    this.taskQueen.fail = []
    this.taskQueen.todo = []
    this.taskDataHandleNum.value=0
    let isCheck = false
    isCheck = await this.checkAdditionalConditions(tasks)
    //如果需要复用上一次签名，则获取签名图片
    this.useLastSign=this.taskQueen.todo.some(x=>x.approvalOpinion.useLastSign)
    let imageSign={ path: '',id: '' }
    if(this.useLastSign){
      const data = await cubeFlowService.getLastWriteSign()
      imageSign.path=data?.path??''
      imageSign.id=data?.id??''
    }
    // 如果需要需要手写签名或者审批意见/不是手动审批，则退出
    if (isCheck && !formState) return { checkData: { needApprovalText: this.needApprovalText, needApprovalSign: this.needApprovalSign,imageSign }, isInterrupt: true }
    // 执行批量审批
    const taskList = this.taskQueen.todo.map(async task => {
      return new Promise(async (resolve) => {
        const approvalOpinion: Record<string, unknown> = {}
        task.approvalOpinion.opinion && (approvalOpinion.text = formState?.opinion)
        task.approvalOpinion.sign && (approvalOpinion.sign = formState?.sign)
        try {
          await this.singleApproval(
            task.flowInstance,
            task.formData,
            approvalOpinion,
          )
          this.taskQueen.success.push({
            processId: task.processId,
            title: task.title,
          })
        } catch (error) {
          this.taskQueen.fail.push({
            processId: task.processId,
            reason: (error as { errorMessage: string; }).errorMessage || '流程处理失败',
            businessType:task?.businessType??'',
            title: task.title
          })
        }
        resolve('done')
      })
    })
    await Promise.all(taskList)
    return { queen: this.taskQueen, isInterrupt: false }
  }

  /** 单个任务梳理 */
  private async taskDataHandle (task: ApprovalItem): Promise<unknown> {
    try {
      // 流程实例
      // 获取流程节点任务信息
      const flowInstance = await cubeFlowService.getTaskForm(task.processId)
      const formData = JSON.parse(flowInstance.data)
      const formOptions = JSON.parse(flowInstance.properties.formJson)
      // 验证是否有未填写必填项
      for (const key in formOptions) {
        const item = formOptions[key]
        if (item.props.required) {
          const itemPermission = getPermission(item, flowInstance.properties.processJson, flowInstance.key ?? '')
          if (itemPermission.show && !itemPermission.readonly && !formData[item.id]) {
            // 当前表单包含必填项，但是没有值
            this.taskQueen.ignore.push({
              processId: task.processId,
              reason: `${item.title}为必填项`,
              title: task.title,
              businessType:task?.businessType??'',
            })
            return Promise.resolve()
          }
        }
      }
      // 验证是否需要审批意见
      const nowNode = getNowNode(flowInstance)
      if (!nowNode) {
        this.taskQueen.ignore.push({
          processId: task.processId,
          reason: '流程已结束',
          title: task.title,
          businessType:task?.businessType??'',
        })
        return Promise.resolve()
      }
      //是否复用签名
      const flowObj = JSON.parse(flowInstance.properties.processJson);
      const node = getNode(flowObj, flowInstance.key);
      nowNode.props.opinion && (this.needApprovalText = true)
      nowNode.props.sign && (this.needApprovalSign = true)
      this.taskQueen.todo.push({
        processId: task.processId,
        title: task.title,
        formData,
        approvalOpinion: {
          sign: nowNode.props.sign,
          opinion: nowNode.props.opinion,
          useLastSign:node.props?.signConfig?.useLastSign,
        },
        flowInstance
      })
    } catch (error) {
      this.taskQueen.fail.push({
        processId: task.processId,
        reason: '流程数据处理出错',
        title: task.title,
        businessType:task?.businessType??'',
      })
    }
    this.taskDataHandleNum.value++
    return Promise.resolve()
  }

  /** 执行单个审批方法 */
  private async singleApproval (flowInstance: FormFlowInstance, formData: Record<string, unknown>, approvalOpinion: ApprovalOpinion | null = null): Promise<void> {
    await formFlowService.processApprove(flowInstance.id, formData, approvalOpinion, flowInstance)
  }

  /** 判断是否需要手写签名或者审批意见(批量) */
  private async checkAdditionalConditions (tasks: { taskName: string; businessKey: string; businessType:string}[]): Promise<boolean> {
    this.needApprovalSign = false
    this.needApprovalText = false
    /** 任务列表 */
    const cubeAppTaskList: ApprovalItem[] = []
    /** 1、获取任务列表====================================================== */
    tasks.forEach((x: { taskName: string; businessKey: string;businessType:string }) => {
      cubeAppTaskList.push({
        title: x.taskName,
        processId: x.businessKey,
        businessType:x.businessType,
      })
    })
    /** 2、创建任务Queen==================================================== */
    await Promise.all(cubeAppTaskList.map(async e => { await this.taskDataHandle(e) }))
    /** 3、若是否需要手写签名或者审批意见则阻断================================== */
    if (this.needApprovalSign || this.needApprovalText) return true
    return false
  }
}
