export const useLoginHook = () => {

  /** 系统标题 */ 
  const systemName = (()=>{
    let configName = window.config.systemName ? window.config.systemName : '开河孪生智能管理平台'
    return configName
  })()


  return {
    systemName,
  }
}