export interface BroadcastPlayRecord {
  /**
   * 广播内容，变量替换后的内容
   */
  broadcastPlayContent: string;
  /**
   * 广播终端，广播设备,多个设备之间以逗号分隔返回
   */
  broadcastPlayDevices: string;
  /**
   * 广播次数
   */
  broadcastPlayNum: string;
  /**
   * 广播模板原内容
   */
  broadcastTemplateContent: string;
  /**
   * 广播模板参数
   */
  broadcastTemplateContentParam: string;
  /**
   * 广播模板名称
   */
  broadcastTemplateName: string;
  /**
   * 广播时间
   */
  broadcastTime: string;
  /**
   * 主键
   */
  id: string;
  /**
   * 操作人部门名称
   */
  operatorByDeptName: string;
  /**
   * 操作人名称
   */
  operatorByName: string;
}
