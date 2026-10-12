import AppRender from './AppRender';
import AppActionColumn from './AppActionColumn';
import AppClipboard from './AppClipboard';
import AppInputSearch from './AppInputSearch';
import AppLabel from './AppLabel';
import AppModal from './AppModal';
import AppLinkBtn from './AppLinkBtn';
import AppLinkText from './AppLinkText';
import AppLinkBtnDelete from './AppLinkBtnDelete';
import AppLinkBtnConfirm from './AppLinkBtnConfirm';
import AppRouterLink from './AppRouterLink';
import AppTextarea from './AppTextarea';
import AppEnumSelect from './AppEnum/Select';
import AppEnumRadio from './AppEnum/Radio';
import AppEnumDisplay from './AppEnum/Display';
import AppEnumTag from './AppEnum/Tag';
import AppDatePicker from './AppDatePicker';
import AppBooleanSelect from './select/AppBooleanSelect';
import AppKeepAlive from './AppKeepAlive';
import AppPageLayout from './layout/AppPageLayout';
import AppTablePageLayout from './layout/AppTablePageLayout';
import AppFilter from './AppFilter';
import AppFilterPopover from './AppFilter/PopoverFilter';
import AppSearch from './AppSearch';

import AppDisplay from './display/AppDisplay';
import AppPhoneDisplay from './display/AppPhoneDisplay';
import AppIDCardDisplay from './display/AppIDCardDisplay';
import AppPrivacyNumber from './display/AppPrivacyNumber';
import AppCurrencyDisplay from './display/AppCurrencyDisplay';
import AppDateDisplay from './display/AppDateDisplay';
import AppFileSizeDisplay from './display/AppFileSizeDisplay';
import AppDetailItem from './AppDetailItem';
import AppDeptDisplay from './display/AppDeptDisplay';
import AppItemDisplay from './display/AppItemDisplay';

import AppTable from './AppTable';
import AppCustomTable from './AppTable/AppCustomTable';

import AppForm from './AppForm';
import AppImg from './AppImg';
import AppRoleSelect from './select/AppRoleSelect';
import AppDictSelect from './AppDict/Select';
import AppDictDisplay from './AppDict/Display';
import AppNewDictDisplay from './AppDict/NewDisplay.vue';

import AppUserSelect from './select/AppUserSelect';
import AppUserSelect1 from './select/AppUserSelect1';
import AppUserDisplay from './display/AppUserDisplay';
import AppRecordVideoDisplay from './display/AppRecordVideoDisplay';
import AppPostDisplay from './display/AppPostDisplay'; // 岗位展示
import AppEnabledDisplay from './display/AppEnabledDisplay';
import AppCurrentTime from '@/components/global/AppCurrentTime';

import AppRemoteSelect from './select/AppRemoteSelect'; // 通用select
import AppRemoteSearchSelect from './select/AppRemoteSearchSelect'; // 通用select
import AppCollectionSelect from './select/AppCollectionSelect'; // 流程会签人,岗 select
import AppTreeSelect from './select/AppTreeSelect'; // 通用 树形结构 select
import AppRemoteDialogSelect from './select/AppRemoteDialogSelect'; // 通用弹窗列表选择
import AppAreaSelect from './select/AppAreaSelect'; // 区域专用下拉选择
import AppCascader from './select/AppCascader'; // 区域专用级联下拉
import AppTimeRangeSelect from './select/AppTimeRangeSelect'; // 时间范围
import AppRateRangeSelect from './select/AppRateRangeSelect'; // 数字比例范围
import AppMultipleSelect from './select/AppMultipleSelect'; // 通用自定义多选框
import AppSwitch from './select/AppSwitch'; // 通用自定义多选框

import AppCard from './AppCard'; // 通用卡片样式
import AppCardBaseInfo from './AppCard/baseInfo'; // 通用卡片样式

import AppUploadImgs from './upload/imgs'; // 上传复数张图片
import AppImgsDisplay from './display/AppImgsDisplay';
import AppUploadFiles from './upload/files'; // 上传复数文件
import AppFilesDisplay from './display/AppFilesDisplay';
import AppVideosDisplay from './display/AppVideosDisplay';
import AppManualUpload from './upload/manual';
import AppSearchQrcode from './AppSearchQrcode';
import AppAreaCascader from './AppAreaCascader.vue';

// GIS 选择
import AppGisSelect from './select/gis';
import AppGisDisplay from './display/gis';

// 距现在的时间
import AppTimeFormNow from './display/fromNow';
// 年选择器
import AppYearPicker from './select/AppYearPicker';

// 模型选择器
import AppModelSelect from './select/AppModelSelect';

// meterChart
import AppMeterChart from './charts/meterChart';
import AppMeterChart3 from './charts/meterChart3';

// 生成二维码
import QRCode from './QRCode';
// 图标选择器
import AppIconSelect from './AppIcon/select';
import AppIconDisplay from './AppIcon/display';

// 滚动内容
import AppSeamlessScroll from './AppSeamlessScroll';

// 设备在线离线
import AppIotDeviceStatus from './display/AppIotDeviceStatus';
//
import AppList from './AppList';
// 步进器 AppStepNumber
import AppStepNumber from './input/StepNumber';
export default {
  AppStepNumber,
  AppList,
  AppIotDeviceStatus,

  AppSeamlessScroll,

  AppKeepAlive,
  AppRender,
  AppActionColumn,
  AppClipboard,
  AppInputSearch,
  AppLabel,
  AppModal,
  AppLinkBtn,
  AppLinkText,
  AppRouterLink,
  AppDisplay,
  AppCurrencyDisplay,
  AppDateDisplay,
  AppFileSizeDisplay,
  AppTextarea,
  AppEnumSelect,
  AppEnumRadio,
  AppEnumDisplay,
  AppEnumTag,
  AppDatePicker,
  AppLinkBtnDelete,
  AppLinkBtnConfirm,
  AppBooleanSelect,
  AppPageLayout,
  AppTablePageLayout,

  AppTable,
  AppCustomTable,

  AppFilter,
  AppFilterPopover,
  AppSearch,

  AppPhoneDisplay,
  AppPrivacyNumber,
  AppIDCardDisplay,
  AppForm,
  AppImg,
  AppDetailItem,
  AppCurrentTime,

  AppRemoteSelect, // 通用select
  AppRemoteSearchSelect, // 可以搜索的select
  AppCollectionSelect, // 通用select
  AppTreeSelect, // 通用 树形结构 select
  AppRemoteDialogSelect, // 通用弹窗列表选择
  AppAreaSelect,
  AppCascader,
  AppTimeRangeSelect,
  AppRateRangeSelect,
  AppMultipleSelect,
  AppSwitch,

  AppRoleSelect,
  AppDictSelect,
  AppDictDisplay,
  AppNewDictDisplay,
  AppDeptDisplay,
  AppUserSelect,
  AppUserSelect1,
  AppUserDisplay,
  AppRecordVideoDisplay,
  AppPostDisplay,
  AppEnabledDisplay,
  AppItemDisplay,

  AppCard,
  AppCardBaseInfo,

  AppManualUpload, // 手动上传
  AppUploadImgs,
  AppImgsDisplay,
  AppUploadFiles,
  AppFilesDisplay,
  AppVideosDisplay,

  AppGisSelect,
  AppGisDisplay,

  AppTimeFormNow,
  AppYearPicker,

  AppModelSelect,

  AppMeterChart,
  AppMeterChart3,

  QRCode,

  AppIconSelect,
  AppIconDisplay,
  AppSearchQrcode,
  AppAreaCascader,
};
