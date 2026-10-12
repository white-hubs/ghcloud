## 列配置

- uid ：不能编辑 【必须】
- title: 标题 【必须】
- dataIndex: 列名 【必须】
- desc: 描述，用于在列配置时显示的描述信息
- sorter: 是否可排序: true/false ,默认不排序
- align: 文字对齐 left,center,right 默认 left
- width: 宽度 字符串
- minWidth: 列的最小宽度，由于 `fix-layout` 的 table 会导致一些未设置宽度或宽度未 `auto` 的列宽度为 0。通过配置 minWidth 当发现宽度小于这个 minWidth 时会设置列的宽度未 `minWith`。只支持 px 和 rem。你也可以使用`app-table`的 minWidth 配和 sizes 配置来避免一些列的宽度问题
- fixed: 固定方式：right,left
- sizes: 响应式显示[xxl,xl,lg,md,sm,xs]
- nowrap: 不换行显示
- formatter:
  格式化器配置后自定调用对应的组件，优先级 render>formats>formater
  - type: 格式化器：Date、Enum、Dictionary、Campus、User、Phone、Currency
  - props: Object。格式化器属性
- formats:
  - key: 唯一标准 【必须】
  - default: 默认格式化方式
  - desc: 格式化描述
  - render(h,text,record): 渲染器 【必须】
- render: 自定义渲染
- form
  > 表单配置
  - default: any|Function
  - rules: 验证规则
    - https://github.com/yiminghe/async-validator
- filter
  > 过滤器配置
  - quick: Boolean. 支持快捷过滤
  - advance: Boolean. 支持高级查询
  - field: String. 过滤字段 默认取 dataIndex
  - operators: Array. 支持的查询操作符
  - transform: Function({field,operator,value},isQuick):{} 过滤项转换器 可返回 Promise
  - control:
    - type: Input,Date,Number,Dictionary,Enum,User,Boolean. 查询控件
    - custom: Boolean. 表示自定义控件 当为 true 时 type 未全局定义的组件名称
    - props: Obejct. 控件属性
