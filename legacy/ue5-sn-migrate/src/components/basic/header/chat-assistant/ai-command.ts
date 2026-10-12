import { Command, CommandExecuteResult, CubeAIAssistant } from '@ghcloud/cube-ai-assistant-chat/src/register'

export let cubeAIAssistant :CubeAIAssistant|null = null
export const commandMap : Map<string,(params?: Command['params'])=>void>=new Map([])

export const executeCommand = (command:Command):boolean => {
  const commandFunc = commandMap.get(command.action)
  if (commandFunc) {
    commandFunc(command.params)
    return true
  }else{
    // executeCallBack({
    //   callbackId: command.callbackId,
    //   result: 'fail',
    //   message: '未找到指令'
    // })
    return false
  }
}

export const getCubeAIAssistant = (containerDom?: HTMLElement) => {
  if (!cubeAIAssistant || containerDom) {
    cubeAIAssistant = new CubeAIAssistant({
      containerDom,
      entry: '/apps/@ghcloud/cube-ai-assistant-chat?mode=COMMAND&snFlag=true'
      // entry: 'http://localhost:1234?mode=COMMAND&snFlag=true'
    })
  }
  return cubeAIAssistant
}

/** 回复指令执行的结果 */
export const executeCallBack = (callbackParams:CommandExecuteResult) => {
  const instance = getCubeAIAssistant()
  instance.commandExecuteResult(callbackParams)
}
