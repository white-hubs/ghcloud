let TextInput = () => import("./components/TextInput.vue");
let NumberInput = () => import("./components/NumberInput.vue");
let AmountInput = () => import("./components/AmountInput.vue");
let TextareaInput = () => import("./components/TextareaInput.vue");
let SelectInput = () => import("./components/SelectInput.vue");
let MultipleSelect = () => import("./components/MultipleSelect.vue");
let DateTime = () => import("./components/DateTime.vue");
let DateTimeRange = () => import("./components/DateTimeRange.vue");
let TimePickerRange = () => import("./components/TimePickerRange.vue");
let RateInput = () => import("./components/RateInput.vue");
let SwitchSelect = () => import("./components/SwitchSelect.vue");
let RelatedDeviceSelect = () => import("./components/ObjectTypeSelect.vue");
let AlarmRecords = () => import("./components/AlarmRecords.vue");

let Description = () => import("./components/Description.vue");
let ImageUpload = () => import("./components/ImageUpload.vue");
let FileUpload = () => import("./components/FileUpload.vue");
let Location = () => import("./components/Location.vue");
let MoneyInput = () => import("./components/MoneyInput.vue");
let DeptPicker = () => import("./components/DeptPicker.vue");
let UserPicker = () => import("./components/UserPicker.vue");
let SignPanel = () => import("./components/SignPannel.vue");

let SpanLayout = () => import("./components/SpanLayout.vue");
let GroupList = () => import("./components/GroupList.vue");
let TableList = () => import("./components/TableList.vue");
let OutsiderConcat = () => import("./components/OutsiderConcat.vue");

let SponsorInput = () => import("./components/SponsorInput.vue");

let OvertimeType = () => import("./components/OvertimeType.vue");
let OvertimeLength = () => import("./components/OvertimeLength.vue");
let OvertimeCompensation = () => import("./components/OvertimeCompensation.vue"); //加班补偿
let DepartureTimeLength = () => import("./components/DepartureTimeLength.vue"); //离岗时长
let BusinessTripTimeLength = () => import("./components/DepartureTimeLength.vue"); //离岗时长
let VacationType = () => import("./components/VacationType.vue");
let VacationDate = () => import("./components/VacationDate.vue");
let DutyType = () => import("./components/DutyType.vue");

let ChangeClass = () => import("./components/ChangeClass.vue");
let ChangePerson = () => import("./components/ChangePerson.vue");

let SupplementClass = () => import("./components/SupplementClass.vue");

import _ from "lodash";

import { archivesList, attendanceStat } from "./ComponentList";
import ArchivesInput from "./components/ArchivesInput.vue";
import AttendanceStat from "./components/AttendanceStat.vue";
/*人员档案*/
let archivesInput = {};
let cps = ArchivesInput;
for (let index = 0; index < archivesList.length; index++) {
  let item = _.cloneDeep(cps);
  item.name = archivesList[index].name;
  item.props.attr.default = archivesList[index].attr;
  item.props.placeholder.default = archivesList[index].placeholder;
  archivesInput[archivesList[index].name] = item;
}

//人事管理
let PositionList = () => import("./components/PositionList.vue");
let AppointmentList = () => import("./components/AppointmentList.vue");
let PersonnelCategory = () => import("./components/PersonnelCategory.vue");
let ServicePeriod = () => import("./components/ServicePeriod.vue");
let AssessmentResults = () => import("./components/AssessmentResults.vue");
let AccessPermission = () => import("./components/AccessPermission.vue");
let ParkingPermission = () => import("./components/ParkingPermission.vue");
let IDNumber = () => import("./components/IDNumber.vue");
let TelPhone = () => import("./components/TelPhone.vue");
let CarId = () => import("./components/CarId.vue");
let RoleList = () => import("./components/RoleList.vue");
// let PermissionManagement=()=>import('./components/PermissionManagement.vue')
//考勤数据
let attendanceStatInput = {};
cps = AttendanceStat;
for (let index = 0; index < attendanceStat.length; index++) {
  let item = _.cloneDeep(cps);
  item.name = attendanceStat[index].name;
  attendanceStatInput[attendanceStat[index].name] = item;
}

//行政管理
let OfficialSealList = () => import("./components/OfficialSealList.vue"); //印章管理
let FocusWorkTypeList = () => import("./components/FocusWorkTypeList.vue"); //督办事项列表
let FocusWork = () => import("./components/FocusWork.vue"); //督办事项
let FocusWorkList = () => import("./components/FocusWorkList.vue"); //督办事项选择
let FocusWorkStatusList = () => import("./components/FocusWorkStatusList.vue"); //督办事项状态选择
let FocusWorkRequirement = () => import("./components/FocusWorkRequirement.vue"); //督办事项工作要求
let FocusWorkCompleteTime = () => import("./components/FocusWorkCompleteTime.vue"); //督办事项完成时间
let WorkList = () => import("./components/WorkList.vue"); //事项状态列表

//资产管理
let AssetSource = () => import("./components/AssetSource.vue"); // 资产来源
let AssetTypeSelect = () => import("./components/AssetTypeSelect.vue"); // 资产分类
let AddAssetTable = () => import("./components/AddAssetTable.vue"); // 添加资产
let ChooseAssetTable = () => import("./components/ChooseAssetTable.vue"); // 选择资产
let WareHouseSelect = () => import("./components/WareHouseSelect.vue"); // 选择资产
let ConsumablesEnter = () => import("./components/ConsumablesEnter.vue"); // 耗材入库
let ConsumablesOut = () => import("./components/ConsumablesOut.vue"); // 耗材出库
let AreaList = () => import("./components/AreaList.vue"); // 区域选择
let ScrappingReason = () => import("./components/ScrappingReason.vue"); // 报废原因
let AssetIsExpired = () => import("./components/AssetIsExpired.vue"); // 报废原因

//工作汇报
let WorKReportSelect = () => import("./components/WorKReportSelect.vue");

//小散工程
let ProjectName = () => import("./components/ProjectName.vue"); //工程名称
let RectifyTargetSelect = () => import("./components/RectifyTargetSelect.vue"); //整改对象
/**委外 */
let OutSourceCom = () => import("./components/OutSourceCom.vue");
let OutSourceMode = () => import("./components/OutSourceMode.vue");
let OutSourceHandleResult = () => import("./components/OutSourceHandleResult.vue");
let OutSourceResult = () => import("./components/OutSourceComResult.vue");

// 隐患排查 & 故障报修 & 投诉建议
let ObjectTypeSelect = () => import("./components/ObjectTypeSelect.vue"); //对象类型
let ObjectSelect = () => import("./components/ObjectTypeSelect.vue"); //对象选择 隐患对象、故障对象
let TargetObjectSelect = () => import("./components/ObjectTypeSelect.vue"); // 对象类型和对象列表合并
let SolutionResult = () => import("./components/ObjectTypeSelect.vue"); //解决结果
let ProblemTypeSelect = () => import("./components/ObjectTypeSelect.vue"); //隐患类型
let FaultTypeSelect = () => import("./components/ObjectTypeSelect.vue"); //故障类型
let ProblemLevelSelect = () => import("./components/ObjectTypeSelect.vue"); //隐患级别
let FaultLevelSelect = () => import("./components/ObjectTypeSelect.vue"); //隐患级别
let ProblemComfirmSelect = () => import("./components/ObjectTypeSelect.vue"); //隐患确认
let FaultComfirmSelect = () => import("./components/ObjectTypeSelect.vue"); //故障级别

// 作业管理
let WorkPermitTypeSelect = () => import("./components/WorkPermitTypeSelect.vue");
let WorkPermitLevelSelect = () => import("./components/WorkPermitLevelSelect.vue");
let WorkPermitAcceptanceItems = () => import("./components/WorkPermitAcceptanceItems.vue");
let WorkPermitRiskCheckItems = () => import("./components/WorkPermitRiskCheckItems.vue");

// 停车管理
let ParkingLotSelect = () => import("./components/ParkingLotSelect.vue"); // 停车场选择
let CarPlateColorSelect = () => import("./components/CarPlateColorSelect.vue"); // 车牌颜色选择
let ParkingLevelSelect = () => import("./components/ParkingLevelSelect.vue"); // 违停程度（保留原有）
let ViolatorCarNumber = () => import("./components/ViolatorCarNumber.vue"); //车主车牌号
let ViolatorName = () => import("./components/ViolatorName.vue"); //车主姓名
let ViolatorPhone = () => import("./components/ViolatorPhone.vue"); //车主联系方式

// 更新改造
let DeviceSelect = () => import("./components/ObjectTypeSelect.vue"); //设备选择
let RetrofitConfirmSelect = () => import("./components/ObjectTypeSelect.vue"); //设备选择
let DeviceStatus = () => import("./components/ObjectTypeSelect.vue"); //改造前状态
let DeviceChangeStatus = () => import("./components/ObjectTypeSelect.vue"); //改造后状态

export default {
  //基础组件
  TextInput,
  NumberInput,
  AmountInput,
  TextareaInput,
  SelectInput,
  MultipleSelect,
  DateTime,
  DateTimeRange,
  TimePickerRange,
  UserPicker,
  DeptPicker,
  RateInput,
  SwitchSelect,
  RelatedDeviceSelect,
  AlarmRecords,
  OutsiderConcat,
  //高级组件
  Description,
  FileUpload,
  ImageUpload,
  MoneyInput,
  Location,
  SignPanel,
  SpanLayout,
  TableList,
  GroupList,
  //人员档案
  ...archivesInput,
  SponsorInput,
  //考勤管理
  OvertimeType,
  OvertimeLength,
  DutyType,
  OvertimeCompensation,
  DepartureTimeLength,
  BusinessTripTimeLength,
  VacationType,
  VacationDate,
  ChangeClass,
  ChangePerson,
  SupplementClass,
  VacationBalance: NumberInput,
  VacationLength: NumberInput,
  DisposeVacationLength: NumberInput,
  AssociationLeaveForm: SelectInput,
  PositionList,
  IDNumber,
  TelPhone,
  CarId,
  RoleList,
  ServicePeriod,
  PersonnelCategory,
  AppointmentList,
  AssessmentResults,
  // 考勤数据
  ...attendanceStatInput,
  OfficialSealList,
  FocusWorkTypeList,
  // PermissionManagement,
  WorkList,
  AccessPermission,
  ParkingPermission,
  FocusWork,
  FocusWorkStatusList,
  FocusWorkList,
  FocusWorkRequirement,
  FocusWorkCompleteTime,
  // 资产管理
  AddAssetTable,
  AssetTypeSelect,
  ChooseAssetTable,
  ConsumablesEnter,
  ConsumablesOut,
  WareHouseSelect,
  WorKReportSelect,
  AssetSource,
  AreaList,
  ScrappingReason,
  AssetIsExpired,
  ProjectName,
  OutSourceCom,
  OutSourceMode,
  OutSourceHandleResult,
  OutSourceResult,
  ObjectTypeSelect,
  ObjectSelect,
  TargetObjectSelect,
  SolutionResult,
  ProblemTypeSelect,
  FaultTypeSelect,
  ProblemLevelSelect,
  FaultLevelSelect,
  ParkingLotSelect,
  CarPlateColorSelect,
  ParkingLevelSelect,
  ViolatorCarNumber,
  ViolatorName,
  ViolatorPhone,
  ProblemComfirmSelect,
  FaultComfirmSelect,
  WorkPermitTypeSelect,
  WorkPermitLevelSelect,
  WorkPermitAcceptanceItems,
  WorkPermitRiskCheckItems,
  DeviceSelect,
  RetrofitConfirmSelect,
  DeviceStatus,
  DeviceChangeStatus,
  RectifyTargetSelect,
};
