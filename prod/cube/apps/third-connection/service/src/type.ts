export interface ClassInfoItem {
  // 班级人数
  num: number; 
  teas_jwgl_bjgl_id?: string; 
  id?: string; 
  // 班级名称
  name: string; 
}
export interface ClassTopItem {
  value: number; 
  name: string; 
}
export interface TreadListItem {
  // 培训人数
  trainNumber: number; 
  // 班次数量
  classNumber: number; 
  year: string;
}
// 定义整体 data 的类型
export interface DataOverviewData {
  classTopList: ClassTopItem[];
  treadList: TreadListItem[];
  // 班级信息数组
  classInfo: ClassInfoItem[]; 
  // 教职工人数
  jzg_num: number; 
  // 未立项数量
  wlx: number; 
  // 未结项数量
  wjx: number; 
  // 行政学院班数量
  swdx_num: number; 
  // 立项数量
  lx: number; 
  // 委托办班人数
  wtbb_xy_num: number; 
  // 结项数量
  jx: number; 
  // 委托办班数量
  wtbb_num: number; 
  // 累计培训人员
  lj_xy_num: number; 
  // 班次数量
  bj_num: number; 
  // 社会主义学院培训人数
  shzyxy_xy_num: number; 
  // 社会主义学院班数量
  shzyxy_num: number; 
  // 当前年度培训人员
  year_xy_num: number; 
  // 行政学院培训人数
  swdx_xy_num: number; 
  // 在校人员
  zx_xy_num: number; 
  // 组织机构数量
  jg_num: number; 
}
