import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { UeClient } from '@ghcloud/cube-visual-sdk'
import { CallMediaType, CallStatus } from '@ghcloud/cube-rtc/src/data/call-define';
import type { UserInfo } from '@ghcloud/cube-ouaa-service'
import { apiProxy as CommunicateService } from '@ghcloud/cube-rtc/src/api/server';
import { message } from 'ant-design-vue';
import { createCallInterface } from '@/pages/utils/communication'
import { CallManager } from '@ghcloud/cube-rtc'
import { useStateStore } from '@/pages/state/use-state-store'
import { cubeOuaaService } from '@/api/service'
import { modelSDK } from '@/pages/model-sdk/sdk'

export interface StepStatus {
  status: string;
  color: string;
}

export interface StepInfo {
  step: number;
  title: string;
  startTime: number;
  processingTime: number;
  status: StepStatus;
  isProcessing: boolean;
}

export interface EmergencyDrillReturn {
  currentStep: Ref<number>;
  steps: Ref<StepInfo[]>;
  totalProcessingTime: ComputedRef<number>;
  formattedTotalTime: ComputedRef<string>;
  defaultWaitTime: Ref<number>;
  startStep: (stepIndex: number, waitTime?: number) => StepInfo;
  completeStep: (stepIndex: number) => StepInfo;
  handleCall: (stepIndex: number, waitTime?: number) => StepInfo;
  handleStart: (stepIndex: number, waitTime?: number) => StepInfo;
  playAnimation: (stepIndex: number, areaName: string) => void;
  formatStepTime: (time: number) => string;
  formatTotalTime: (time: number) => string;
  clearAllTimers: () => void;
  onUnmount: () => void;
  showBuilding: () => void;
}

export const useEmergencyDrill = (): EmergencyDrillReturn => {
  const { globalState, getAreaById } = useStateStore()
  const currentStep = ref(1)

  // 默认等待时间（毫秒）
  const defaultWaitTime = ref(130 * 1000) // 30秒

  const steps = ref<StepInfo[]>([
    {
      step: 1,
      title: '安全报警',
      startTime: 0,
      processingTime: 0,
      status: { status: '待处理', color: 'waiting' },
      isProcessing: false
    },
    {
      step: 2,
      title: '应急疏散',
      startTime: 0,
      processingTime: 0,
      status: { status: '待处理', color: 'waiting' },
      isProcessing: false
    },
    {
      step: 3,
      title: '应急处置',
      startTime: 0,
      processingTime: 0,
      status: { status: '待处理', color: 'waiting' },
      isProcessing: false
    },
    {
      step: 4,
      title: '处置完成',
      startTime: 0,
      processingTime: 0,
      status: { status: '待处理', color: 'waiting' },
      isProcessing: false
    }
  ])

  const totalProcessingTime = computed(() => {
    let lastActiveStepIndex = -1;
    for (let i = 0; i < steps.value.length; i++) {
      if (steps.value[i].status.color === 'finish' || steps.value[i].status.color === 'handing') {
        lastActiveStepIndex = i;
      }
    }
    return steps.value.slice(0, Math.min(lastActiveStepIndex + 1, 3)).reduce((sum, step) => sum + step.processingTime, 0)
  })

  const formatStepTime = (time: number): string => {
    const minutes = Math.floor(time / (60 * 1000))
    const seconds = Math.floor((time % (60 * 1000)) / 1000)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const formatTotalTime = (time: number): string => {
    const minutes = Math.floor(time / (60 * 1000))
    const seconds = Math.floor((time % (60 * 1000)) / 1000)
    return `${minutes}分${seconds}秒`
  }

  const formattedTotalTime = computed(() => {
    return formatTotalTime(totalProcessingTime.value)
  })

  const timers = ref<number[]>([null, null, null, null])

  // 启动步骤
  const startStep = (stepIndex: number, waitTime = defaultWaitTime.value): StepInfo => {
    if (timers.value[stepIndex] !== null) {
      clearTimeout(timers.value[stepIndex])
      timers.value[stepIndex] = null
    }

    // 更新当前步骤状态为处理中
    steps.value[stepIndex].status = { status: '处理中', color: 'handing' }
    steps.value[stepIndex].isProcessing = true
    steps.value[stepIndex].startTime = new Date().getTime()

    // 设置当前激活步骤
    currentStep.value = stepIndex + 1

    // 重置后续步骤状态为待处理
    resetFollowingSteps(stepIndex)

    timers.value[stepIndex] = setTimeout(() => {
      completeStep(stepIndex)
      closeAnimation(stepIndex)
    }, waitTime) as unknown as number

    return steps.value[stepIndex]
  }

  // 完成步骤
  const completeStep = (stepIndex: number): StepInfo => {
    // 清除计时器
    if (timers.value[stepIndex] !== null) {
      clearTimeout(timers.value[stepIndex])
      timers.value[stepIndex] = null
    }
    // 更新步骤状态为已完成
    steps.value[stepIndex].status = { status: '已完成', color: 'finish' }
    steps.value[stepIndex].isProcessing = false

    // 计算处理时长
    if (steps.value[stepIndex].startTime > 0) {
      const now = new Date().getTime()
      steps.value[stepIndex].processingTime = now - steps.value[stepIndex].startTime
    }

    // 如果是第三步完成，自动完成第四步
    if (stepIndex === 2) {
      steps.value[3].status = { status: '已完成', color: 'finish' }
    }

    // 如果不是最后一步，激活下一步
    if (stepIndex < 3) {
      currentStep.value = stepIndex + 2
    }

    return steps.value[stepIndex]
  }
  const closeAnimation = (stepIndex: number): void => {
    // 关闭动画
    const ueClient = UeClient.getInstance();
    const areaName = globalState.business.alarmDetail?.areaName || ''
    const animName = (areaName as string)?.includes('5F')
      ? `Anim_BGL_5F_${stepIndex}`
      : `Anim_JYL_4F_${stepIndex}`

    ueClient.send('stopSequence', { name: animName })
    modelSDK.stopSequenceAll()
  }

  // 重置后续步骤状态
  const resetFollowingSteps = (currentStepIndex: number): void => {
    for (let i = currentStepIndex + 1; i < steps.value.length; i++) {
      steps.value[i].status = { status: '待处理', color: 'waiting' }
      steps.value[i].isProcessing = false
      steps.value[i].processingTime = 0 // 重置处理时长
      steps.value[i].startTime = 0 // 重置开始时间
    }
  }

  const callErrorTimer = ref(null)
  const clickCommunicationButton = async ({ type, stepIndex }: { type: CallMediaType; stepIndex: number; }): Promise<void> => {
    const userInfo = await getUserInfo()
    message.loading('正在呼叫')
    const onlineList = await CommunicateService.cubeCommunicateService.queryOnlineList()
    if (!onlineList.find((item)=>item.id === userInfo.id)){
      message.destroy()
      message.warning('用户不在线')
      if (callErrorTimer.value !== null) {
        clearTimeout(callErrorTimer.value)
        callErrorTimer.value = null
      }
      callErrorTimer.value = setTimeout(()=>{
        completeStep(stepIndex)
        closeAnimation(stepIndex)
      }, 3 * 1000)
    } else {
      message.destroy()
      const callManager = CallManager.getInstance()
      if (type === CallMediaType.audio){
        await callManager.singleCallAudio(userInfo.id)
      } else {
        await callManager.singleCallVideo(userInfo.id)
      }
      message.destroy()
      createCallInterface(userInfo)
      // 挂断通话，自动完成步骤
      callManager.onCallStateChange((callState)=>{
        if (callState.selfUser.callStatus === CallStatus.none) {
          closeAnimation(stepIndex)
          return completeStep(stepIndex)
        }
      })
    }
  }
  const getUserInfo = async (): Promise<UserInfo> => {
    const { globalState } = useStateStore()
    const userId = (globalState.business.alarmDetail?.alarmNotifyUsers as unknown[])?.length > 0 ? globalState.business.alarmDetail?.alarmNotifyUsers[0]?.userId : globalState.business.alarmDetail?.callHandlerUser?.userId
    if (!userId) {
      message.warning('无用户信息!')
      return
    }
    const user = await cubeOuaaService.getPersonInfo(userId)
    return user
  }
  const handleCall = (stepIndex: number, waitTime = defaultWaitTime.value): StepInfo => {
    clickCommunicationButton({ type: CallMediaType.audio, stepIndex: stepIndex })
    return startStep(stepIndex, waitTime)
  }

  const handleStart = (stepIndex: number, waitTime = defaultWaitTime.value): StepInfo => {
    // 如果当前步骤是处理中，则完成步骤
    if (steps.value[stepIndex].isProcessing) {
      closeAnimation(stepIndex)
      return completeStep(stepIndex)
    }
    const result = startStep(stepIndex, waitTime)
    return result
  }
  const showBuilding = (): void => {

    const areaIds = (globalState.business.alarmDetail?.area as string)?.split('-') || []
    const area = getAreaById(areaIds[areaIds.length - 1])
    if (area?.visualizationAreaType === 'FLOOR'){
      const buildingName = getAreaById(area.parentId)?.aliasName
      const params = {
        buildingName,
        floorName: area.aliasName,
      }
      modelSDK.showBuildingFloor(params)
    }
    if (area?.visualizationAreaType === 'BUILDING'){
      modelSDK.showBuilding(area.aliasName)
    }
  }
  const playTimer = ref(null)
  const currentAnimName = ref<string>(null)
  // 停止当前正在播放的动画
  const stopPlay = (): void => {
    if (currentAnimName.value) {
      const ueClient = UeClient.getInstance();
      ueClient.send('stopSequence', { name: currentAnimName.value })
      modelSDK.stopSequenceAll()
      currentAnimName.value = null
    }
  }

  const playAnimation = (stepIndex: number, areaName: string): void => {
    if (playTimer.value !== null) {
      clearTimeout(playTimer.value)
      playTimer.value = null
    }
    stopPlay()
    showBuilding()
    const ueClient = UeClient.getInstance();
    const animName = areaName?.includes('5F')
      ? `Anim_BGL_5F_${stepIndex}`
      : `Anim_JYL_4F_${stepIndex}`

    ueClient.send('playSequence', { name: animName, loop: 10, pauseAtEnd: 5 })
    currentAnimName.value = animName
  }

  const clearAllTimers = (): void => {
    timers.value.forEach((timer, index) => {
      if (timer !== null) {
        clearTimeout(timer)
        timers.value[index] = null
      }
    })
    if (playTimer.value !== null) {
      clearTimeout(playTimer.value)
      playTimer.value = null
    }
    if (callErrorTimer.value !== null) {
      clearTimeout(callErrorTimer.value)
      callErrorTimer.value = null
    }
  }

  const onUnmount = (): void => {
    clearAllTimers()
  }

  return {
    currentStep,
    steps,
    totalProcessingTime,
    formattedTotalTime,
    defaultWaitTime,
    startStep,
    completeStep,
    handleCall,
    handleStart,
    playAnimation,
    formatStepTime,
    formatTotalTime,
    clearAllTimers,
    onUnmount,
    showBuilding
  }
}