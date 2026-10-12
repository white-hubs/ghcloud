export interface FormItem {
  "name": string;
  "label": string;
  "props": Record<string, string | number | boolean | undefined | DataType | Record<string, unknown>[]>;
  "key"?: string;
  "condition": {
    type: 'ALWAYS' | 'CONDITION';
    value?: [string | undefined, string, unknown];
  };
}


export enum DataType {
  STRING = 'string',
  INT = 'int',
  BOOLEAN = 'boolean',
  FLOAT = 'float',
  DOUBLE = 'double',
  ENUM = 'enum',
  UNDEFINED = ''
}

export const dataTypeOptions: { label: string;value: DataType; }[] = [
  {
    label: "int(整型)",
    value: DataType.INT
  },
  {
    label: "string(字符类型）",
    value: DataType.STRING
  },
  {
    label: "boolean(布尔型)",
    value: DataType.BOOLEAN
  },
  {
    label: "float(单精度)",
    value: DataType.FLOAT
  },
  {
    label: "double(双精度)",
    value: DataType.DOUBLE
  },
  {
    label: "enum(枚举)",
    value: DataType.ENUM
  }
]

export const widgetDefine: FormItem[] = [
  {
    name: 'textAlert',
    label: '文本提示',
    props: {
      value: '这是一个文本提示',
      dataType: DataType.UNDEFINED,
      required: false,
      code: ''
    },
    condition: {
      type: 'ALWAYS'
    }
  },
  {
    name: 'input',
    label: '输入框',
    props: {
      value: undefined,
      placeholder: '请输入内容',
      dataType: DataType.STRING,
      required: false,
      code: ''
    },
    condition: {
      type: 'ALWAYS'
    }
  },
  {
    name: 'select',
    label: '下拉框',
    props: {
      value: undefined,
      options: [
        { label: '选项1', value: 1 },
        { label: '选项2', value: 2 },
      ],
      placeholder: '请选择',
      dataType: DataType.STRING,
      required: false,
      code: ''
    },
    condition: {
      type: 'ALWAYS'
    }
  },
  {
    name: 'radioGroup',
    label: '单选框',
    props: {
      value: undefined,
      options: [
        { label: '选项1', value: 1 },
        { label: '选项2', value: 2 },
      ],
      placeholder: '请选择',
      dataType: DataType.STRING,
      required: false,
      code: ''
    },
    condition: {
      type: 'ALWAYS'
    }
  },
  {
    name: 'checkboxGroup',
    label: '复选框',
    props: {
      value: undefined,
      options: [
        { label: '选项1', value: 1 },
        { label: '选项2', value: 2 },
      ],
      placeholder: '请选择',
      dataType: DataType.STRING,
      required: false,
      code: ''
    },
    condition: {
      type: 'ALWAYS'
    }
  },
]
