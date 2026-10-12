# 基于 a-table 封装了支持列表配置的表格

此 table 组件支持丰富的列配置。与`src/models`和`src/server/ModelService`配合使用。具体的列配置请参考 [src/models/doc.md](../../../src/models/doc.md)

## 1. 参数

完全扩展了 a-table,完全支持 a-table 的所有参数，以下未扩展参数

- **modelName** : 在 model 中配置模型名称
- **tableKey**: 默认为`modelName`。如果不同的列表使用了同一个模型那需要通过 tableKey 来区分。如“管理界面的用户列
  表”与“选择用户的列表” 都同样使用了 User 模型。但是显示的列可能不一样，就需要 tableKey 来区分
- **visibles**: uid 数组。 表示此 table 需要显示的列，uid 为 model 配置的 uid
- **showIndex**:可选值 none(不显示)/page(每页从 1 开始)/total(首页从 1 开始)。 是否在列表前面增加序号显示。
- **url**: Function|String。当为 String 时为请求数据的地址。Function:返回 Promise
- **pagination**: true（分页）/false(不分页)/Object(与 antdv 的配置一致)。分页的数据格式`{total:100,records:[],}`。不分页时`[]`。
- **selectionMode**: false/multi/single。 single 时默认单选框
- **fitHeight**：Number/false(不自适应高度)。表格自适应父容器。需要基于 app-table 计算的高度做调整使用此参数。
- **minWidth**: 表格的最小宽度 默认为`max-content`。当列的宽度之和大于表格宽度时会出现横向滚动条
- **maxHeight**: 参数`fitHeight`为 false 时生效
- **columnsCustomsize(columns,config)**: 自定义列处理，如需要在最后一列增加操作列，
  可使用如下操作。

```javascript
columnsCustomsize(columns, config) {
    columns.push({
      uid: 'action',
      dataIndex: 'action',
      title: '操作',
      width: '20rem',
      fixed: config.fixedActionColumn ? 'right' : null,
    });
    return columns;
  },
```

- **defaultSort**: Sting/Array。默认 createTime,desc
- **params**: 给请求时增加额外参数
- **filter**: 高级查询参数
- **sortable**: 表格是否可拖动排序
- **parentKey**: 默认 parentKey。需要展示树形表格时
- **handlerClass**: 拖动排序包含此 class 的元素才能触发拖动
  拖动排序操作

```
app-table(...)
  template(#name="{record}")
    span.drag-handler
      span {{record.name}}
      a-icon.drag-icon(type="drag")
```

## 2. 事件

扩展了 andv table 事件

- **on-sort**：拖动排序完成 参数为 ids `this.$emit('on-sort',ids)`
- **select**：点击行 ids `this.$emit('select',{rowKey, record, rowKeys})`
- **selectChange**: 选中变化时间 `this.$emit('selectChange',{selectedRowKeys, selectedRows})`
- **loaded**: 表格数据加载完成 `this.$emit('loaded')`

## 3. 方法

- **getSelection**: 单选返回 Object|null。多选返回 Array
- **refresh**: 刷新列表 会重置页码参数为 1
- **reload**: 不会重置任何参数，直接重新加载一次
- **exportToXlsx**: 导出数据, 默认最多 9999 条数据

```
// 导出数据
async handleExport() {
  this.exportLoading = true;
  await this.$refs.table.exportToXlsx({ filename: '消杀点统计', maxSize: 9999 });
  this.exportLoading = false;
},
```

## 4. 插槽

**footer**：表格底部
**expandedRowRender**：行展开，
**columnScopedSlot**：可为每列使用 ScopedSlot 插槽。如

```
app-table(...)
  template(#username="{text, record, index}")
    span {{text}} record.nickname
```
