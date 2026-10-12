import { Alert } from "./components/alert/alert";
import { Breadcrumb, BreadcrumbItem } from "./components/bread-crumb/bread-crumb";
import { Button } from "./components/button/button";
import { Calendar } from "./components/calendar/calendar";
import { Card, CardMeta } from "./components/card/card";
import { Cascader } from "./components/cascader/cascader";
import CheckboxGroup from "./components/checkbox-group/checkbox-group";
import Checkbox from "./components/checkbox/checkbox";
import ConfigProvider from "./components/config-provider/config-provider";
import DatePicker from "./components/date-picker/date-picker";
import DateRangePicker from "./components/date-range-picker/date-range-picker";
import { DropDown } from "./components/dropdown/dropdown";
import { Empty } from "./components/empty/empty";
import FormItem from "./components/form-item/form-item";
import Form, { type RuleObject, type FormExpose } from "./components/form/form";
import { CubeIcon } from "./components/icon/icon";
import { Image } from "./components/image/image";
import InputNumber from "./components/input-number/input-number";
import InputPassword from "./components/input-password/input-password";
import { InputSearch } from "./components/input-search/input-search";
import Input from "./components/input/input";
import { Layout, LayoutSider, LayoutHeader, LayoutContent } from "./components/layout/layout";
import { Menu, MenuItem, SubMenu } from "./components/menu/menu";
import Modal from "./components/modal/modal";
import Page from "./components/page/page";
import PopConfirm from "./components/pop-confirm/pop-confirm";
import PopOver from "./components/pop-over/pop-over";
import RadioGroup from "./components/radio-group/radio-group";
import Radio from "./components/radio/radio";
import RadioButton from "./components/radio/radio-button";
import Select from "./components/select/select";
import SelectOption from "./components/select/select-option";
import { Space } from "./components/space/space";
import Step from "./components/step";
import Steps from "./components/steps";
import { Switch } from "./components/switch/switch";
import Table from "./components/table/table";
import { Tag } from "./components/tag/tag";
import Textarea from "./components/textarea/textarea";
import TimeLineItem from "./components/time-line-item/time-line-item";
import TimeLine from "./components/time-line/time-line";
import TimePicker from "./components/time-picker/time-picker";
import TimeRangePicker from "./components/time-range-picker/time-range-picker";
import { Tooltip } from "./components/tooltip/index";
import { TreeSelect } from "./components/tree-select/tree-select";
import { Tree } from "./components/tree/tree";
import UploadDragger from "./components/upload-dragger/upload-dragger";
import UploadBase from "./components/upload/upload";

/** 与 ant-design-vue 一致：`Upload.Dragger` 指向拖拽上传子组件 */
type UploadWithDragger = typeof UploadBase & { Dragger: typeof UploadDragger };
const Upload = UploadBase as UploadWithDragger;
Upload.Dragger = UploadDragger;
import {
  Result,
  message,
  Modal as AntModal,
  TableSummaryRow,
  TableSummaryCell,
  TypographyText,
  TableSummary,
  notification,
} from "ant-design-vue";
import "ant-design-vue/es/message/style";
import "ant-design-vue/es/notification/style";
import "ant-design-vue/es/modal/style";
import type { FormInstance, UploadFile, UploadChangeParam, TreeProps } from "ant-design-vue";
import type { UploadRequestOption } from "ant-design-vue/es/vc-upload/interface";
export * from "@ant-design/icons-vue";
import type { ColumnType } from "ant-design-vue/es/table";
import type { EventDataNode, DataNode } from "ant-design-vue/es/tree";
import type { FileType } from "ant-design-vue/es/upload/interface";
import type { PickerMode } from "ant-design-vue/es/vc-picker/interface";

import { Col } from "./components/col/col";
import { Descriptions, DescriptionsItem } from "./components/descriptions/descriptions";
import { ImagePreviewGroup } from "./components/image-preview-group/image-preview-group";
import { Progress } from "./components/progress/progress";
import { Row } from "./components/row/row";
import { Skeleton } from "./components/skeleton/skeleton";
import { Slider } from "./components/slider/slider";
import { Spin } from "./components/spin/spin";
export { Tabs } from "./components/tabs/tabs";
export { TabPane } from "./components/tabs/tabs-pane";
export { Avatar } from "./components/avatar/avatar";
export { Badge } from "./components/badge/badge";
export { Drawer } from "./components/drawer/drawer";
export {
  ImagePreviewGroup,
  Step,
  Steps,
  TimeLineItem,
  TimeLine,
  Descriptions,
  DescriptionsItem,
  Space,
  Alert,
  Row,
  Col,
  type PickerMode,
  type EventDataNode,
  type DataNode,
  type FormInstance,
  InputPassword,
  TimeRangePicker,
  TimePicker,
  Result,
  Button,
  Input,
  Tooltip,
  InputNumber,
  Textarea,
  Select,
  SelectOption,
  DatePicker,
  DateRangePicker,
  Upload,
  UploadDragger,
  Form,
  FormItem,
  Table,
  PopOver,
  Cascader,
  Skeleton,
  Page,
  ConfigProvider,
  Modal,
  RadioGroup,
  Radio,
  RadioButton,
  CheckboxGroup,
  Checkbox,
  PopConfirm,
  MenuItem,
  Menu,
  SubMenu,
  Switch,
  Empty,
  Image,
  CardMeta,
  Card,
  DropDown,
  TreeSelect,
  Tree,
  Tag,
  InputSearch,
  Layout,
  LayoutSider,
  LayoutHeader,
  LayoutContent,
  Breadcrumb,
  BreadcrumbItem,
  Calendar,
  Slider,

  // 消息提示
  message,
  notification,
  AntModal,
  Spin,
  Progress,
  TypographyText,
  TableSummaryRow,
  TableSummaryCell,
  TableSummary,
};

/** Ant Design Vue 命名习惯的别名，等价于 `UploadDragger` */
export { UploadDragger as Dragger };

export { Divider } from "./components/divider/divider";
export { CubeIcon };
export { DEFAULT_CUBE_ICONFONT_URL, loadCubeIconfont, type LoadCubeIconfontOptions } from "./components/icon/iconfont-loader";
export type { FormExpose, RuleObject, UploadFile, UploadChangeParam, UploadRequestOption, FileType, TreeProps, ColumnType };
