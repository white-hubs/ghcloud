import { Component, defineAsyncComponent } from "vue";

import { archivesList, attendanceStat } from "./ComponentList";
import SelectInputSync from "./SelectInput.vue";

/*人员档案*/
interface ArchivesInput {
  [key: string]: any;
}
let archivesInput: ArchivesInput = {};
for (let index = 0; index < archivesList.length; index++) {
  archivesInput[archivesList[index].name] = defineAsyncComponent(async () => import("./business/ArchivesInput.vue"));
}
/*考勤数据*/
interface AttendanceStatInput {
  [key: string]: any;
}
let attendanceStatInput: AttendanceStatInput = {};
for (let index = 0; index < attendanceStat.length; index++) {
  attendanceStatInput[attendanceStat[index].name] = defineAsyncComponent(async () => import("./business/AttendanceStat.vue"));
}

export const formItems: Record<string, Component> = {
  TextInput: defineAsyncComponent(async () => import("./TextInput.vue")),
  RateInput: defineAsyncComponent(async () => import("./RateInput.vue")),
  TextareaInput: defineAsyncComponent(async () => import("./TextareaInput.vue")),
  NumberInput: defineAsyncComponent(async () => import("./NumberInput.vue")),
  AmountInput: defineAsyncComponent(async () => import("./AmountInput.vue")),
  /** 同步加载：嵌套组合容器内频繁显隐时，异步组件易产生卸载竞态（subTree 为 null） */
  SelectInput: SelectInputSync,
  MultipleSelect: defineAsyncComponent(async () => import("./MultipleSelect.vue")),
  DateTime: defineAsyncComponent(async () => import("./DateTime.vue")),
  DateTimeRange: defineAsyncComponent(async () => import("./DateTimeRange.vue")),
  FileUpload: defineAsyncComponent(async () => import("./FileUpload.vue")),
  GroupList: defineAsyncComponent(async () => import("./GroupList.vue")),
  Description: defineAsyncComponent(async () => import("./Description.vue")),
  CascaderInput: defineAsyncComponent(async () => import("./CascaderInput.vue")),
  OutsiderConcat: defineAsyncComponent(async () => import("./OutsiderConcat.vue")),
  /**
   * 开关组件
   */
  SwitchSelect: defineAsyncComponent(async () => import("./SwitchSelect.vue")),

  //table组件用的
  KeyValueSelect: defineAsyncComponent(async () => import("./KeyValueSelect.vue")),
  AmountInputForConsumable: defineAsyncComponent(async () => import("../formItems/business/AmountInputForConsumable.vue")),
  ConsumablesOutNumInput: defineAsyncComponent(async () => import("../formItems/business/ConsumablesOutNumInput.vue")),

  // 业务组件
  SponsorInput: defineAsyncComponent(async () => import("./business/SponsorInput.vue")), //发起人
  DeptPicker: defineAsyncComponent(async () => import("./business/DeptPicker.vue")),
  UserPicker: defineAsyncComponent(async () => import("./business/UserPicker.vue")),
  PositionList: defineAsyncComponent(async () => import("./business/PositionList.vue")),
  AppointmentList: defineAsyncComponent(async () => import("./business/AppointmentList.vue")),
  RoleList: defineAsyncComponent(async () => import("./business/RoleList.vue")),
  AssessmentResults: defineAsyncComponent(async () => import("./business/AssessmentResults.vue")),
  OfficialSealList: defineAsyncComponent(async () => import("./business/OfficialSealList.vue")),
  FocusWorkList: defineAsyncComponent(async () => import("./business/FocusWorkList.vue")),
  FocusWorkTypeList: defineAsyncComponent(async () => import("./business/FocusWorkTypeList.vue")),
  WorkList: defineAsyncComponent(async () => import("./business/WorkList.vue")),
  FocusWork: defineAsyncComponent(async () => import("./business/FocusWork.vue")),
  FocusWorkStatusList: defineAsyncComponent(async () => import("./business/FocusWorkStatusList.vue")),
  FocusWorkRequirement: defineAsyncComponent(async () => import("./business/FocusWorkRequirement.vue")),
  FocusWorkCompleteTime: defineAsyncComponent(async () => import("./business/FocusWorkCompleteTime.vue")),
  VacationType: defineAsyncComponent(async () => import("./business/VacationType.vue")),
  VacationBalance: defineAsyncComponent(async () => import("./business/VacationBalance.vue")),
  VacationDate: defineAsyncComponent(async () => import("./business/VacationDate/index.vue")),
  VacationLength: defineAsyncComponent(async () => import("./business/VacationLength.vue")),
  DisposeVacationLength: defineAsyncComponent(async () => import("./business/DisposeVacationLength.vue")),
  ChangeClass: defineAsyncComponent(async () => import("./business/ChangeClass.vue")),
  ChangePerson: defineAsyncComponent(async () => import("./business/ChangePerson.vue")),
  OvertimeType: defineAsyncComponent(async () => import("./business/OvertimeType.vue")),
  OvertimeLength: defineAsyncComponent(async () => import("./business/OvertimeLength.vue")),
  SupplementClass: defineAsyncComponent(async () => import("./business/SupplementClass.vue")),
  DepartureTimeLength: defineAsyncComponent(async () => import("./business/DepartureTimeLength.vue")),
  BusinessTripTimeLength: defineAsyncComponent(async () => import("./business/BusinessTripTimeLength.vue")),
  OvertimeCompensation: defineAsyncComponent(async () => import("./business/OvertimeCompensation.vue")),
  AddAssetTable: defineAsyncComponent(async () => import("./business/AddAssetTable.vue")),
  ChooseAssetTable: defineAsyncComponent(async () => import("./business/ChooseAssetTable.vue")),
  WareHouseSelect: defineAsyncComponent(async () => import("./business/WareHouseSelect.vue")),
  ConsumablesEnter: defineAsyncComponent(async () => import("./business/ConsumablesEnter.vue")),
  ConsumablesOut: defineAsyncComponent(async () => import("./business/ConsumablesOut.vue")),
  WorKReportSelect: defineAsyncComponent(async () => import("./business/WorKReportSelect.vue")),
  AssetSource: defineAsyncComponent(async () => import("./business/AssetSource.vue")),
  AreaList: defineAsyncComponent(async () => import("./business/AreaList.vue")),
  ScrappingReason: defineAsyncComponent(async () => import("./business/ScrappingReason.vue")),
  AssetIsExpired: defineAsyncComponent(async () => import("./business/AssetIsExpired.vue")),
  DutyType: defineAsyncComponent(async () => import("./business/DutyType.vue")),
  ProjectName: defineAsyncComponent(async () => import("./business/ProjectName.vue")),
  ObjectTypeSelect: defineAsyncComponent(async () => import("./business/ObjectTypeSelect.vue")),
  ObjectSelect: defineAsyncComponent(async () => import("./business/ObjectSelect.vue")),
  TargetObjectSelect: defineAsyncComponent(async () => import("./business/TargetObjectSelect.vue")),
  FaultTypeSelect: defineAsyncComponent(async () => import("./business/FaultTypeSelect.vue")),
  FaultLevelSelect: defineAsyncComponent(async () => import("./business/FaultLevelSelect.vue")),
  ParkingLevelSelect: defineAsyncComponent(async () => import("./business/ParkingLevelSelect.vue")),
  ParkingLotSelect: defineAsyncComponent(async () => import("./business/ParkingLotSelect.vue")),
  CarPlateColorSelect: defineAsyncComponent(async () => import("./business/CarPlateColorSelect.vue")),
  ViolatorCarNumber: defineAsyncComponent(async () => import("./business/ViolatorCarNumber.vue")),
  ViolatorName: defineAsyncComponent(async () => import("./business/ViolatorName.vue")),
  ViolatorPhone: defineAsyncComponent(async () => import("./business/ViolatorPhone.vue")),
  SolutionResult: defineAsyncComponent(async () => import("./business/SolutionResult.vue")),
  FaultComfirmSelect: defineAsyncComponent(async () => import("./business/FaultComfirmSelect.vue")),
  ProblemComfirmSelect: defineAsyncComponent(async () => import("./business/ProblemComfirmSelect.vue")),
  ProblemTypeSelect: defineAsyncComponent(async () => import("./business/ProblemTypeSelect.vue")),
  ProblemLevelSelect: defineAsyncComponent(async () => import("./business/ProblemLevelSelect.vue")),
  AssetTypeSelect: defineAsyncComponent(async () => import("./business/AssetTypeSelect.vue")),
  OutSourceMode: defineAsyncComponent(async () => import("./business/OutSourceMode.vue")),
  OutSourceCom: defineAsyncComponent(async () => import("./business/OutSourceCom.vue")),
  OutSourceHandleResult: defineAsyncComponent(async () => import("./business/OutSourceHandResult.vue")),
  OutSourceResult: defineAsyncComponent(async () => import("./business/OutSourceResult.vue")),
  AssociationLeaveForm: defineAsyncComponent(async () => import("./business/AssociationLeaveForm/AssociationLeaveForm.vue")),
  DeviceSelect: defineAsyncComponent(async () => import("./business/DeviceSelect.vue")),
  RelatedDeviceSelect: defineAsyncComponent(async () => import("./business/RelatedDeviceSelect.vue")),
  AlarmRecords: defineAsyncComponent(async () => import("./business/AlarmRecords.vue")),
  WorkPermitTypeSelect: defineAsyncComponent(async () => import("./business/WorkPermitTypeSelect.vue")),
  WorkPermitLevelSelect: defineAsyncComponent(async () => import("./business/WorkPermitLevelSelect.vue")),
  WorkPermitRiskCheckItems: defineAsyncComponent(async () => import("./business/WorkPermitRiskCheckItems.vue")),
  WorkPermitAcceptanceItems: defineAsyncComponent(async () => import("./business/WorkPermitAcceptanceItems.vue")),
  RetrofitConfirmSelect: defineAsyncComponent(async () => import("./business/RetrofitConfirmSelect.vue")),
  DeviceStatus: defineAsyncComponent(async () => import("./business/DeviceStatus.vue")),
  DeviceChangeStatus: defineAsyncComponent(async () => import("./business/DeviceChangeStatus.vue")),
  ...archivesInput,
  ...attendanceStatInput,
  // 新增人事业务组件
  /**
   * 人员类别
   */
  PersonnelCategory: defineAsyncComponent(async () => import("./business/PersonnelCategory.vue")),
  /**
   * 服务期限
   */
  ServicePeriod: defineAsyncComponent(async () => import("./business/ServicePeriod.vue")),
  /**
   * 门禁权限
   */
  AccessPermission: defineAsyncComponent(async () => import("./business/AccessPermission.vue")),
  /**
   * 停车权限
   */
  ParkingPermission: defineAsyncComponent(async () => import("./business/ParkingPermission.vue")),
  /**
   * 电话号码
   */
  TelPhone: defineAsyncComponent(async () => import("./business/TelPhone.vue")),
  /**
   * 身份证号
   */
  IDNumber: defineAsyncComponent(async () => import("./business/IDNumber.vue")),
  /**
   * 身份证号
   */
  CarId: defineAsyncComponent(async () => import("./business/CarId.vue")),
  /**
   * 时间选择区间
   */
  TimePickerRange: defineAsyncComponent(async () => import("./business/TimePickerRange.vue")),
  /**
   * 工程整改对象
   */
  RectifyTargetSelect: defineAsyncComponent(async () => import("./business/RectifyTargetSelect.vue")),
};
