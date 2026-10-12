# 列表查询缓存能力说明

## 1. 这个公共组件现在提供什么能力

这套列表查询能力的目标，是让列表页在“筛选、分页、返回回显”这几个动作上保持一致。  
当前公共层已经具备以下能力：

- 支持用 URL 保存筛选条件和分页参数。
- 支持列表页返回后自动回显表单值。
- 支持把回显后的值同步到业务请求对象，比如 `searchParams`。
- 支持 `change / enter / reset` 的统一处理。
- 支持自定义 `onChange` 的页面继续保留业务逻辑。
- 支持动态 `schema: [] -> updateSchema(...)` 的页面。
- 支持 `Input` 只在回车时触发查询。

---

## 2. 当前公共组件的组成

### 2.1 `useCubeForm`

文件：

- `src/base-components/cube-form/use-form.ts`

它负责的事情：

- 读取 URL 中的查询参数并回填到表单。
- 在回填完成后，把值同步到业务请求对象。
- 控制是否自动触发一次列表查询。
- 统一处理 change / enter / reset。

### 2.2 `FormApiOptions`

文件：

- `src/base-components/cube-form/form.type.ts`

新增能力包括：

- `syncStateRef`
- `syncStateFields`
- `syncMap`
- `onHydratedQuery`

### 2.3 `FormApi`

文件：

- `src/base-components/cube-form/form-api.ts`

它负责：

- 维护当前表单模型。
- 在 `updateSchema(...)` 后补齐新字段。
- 在 `handleReset()` 时按当前 schema 还原默认值。

### 2.4 `CubeForm` 渲染层

文件：

- `src/base-components/cube-form/form-ui.tsx`

它负责：

- 把 schema 渲染成实际控件。
- 统一处理值变更。
- 去重同一次变更造成的重复触发。
- 兼容 `value` / `modelValue` 两类常见组件协议。

---

## 3. 这个能力怎么用

### 3.1 最常见接入

如果列表页使用独立 `searchParams` 作为接口参数，建议这样接：

```ts
const [CubeForm, formApi] = useCubeForm({
  ...原配置,
  syncStateRef: searchParams,
  onHydratedQuery: () => {
    tableApi.query()
  },
})
```

这个写法更像下面这些页面：

- `prod/cube/apps/approval-center/app/src/views/work-order-record/work-order-record.tsx`
- `prod/cube/apps/daily-task/app/src/views/task-list/task-list.tsx`
- `prod/cube/apps/daily-inspection/app/src/views/inspect-task/inspect-task.tsx`

它们的特点是：

- 页面里会单独定义一个 `searchParams` / `page`。
- `fetchApi` 直接读这个对象。
- 表单回填后，需要公共层把值同步回这个对象。

### 3.2 字段名不一致时（一般不存在，开发者注意尽量一致就行）

如果表单字段和接口参数字段不一致，再补一层映射：

```ts
const [CubeForm, formApi] = useCubeForm({
  ...原配置,
  syncStateRef: searchParams,
  syncMap: (formValues) => ({
    keyword: formValues.keyword ?? '',
    submitTime: Array.isArray(formValues.submitTime) ? formValues.submitTime.join(',') : '',
  }),
  onHydratedQuery: () => {
    tableApi.query()
  },
})
```

### 3.3 直接用 `formApi.formValues` 的页面

这类页面的意思是：`fetchApi` 直接从 `useCubeForm` 返回的 `formApi.formValues` 里取值，不再额外维护一份独立的请求对象。

典型示例：

- `prod/cube/apps/approval-center/app/src/views/work-order-approval/work-order-approval.tsx`

它的写法核心是这样的：

```ts
fetchApi: async () => {
  const param = {
    type: formApi.formValues.type,
    status: formApi.formValues.status,
    organizationId: formApi.formValues.organizationId,
    username: formApi.formValues.username,
    submitTime: formApi.formValues.submitTime,
  }
  return cubeApprovalCenterService.getFlowProcessPage(param)
}
```

这种页面一般不用额外接 `syncStateRef`，因为：

- 表单值就是查询参数源。
- URL 回填后，只要表单值恢复正确，接口参数自然就恢复正确。
- 这类页面通常不用改，保持原写法即可。

### 3.4 有自定义 `onChange` 的页面

这类页面可以继续保留业务写法，例如：

- 在 `onChange` 里更新 `searchParams`
- 在 `onChange` 里直接 `tableApi.query()`

公共层会继续负责：

- 写 URL
- 回显值

业务逻辑一般不用大改。

---

## 4. 这套能力的行为规则

### 4.1 change

- 非 `Input` 组件 change 后，默认会写 URL。
- 没有自定义 `onChange` 时，公共层会顺带触发查询。
- 有自定义 `onChange` 时，公共层不重复抢查询，避免双请求。

### 4.2 Input

- `Input` 不走输入过程触发。
- 只在回车时触发公共查询逻辑。

### 4.3 reset

- 重置时会恢复表单默认值。
- 重置期间会抑制多次回写导致的重复请求。
- 业务侧原本的 `handleReset` 逻辑仍可保留。

### 4.4 回显

- URL 回填后，表单值会恢复。
- 回填后的值会同步到业务请求对象。
- 动态 schema 页面也会按当前真实 schema 回填。

---

## 5. 迁移步骤

### 第一步：判断页面类型

先看这个页面的请求参数来源：

- `formApi.formValues`
- `searchParams` 或其他独立对象

怎么判断最简单：

- 如果 `fetchApi` 里直接写 `formApi.formValues.xxx`，它就是“直接用 `formApi.formValues`”。
- 如果 `fetchApi` 里写的是 `searchParams.xxx`、`page.xxx`，或者页面里单独定义了一个请求对象，那它就是“独立 `searchParams`”。

例如：

- `work-order-approval` 是直接用 `formApi.formValues`。
- `work-order-record` 是先定义 `searchFormSchema`，再 `formApi.updateSchema(...)`，并且 `fetchApi` 读的是 `formApi.formValues`。
- `task-list`、`inspect-task` 这类页面通常会额外维护 `searchParams`。

### 第二步：接入公共桥接

如果页面使用独立请求对象，就补：

- `syncStateRef`
- `onHydratedQuery`

### 第三步：处理字段映射

如果字段名不一致，就补：

- `syncMap`

### 第四步：保留现有业务逻辑

如果页面里已经有：

- 自定义 `onChange`
- 自定义分页查询
- 自定义重置查询

先保留，验证公共层接入后是否和原行为一致。

### 第五步：重点回归

至少确认这些场景：

1. 首次进入页面时，默认参数和默认请求正常。
2. 筛选项变化后，URL 和接口参数同步。
3. 返回列表时，筛选项可以回显，接口数据也正确。
4. 重置后只触发一次查询。
5. 有自定义 `onChange` 的页面不重复请求。
6. 动态 `schema` 页面可以正常回显。

---

## 6. 验证清单

- `formApi.formValues` 是否有完整默认值。
- URL 回填后，`formApi.formValues` 是否恢复正确。
- `searchParams` 是否同步到了回填值。
- change 后是否只查询一次。
- reset 后是否只查询一次。
- `Input` 是否只在回车时触发。
- 动态 `schema` 页面是否正常回填。

---

## 7. 一句话总结

这套公共组件当前提供的是一套“列表查询状态统一维护”能力：

- URL 负责保存
- `useCubeForm` 负责回填和同步
- 业务页只需要按自己的参数源选择最小接入方式

---

## 8. 风险事项

1. 如果页面里同时保留了业务侧自定义 `onChange` 和公共层自动查询，请确认不会出现重复请求。
2. 如果表单字段和接口参数字段不一致，记得补 `syncMap`，否则回填值可能写进了表单，但没有写进请求参数。
3. 如果页面是 `schema: [] -> updateSchema(...)`，不要只看初始化时的 schema；最终回填和默认值都依赖动态注入后的真实 schema。
4. 如果某些业务组件本身是特殊协议的封装控件，先确认它们的 `value / modelValue / emits` 是否符合当前公共表单的接入方式。

这样列表页返回回显、自动查询、自定义 `onChange`、动态 `schema` 都能尽量统一起来。
