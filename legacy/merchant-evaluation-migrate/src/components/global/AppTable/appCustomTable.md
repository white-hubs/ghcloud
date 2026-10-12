# AppCustomTable

## 1. 参数说明

- **api** : 请求接口地址
- **params** : 请求参数
- **tableData** : 表格数据, 与`api`和`params`互斥
- **dataFormater** : 表格数据处理函数, 在加载表格列表之前, 请求/获取数据成功之后
- **tableColumns** : 表格列, eg:

```javascript
// tableColumns
[
  {
    uid: 'name', // 一个不重复的名称
    dataIndex: 'name', // 取值字段, 表示这个列默认展示数据中的name字段
    title: '名称', // 表头, 列名
    width: '20rem', // 列宽,
    flex: 1, // 和width互斥, 自动宽度
    customClass: ['pl1', 'center'], // 在单元格上增加自定义的css类
    render(h, v, r) {
      // 渲染函数, 支持jsx语法, 有render时默认取值失效, 必须显式的return一个字符串或者vnode.
      // h 必须参数 vue的CreateElement方法; v 字段值 这里也就是name的值; r 取值对象, 行数据
      return <div>{name + r.typeName}</div>;
    },
  },
];
```

- **tablePagination** : 自定义分页参数, { pageSize: Number, total: Number, pageNum: Number, pageSizeOptions: String[]}. pageSizeOptions: 分页条数切换备选
- **showSizeChanger** : 展示分页条数切换, 默认`false`
- **noPagination** : 不分页, 适配某些 list 接口, 默认`false`
- **hideTitle** : 隐藏表头, 默认`false`
- **maxHeight** : 最大高度, 设值之后超出高度将出现滚动条, 默认`null`自动撑高,
- **smallPagination** : 将分页组件的`size`设为`small`, 默认`false`
- **selectionMode** : 单选/复选/不选 模式, 默认`multi`多选, 可选`single`单选, `false`没有选择框. <span style="color: #f5222d;">单选还未实现!!!</span>
- **rowKey** : 每行的唯一 key, 不可重复, 默认`id`
- **defaultSelections** : 默认选中, 一般用来做选择回显
- **defaultSort** : 默认排序, 默认值`createTime,desc`

## 2. 事件说明

1. `loaded` 表格数据加载完成, 渲染还未开始, 参数: `无`
2. `row-click` 点击行, 全选也会触发该事件, 参数: `点击行的数据` 全选触发该事件时参数`无`
