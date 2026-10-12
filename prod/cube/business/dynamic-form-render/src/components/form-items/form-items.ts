import { type Component, defineAsyncComponent } from 'vue'
import { Input, Textarea, InputNumber, Select, DatePicker, DateRangePicker, Switch, RadioGroup, CheckboxGroup, TimeRangePicker, Cascader, TreeSelect, InputPassword } from '@ghcloud/cube-ui'
import { FileUpload, UserPickerInput } from '@ghcloud/generic-component'

export const FormItems: Record<string, Component> = {
  TextInput: defineAsyncComponent(async () => Input),
  TextareaInput: defineAsyncComponent(async () => Textarea),
  NumberInput: defineAsyncComponent(async () => InputNumber),
  PasswordInput: defineAsyncComponent(async () => InputPassword),
  SelectInput: defineAsyncComponent(async () => Select),
  DateTime: defineAsyncComponent(async () => DatePicker),
  DateTimeRange: defineAsyncComponent(async () => DateRangePicker),
  RadioGroup: defineAsyncComponent(async () => RadioGroup),
  CheckboxGroup: defineAsyncComponent(async () => CheckboxGroup),
  Switch: defineAsyncComponent(async () => Switch),
  UserPickerInput: defineAsyncComponent(async () => UserPickerInput),
  TimeRange: defineAsyncComponent(async () => TimeRangePicker),
  Cascader: defineAsyncComponent(async () => Cascader),
  TreeSelect: defineAsyncComponent(async () => TreeSelect),
  FileUpload: defineAsyncComponent(async () => FileUpload),
}
