/**
 * 消杀任务项接口定义
 */
export interface DisinfectionTaskItem {
  /**
   * 任务ID
   */
  id?: number | null;

  /**
   * 消杀区域
   */
  taskAreaId: string | null;

  /**
   * 消杀频次
   */
  disinfectionFrequency: string;

  notificationType: string | null;
  // 小组
  notificationGroupId: string | null;
  // 部门
  notificationDeptId: string | null;
  // 岗位
  notificationPostId: string | null;
  // 角色
  notificationRoleId: string | null;

  value1: string | null;
  value2: string | null;
  userTypeOptions: { label: string; value: string; }[];
  roleOptions: { label: string; value: string; }[];

  notificationGroupName?: string | null;
  notificationDeptName?: string | null;
  notificationPostName?: string | null;
  notificationRoleName?: string | null;
}