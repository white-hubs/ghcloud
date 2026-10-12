<template>
  <div>
    <el-form label-width="90px" class="config-setting-form">
      <el-form-item label="表单名称">
        <el-input size="small" clearable v-model="form.title" :disabled="form.props.disabled" maxlength="20" show-word-limit />
      </el-form-item>
      <el-form-item label="表单宽度">
        <el-input-number v-model="form.width" :min="1" :max="100" :step="0.01" size="small"></el-input-number>
      </el-form-item>
      <component :is="form.name" v-model="form.props" :id="form.id" :title="form.title" v-if="!NoConfig.includes(form.name)" />
      <el-form-item label="必填项" v-if="form.name === 'ConsumablesOut' || !requireNeedless.includes(form.name)">
        <el-switch v-model="form.props.required"></el-switch>
      </el-form-item>
      <el-form-item label="打印展示" v-if="!requireNeedless.includes(form.name)">
        <el-switch v-model="form.props.showPrint"></el-switch>
      </el-form-item>
    </el-form>
    <!-- <el-empty v-else description="当前组件不支持配置"></el-empty> -->
  </div>
</template>

<script>
import AlarmRecordsConfig from "./config/AlarmRecordsConfig.vue";
import AmountInput from "./config/AmountInputConfig.vue";
import ArchivesInputConfig from "./config/ArchivesInputConfig.vue";
import AreaList from "./config/AreaList.vue";
import CarId from "./config/CarId.vue";
import DateTime from "./config/DateTimeConfig.vue";
import DateTimeRange from "./config/DateTimeRangeConfig.vue";
import Description from "./config/DescriptionConfig.vue";
import FileUpload from "./config/FileUploadConfig.vue";
import GroupList from "./config/GroupListConfig.vue";
import ImageUpload from "./config/ImageUploadConfig.vue";
import MoneyInput from "./config/MoneyInputConfig.vue";
import NumberInput from "./config/NumberInputConfig.vue";
import DeptPicker from "./config/OrgPickerConfig.vue";
import RateInput from "./config/RateInputConfig.vue";
import RelatedDeviceSelect from "./config/RelatedDeviceSelectConfig.vue";
import RoleList from "./config/RoleListConfig.vue";
import MultipleSelect from "./config/SelectInputConfig.vue";
import SelectInput from "./config/SelectInputConfig.vue";
import TableList from "./config/TableListConfig.vue";
import TextareaInput from "./config/TextareaInputConfig.vue";
import TextInput from "./config/TextInputConfig.vue";
import UserPicker from "./config/UserPickerConfig.vue";
import ViolatorName from "./config/ViolatorName.vue";
import ViolatorPhone from "./config/ViolatorPhone.vue";
/*人员档案组件*/
/*人员档案*/
let archivesInput = {};
import { archivesList } from "./ComponentList";
// const archivesContext = require.context('./config', true, /ArchivesInputConfig.vue$/)
const cps = ArchivesInputConfig;
for (let index = 0; index < archivesList.length; index++) {
  let item = _.cloneDeep(cps);
  item.name = archivesList[index].name;
  archivesInput[archivesList[index].name] = item;
}
/*考勤数据*/
let attendanceStatInput = {};
import { attendanceStat } from "./ComponentList";
for (let index = 0; index < attendanceStat.length; index++) {
  let item = _.cloneDeep(cps);
  item.name = attendanceStat[index].name;
  attendanceStatInput[attendanceStat[index].name] = item;
}

import SponsorInput from "./config/ArchivesInputConfig.vue";
import VacationDate from "./config/ArchivesInputConfig.vue";
import CommonConfig from "./config/CommonConfig.vue";
import DepartureTimeLength from "./config/DepartureTimeLength.vue";
import BusinessTripTimeLength from "./config/DepartureTimeLength.vue";
import DisposeVacationLength from "./config/DisposeVacationLength.vue";
import ChangeClass from "./config/DutyConfig.vue";
import OvertimeType from "./config/OnlyPlaceholder.vue";
import ChangePerson from "./config/OnlyPlaceholder.vue";
import OvertimeCompensation from "./config/OvertimeCompensation.vue";
import OvertimeLength from "./config/OvertimeLength.vue";
import ServicePeriod from "./config/ServicePeriodConfig.vue";
import SupplementClass from "./config/SupplementClass.vue";
import VacationLength from "./config/VacationLength.vue";
import VacationType from "./config/VacationType.vue";
import WorkPermitAssociatedItemsConfig from "./config/WorkPermitAssociatedItemsConfig.vue";
import WorkPermitLevelConfig from "./config/WorkPermitLevelConfig.vue";
//不需要额外配置的组件
const NoConfig = [
  "IDNumber",
  "TelPhone",
  "TimePickerRange",
  "PositionList",
  "AssessmentResults",
  "OfficialSealList",
  "FocusWork",
  "FocusWorkList",
  "FocusWorkStatusList",
  "FocusWorkTypeList",
  "AddAssetTable",
  "FocusWorkCompleteTime",
  "WareHouseSelect",
  "SwitchSelect",
  "WorKReportSelect",
  "AssetSource",
  "AssetTypeSelect",
  "ScrappingReason",
  "AssetIsExpired",
  "SponsorInput",
  "AssociationLeaveForm",
  "PersonnelCategory",
  "AccessPermission",
  "ParkingPermission",
  "WorkPermitTypeSelect",
];

//不需要配置必填的组件
const requireNeedless = [
  "Description",
  "GroupList",
  "AddAssetTable",
  "ChooseAssetTable",
  "ConsumablesEnter",
  "ConsumablesOut",
  "AlarmRecords",
];

export default {
  name: "FormComponentConfig",
  components: {
    CarId,
    ViolatorName,
    ViolatorPhone,
    TextInput,
    RateInput,
    AreaList,
    NumberInput,
    AmountInput,
    TextareaInput,
    SelectInput,
    MultipleSelect,
    DateTime,
    DateTimeRange,
    ImageUpload,
    FileUpload,
    Description,
    MoneyInput,
    DeptPicker,
    RoleList,
    UserPicker,
    TableList,
    //人员档案
    ...archivesInput,
    SponsorInput,
    //考勤管理
    OvertimeType,
    OvertimeLength,
    OvertimeCompensation,
    DepartureTimeLength,
    BusinessTripTimeLength,
    VacationType,
    VacationDate,
    ChangeClass,
    ChangePerson,
    SupplementClass,
    ServicePeriod,
    GroupList,
    RelatedDeviceSelect,
    // 借用 SponsorInput 依赖参数配置
    VacationBalance: SponsorInput,
    VacationLength,
    DisposeVacationLength,
    FocusWorkRequirement: SponsorInput,
    // 通用配置
    ConsumablesEnter: CommonConfig,
    ConsumablesOut: CommonConfig,
    ChooseAssetTable: CommonConfig,
    ObjectSelect: CommonConfig,
    TargetObjectSelect: CommonConfig,
    AlarmRecords: AlarmRecordsConfig,
    DeviceStatus: CommonConfig,
    DeviceChangeStatus: CommonConfig,
    OutSourceCom: CommonConfig,
    OutSourceMode: CommonConfig,
    WorkList: CommonConfig,
    WorkPermitAcceptanceItems: WorkPermitAssociatedItemsConfig,
    WorkPermitRiskCheckItems: WorkPermitAssociatedItemsConfig,
    WorkPermitLevelSelect: WorkPermitLevelConfig,

    ...attendanceStatInput,
  },
  props: {},
  computed: {
    form() {
      return this.$store.state.selectFormItem;
    },
  },
  watch: {
    form() {
      if (typeof this.form.width === "undefined") {
        this.form.width = 100;
      }
    },
  },
  data() {
    return {
      NoConfig: NoConfig, // 不需要额外配置
      requireNeedless: requireNeedless, // 不需要配置必填的组件
    };
  },
  methods: {},
};
</script>

<style lang="less" scoped>
.config-setting-form {
  /deep/ .el-form-item {
    position: relative;

    .el-input__count-inner {
      background: transparent;
    }

    .el-input__count {
      position: absolute;
      right: 0;
      background-color: transparent;
      bottom: -27px;
    }
  }
}
</style>
