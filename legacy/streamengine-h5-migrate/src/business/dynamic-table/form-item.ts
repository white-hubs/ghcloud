import { Component, defineAsyncComponent } from "vue";

import GroupListSync from "../../component/basic/group-List/group-list.vue";
import { attendanceStat } from "../../component/project/attendance-stat-input/componentList";
import { archivesList } from "../../component/project/query-field-input/componentList";
import SelectInputSync from "../../component/project/select-input/select-input.vue";

/* 人员档案 */
type ArchivesInput = Record<string, any>;
const archivesInput: ArchivesInput = {};
for (let index = 0; index < archivesList.length; index++) {
  archivesInput[archivesList[index].name] = defineAsyncComponent(
    async () => import("../../component/project/query-field-input/query-field-input.vue"),
  );
}

/* 考勤数据 */
type AttendanceInput = Record<string, any>;
const attendanceInput: AttendanceInput = {};
for (let index = 0; index < attendanceStat.length; index++) {
  attendanceInput[attendanceStat[index].name] = defineAsyncComponent(
    async () => import("../../component/project/attendance-stat-input/attendance-stat-input.vue"),
  );
}

export const formItems: Record<string, Component> = {
  // 基础组件
  DateTimeRange: defineAsyncComponent(async () => import("../../component/project/date-time-range/date-time-range.vue")),
  TextareaInput: defineAsyncComponent(async () => import("../../component/basic/input/textarea-input.vue")),
  RateInput: defineAsyncComponent(async () => import("../../component/basic/input/rate-input.vue")),
  NumberInput: defineAsyncComponent(async () => import("../../component/basic/input/number-input.vue")),
  DateTime: defineAsyncComponent(async () => import("../../component/project/date-time-picker/date-time-picker.vue")),
  /** 同步加载：嵌套组合容器显隐时减少异步组件竞态 */
  SelectInput: SelectInputSync,
  TextInput: defineAsyncComponent(async () => import("../../component/basic/input/text-input.vue")),
  AmountInput: defineAsyncComponent(async () => import("../../component/basic/input/amount-input.vue")),
  FileUpload: defineAsyncComponent(async () => import("../../component/basic/input/file-upload.vue")),
  GroupList: GroupListSync,
  KeyValueSelect: defineAsyncComponent(async () => import("../../component/basic/input/select-input/key-value-select-input.vue")),
  Description: defineAsyncComponent(async () => import("../../component/basic/description/description.vue")),
  MultipleSelect: defineAsyncComponent(async () => import("../../component/basic/input/select-input/multiple-select-input.vue")),
  CascaderSelect: defineAsyncComponent(async () => import("../../component/basic/input/select-input/cascader-select-input.vue")),
  OutsiderConcat: defineAsyncComponent(async () => import("../../component/basic/input/outsider-concat.vue")),

  // 业务组件
  SponsorInput: defineAsyncComponent(async () => import("../../component/project/sponsor-input/sponsor-input.vue")),
  OvertimeType: defineAsyncComponent(async () => import("../../component/project/overtime-type-select/overtime-type-select.vue")),
  OvertimeLength: defineAsyncComponent(async () => import("../../component/project/overtime-length/overtime-length.vue")),
  VacationType: defineAsyncComponent(async () => import("../../component/project/leave-type-select/leave-type-select.vue")),
  VacationBalance: defineAsyncComponent(async () => import("../../component/project/leave-vacation-balance/leave-vacation-balance.vue")),
  VacationLength: defineAsyncComponent(async () => import("../../component/project/leave-vacation-length/leave-vacation-length.vue")),
  DisposeVacationLength: defineAsyncComponent(
    async () => import("../../component/project/dispose-vacation-length/dispose-vacation-length.vue"),
  ),
  AssociationLeaveForm: defineAsyncComponent(
    async () => import("../../component/project/association-leave-form/association-leave-form.vue"),
  ),
  VacationDate: defineAsyncComponent(async () => import("../../component/project/leave-time-range/leave-time-range.vue")),
  UserPicker: defineAsyncComponent(async () => import("../../component/project/user-picker/user-picker.vue")),
  DeptPicker: defineAsyncComponent(async () => import("../../component/project/dept-picker/dept-picker.vue")),
  SupplementClass: defineAsyncComponent(async () => import("../../component/project/supplement-class/supplement-class.vue")),
  ChangeClass: defineAsyncComponent(async () => import("../../component/project/change-class-select/change-class-select.vue")),
  ChangePerson: defineAsyncComponent(async () => import("../../component/project/change-person-select/change-person-select.vue")),
  PositionList: defineAsyncComponent(async () => import("../../component/project/position-list-select/position-list-select.vue")),
  AppointmentList: defineAsyncComponent(async () => import("../../component/project/appointment-list-select/appointment-list-select.vue")),
  AssessmentResults: defineAsyncComponent(
    async () => import("../../component/project/assessment-results-select/assessment-results-select.vue"),
  ),
  OfficialSealList: defineAsyncComponent(
    async () => import("../../component/project/official-seal-list-select/official-seal-list-select.vue"),
  ),
  FocusWorkList: defineAsyncComponent(async () => import("../../component/project/focus-work-list-select/focus-work-list-select.vue")),
  FocusWorkTypeList: defineAsyncComponent(async () => import("../../component/project/focus-work-type-select/focus-work-type-select.vue")),
  FocusWork: defineAsyncComponent(async () => import("../../component/project/focus-work-input/focus-work-input.vue")),
  FocusWorkStatusList: defineAsyncComponent(
    async () => import("../../component/project/focus-work-status-select/focus-work-status-select.vue"),
  ),
  FocusWorkRequirement: defineAsyncComponent(
    async () => import("../../component/project/focus-work-requirement-input/focus-work-requirement-input.vue"),
  ),
  FocusWorkCompleteTime: defineAsyncComponent(
    async () => import("../../component/project/focus-work-complete-time-input/focus-work-complete-time-input.vue"),
  ),
  DepartureTimeLength: defineAsyncComponent(
    async () => import("../../component/project/departure-time-length-input/departure-time-length-input.vue"),
  ),
  BusinessTripTimeLength: defineAsyncComponent(
    async () => import("../../component/project/business-trip-time-length/business-trip-time-length.vue"),
  ),
  OvertimeCompensation: defineAsyncComponent(
    async () => import("../../component/project/overtime-compensation-select/overtime-compensation-select.vue"),
  ),
  AddAssetTable: defineAsyncComponent(async () => import("../../component/project/add-asset-table/add-asset-table.vue")),
  AssetTypeSelect: defineAsyncComponent(async () => import("../../component/project/asset-type-select/asset-type-select.vue")),
  ChooseAssetTable: defineAsyncComponent(async () => import("../../component/project/choose-asset-table/choose-asset-table.vue")),
  WareHouseSelect: defineAsyncComponent(async () => import("../../component/project/ware-house-select/ware-house-select.vue")),
  ConsumablesEnter: defineAsyncComponent(async () => import("../../component/project/consumables-enter-table/consumables-enter-table.vue")),
  ConsumablesOut: defineAsyncComponent(async () => import("../../component/project/consumables-out-table/consumables-out-table.vue")),
  WorKReportSelect: defineAsyncComponent(async () => import("../../component/project/work-report-select/work-report-select.vue")),
  ProjectName: defineAsyncComponent(async () => import("../../component/project/project-name/project-name.vue")),
  AssetSource: defineAsyncComponent(async () => import("../../component/project/asset-source-select/asset-source-select.vue")),
  AreaList: defineAsyncComponent(async () => import("../../component/project/area-list-select/area-list-select.vue")),
  ScrappingReason: defineAsyncComponent(async () => import("../../component/project/scrapping-reason-select/scrapping-reason-select.vue")),
  AssetIsExpired: defineAsyncComponent(async () => import("../../component/project/asset-is-expired-radio/asset-is-expired-radio.vue")),
  DutyType: defineAsyncComponent(async () => import("../../component/project/duty-type/duty-type.vue")),
  OutSourceCom: defineAsyncComponent(async () => import("../../component/project/outsourcing-com-select/outsourcing-com-select.vue")),
  OutSourceMode: defineAsyncComponent(async () => import("../../component/project/outsourcing-mode-select/outsourcing-com-select.vue")),
  OutSourceHandleResult: defineAsyncComponent(
    async () => import("../../component/project/outsourcing-handle-select/outsourcing-handle-select.vue"),
  ),
  OutSourceResult: defineAsyncComponent(
    async () => import("../../component/project/outsourcing-result-select/outsourcing-result-select.vue"),
  ),
  OutSourceDevice: defineAsyncComponent(
    async () => import("../../component/project/outsourcing-device-select/outsourcing-device-select.vue"),
  ),
  WorkList: defineAsyncComponent(async () => import("../../component/project/work-list/work-list.vue")),
  TelPhone: defineAsyncComponent(async () => import("../../component/project/tel-phone/tel-phone.vue")),
  IDNumber: defineAsyncComponent(async () => import("../../component/project/id-number/id-number.vue")),
  CarId: defineAsyncComponent(async () => import("../../component/project/car-id/car-id.vue")),
  TimePickerRange: defineAsyncComponent(async () => import("../../component/project/time-picker-range/time-picker-range.vue")),

  // 故障报修 & 隐患排查
  ObjectTypeSelect: defineAsyncComponent(async () => import("../../component/project/object-type-select/object-type-select.vue")),
  ObjectSelect: defineAsyncComponent(async () => import("../../component/project/object-select/object-select.vue")),
  // ObjectSelect: defineAsyncComponent(async () => import('../../component/project/target-object-select/target-object-select.vue')),
  TargetObjectSelect: defineAsyncComponent(async () => import("../../component/project/target-object-select/target-object-select.vue")),
  FaultTypeSelect: defineAsyncComponent(async () => import("../../component/project/fault-type-select/fault-type-select.vue")),
  FaultLevelSelect: defineAsyncComponent(async () => import("../../component/project/fault-level-select/fault-level-select.vue")),
  ParkingLevelSelect: defineAsyncComponent(async () => import("../../component/project/parking-level-select/parking-level-select.vue")),
  ViolatorCarNumber: defineAsyncComponent(async () => import("../../component/project/violator-car-number/violator-car-number.vue")),
  ViolatorName: defineAsyncComponent(async () => import("../../component/project/violator-name/violator-name.vue")),
  ViolatorPhone: defineAsyncComponent(async () => import("../../component/project/violator-phone/violator-phone.vue")),
  CarPlateColorSelect: defineAsyncComponent(
    async () => import("../../component/project/car-plate-color-select/car-plate-color-select.vue"),
  ),
  ParkingLotSelect: defineAsyncComponent(async () => import("../../component/project/parking-lot-select/parking-lot-select.vue")),
  FaultComfirmSelect: defineAsyncComponent(async () => import("../../component/project/fault-comfirm-select/fault-comfirm-select.vue")),
  SolutionResult: defineAsyncComponent(async () => import("../../component/project/solution-result/solution-result.vue")),
  ProblemTypeSelect: defineAsyncComponent(async () => import("../../component/project/problem-type-select/problem-type-select.vue")),
  ProblemLevelSelect: defineAsyncComponent(async () => import("../../component/project/problem-level-select/problem-level-select.vue")),
  ProblemComfirmSelect: defineAsyncComponent(
    async () => import("../../component/project/problem-comfirm-select/problem-comfirm-select.vue"),
  ),
  DeviceSelect: defineAsyncComponent(async () => import("../../component/project/device-select/device-select.vue")),
  RelatedDeviceSelect: defineAsyncComponent(async () => import("../../component/project/related-device-select/related-device-select.vue")),
  AlarmRecords: defineAsyncComponent(async () => import("../../component/project/alarm-records/alarm-records.vue")),
  WorkPermitTypeSelect: defineAsyncComponent(
    async () => import("../../component/project/work-permit-type-select/work-permit-type-select.vue"),
  ),
  WorkPermitLevelSelect: defineAsyncComponent(
    async () => import("../../component/project/work-permit-level-select/work-permit-level-select.vue"),
  ),
  WorkPermitRiskCheckItems: defineAsyncComponent(
    async () => import("../../component/project/work-permit-risk-check-items/work-permit-risk-check-items.vue"),
  ),
  WorkPermitAcceptanceItems: defineAsyncComponent(
    async () => import("../../component/project/work-permit-acceptance-items/work-permit-acceptance-items.vue"),
  ),
  RetrofitConfirmSelect: defineAsyncComponent(
    async () => import("../../component/project/retrofit-confirm-select/retrofit-confirm-select.vue"),
  ),
  DeviceStatus: defineAsyncComponent(async () => import("../../component/project/device-status/device-status.vue")),
  DeviceChangeStatus: defineAsyncComponent(async () => import("../../component/project/device-change-status/device-change-status.vue")),
  //小散工程
  RectifyTargetSelect: defineAsyncComponent(async () => import("../../component/project/rectify-target-select/rectify-target-select.vue")),

  ...archivesInput,
  ...attendanceInput,
};

export interface FormItemExpose {
  validate?: () => boolean | string;
}

export type FormItemComponent = Component & FormItemExpose;

/**
 * 表单元素公共 props，每个表单元素均应实现它们
 */
export interface FormItemProps<Deps = []> {
  label: string;
  required: boolean;
  disabled: boolean;
  options: string[];
  dependFormValues: Deps;
  errorMessage: string;
  // 回显模式
  echoMode: boolean;
}

/**
 * 表单提交 object value 类型对应
 * TODO(danke): 该类型定义位置待商榷
 */
export interface FormItemObjectValue {
  id: string;
  name: string;
}
