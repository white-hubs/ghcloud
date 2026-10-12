const Operators = {
  Contains: "Contains",
  NotContains: "NotContains",
  StartsWith: "StartsWith",
  NotStartsWith: "NotStartsWith",
  EndsWith: "EndsWith",
  NotEndsWith: "NotEndsWith",
  Equal: "Equal",
  NotEqual: "NotEqual",
  Less: "Less",
  LessEqual: "LessEqual",
  Greater: "Greater",
  GreaterEqual: "GreaterEqual",
  In: "In",
  NotIn: "NotIn",
  IsNull: "IsNull",
  NotNull: "NotNull",
};

export default Operators;

// 字符串类型的比较操作符
export const StringOperators = [
  Operators.Contains,
  Operators.NotContains,
  Operators.StartsWith,
  Operators.NotStartsWith,
  Operators.EndsWith,
  Operators.NotEndsWith,
  Operators.Equal,
  Operators.NotEqual,
  Operators.IsNull,
  Operators.NotNull,
];
// 数值类型的比较操作符 数字，日期
export const ValueOperators = [
  Operators.Equal,
  Operators.NotEqual,
  Operators.Less,
  Operators.LessEqual,
  Operators.Greater,
  Operators.GreaterEqual,
];

// 编码类型的比较操作符，如：枚举、字典、用户等等
export const CodeOperators = [
  Operators.Equal,
  Operators.NotEqual,
  Operators.IsNull,
  Operators.NotNull,
  Operators.In,
  Operators.NotIn,
];

export const OperatorsDictionary = [
  {
    operator: Operators.Equal,
    label: "等于(=)",
  },
  {
    operator: Operators.NotEqual,
    label: "不等于(!=)",
  },
  {
    operator: Operators.Contains,
    label: "包含",
  },

  {
    operator: Operators.NotContains,
    label: "不包含",
  },

  {
    operator: Operators.StartsWith,
    label: "以...开始",
  },

  {
    operator: Operators.NotStartsWith,
    label: "不...以开始",
  },

  {
    operator: Operators.EndsWith,
    label: "以...结束",
  },

  {
    operator: Operators.NotEndsWith,
    label: "不以...结束",
  },

  {
    operator: Operators.Less,
    label: "小于(<)",
  },
  {
    operator: Operators.LessEqual,
    label: "小于等于(<=)",
  },
  {
    operator: Operators.Greater,
    label: "大于(>)",
  },
  {
    operator: Operators.GreaterEqual,
    label: "大于等于(>=)",
  },
  {
    operator: Operators.In,
    label: "在其中",
  },
  {
    operator: Operators.NotIn,
    label: "不在其中",
  },
  {
    operator: Operators.IsNull,
    label: "为空",
  },
  {
    operator: Operators.NotNull,
    label: "不为空",
  },
];
