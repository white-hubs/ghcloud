import TextInput from "./components/TextInput.vue";
import NumberInput from "./components/NumberInput.vue";
import Description from "./components/Description.vue";
import TextareaInput from "./components/TextareaInput.vue";
import SelectInput from "./components/SelectInput.vue";
import MultipleSelect from "./components/MultipleSelect.vue";
import DateTime from "./components/DateTime.vue";
import OvertimeLength from "./components/OvertimeLength.vue";
import OvertimeType from "./components/OvertimeType.vue";
import SponsorInput from "./components/SponsorInput.vue";
import VacationType from "./components/VacationType.vue";
import VacationDate from "./components/VacationDate.vue";
import ChangeClass from "./components/ChangeClass.vue";
import ChangePerson from "./components/ChangePerson.vue";


import _ from "lodash";
import { archivesList } from "./ComponentList";
/*人员档案*/
let archivesInput = {};
const archivesContext = require.context(
  "./components",
  true,
  /ArchivesInput.vue$/,
);
const cps = archivesContext("./ArchivesInput.vue").default;
for (let index = 0; index < archivesList.length; index++) {
  let item = _.cloneDeep(cps);
  item.name = archivesList[index].name;
  item.props.attr.default = archivesList[index].attr;
  item.props.placeholder.default = archivesList[index].placeholder;
  archivesInput[archivesList[index].name] = item;
}
export default {
  // //基础组件
  TextInput,
  NumberInput,
  Description,
  TextareaInput,
  SelectInput,
  MultipleSelect,
  DateTime,
  // DateTime, DateTimeRange, UserPicker, DeptPicker,
  // //高级组件
  // Description, FileUpload, ImageUpload, MoneyInput, Location, SignPanel,
  // SpanLayout, TableList,
  // //人员档案
  ...archivesInput,
  SponsorInput,
  OvertimeLength,
  OvertimeType,
  VacationType,
  VacationDate,
  ChangeClass,
  ChangePerson,
};
