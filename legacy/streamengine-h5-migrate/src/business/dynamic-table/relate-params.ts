import type { FormOption } from '../../domain/form-flow'

const RELATE_SUPPORTED_COMPONENTS = new Set(['SelectInput', 'MultipleSelect', 'VacationType'])

/** 在表单配置树中按 id 查找项（含 GroupList.props.items） */
export const findFormItemById = (id: string, list: FormOption[]): FormOption | undefined => {
  for (const node of list) {
    if (node.id === id) {
      return node
    }
    const subItems = (node.props as { items?: FormOption[] })?.items
    if (node.name === 'GroupList' && Array.isArray(subItems)) {
      const found = findFormItemById(id, subItems)
      if (found) {
        return found
      }
    }
  }
  return undefined
}

/** 联动驱动字段值：优先从内层分组行向外，再到根 formData */
export const resolveRelateParamValue = (
  key: string,
  rowChain: Record<string, unknown>[] | undefined,
  root: Record<string, unknown>,
): unknown => {
  if (rowChain?.length) {
    for (let i = rowChain.length - 1; i >= 0; i--) {
      const ctx = rowChain[i]
      if (ctx && typeof ctx === 'object' && !Array.isArray(ctx) && Object.prototype.hasOwnProperty.call(ctx, key)) {
        return (ctx as Record<string, unknown>)[key]
      }
    }
  }
  return root[key]
}

const normalizeToComparableValues = (value: unknown): string[] => {
  if (value === undefined || value === null || value === '') {
    return []
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeToComparableValues(item))
  }
  if (typeof value === 'object') {
    const objectValue = value as Record<string, unknown>
    const candidates = [objectValue.id, objectValue.value, objectValue.code, objectValue.name]
      .filter((item) => item !== undefined && item !== null && item !== '')
      .map((item) => String(item))
    return candidates
  }
  return [String(value)]
}

export const shouldShowByRelateParams = (
  item: FormOption,
  initFormOptions: FormOption[],
  formData: Record<string, unknown>,
  rowChain?: Record<string, unknown>[],
): boolean => {
  const relateParams = item.props.relateParams
  if (!relateParams) {
    return true
  }
  if (typeof relateParams !== 'object' || Array.isArray(relateParams)) {
    return true
  }

  const key = Object.keys(relateParams)[0]
  if (!key) {
    return true
  }
  const expectedValue = (relateParams as Record<string, unknown>)[key]
  const sourceFormItem = findFormItemById(key, initFormOptions)
  if (!sourceFormItem) {
    return true
  }
  if (!RELATE_SUPPORTED_COMPONENTS.has(sourceFormItem.name)) {
    return true
  }

  const expectedValues = normalizeToComparableValues(expectedValue)
  const actualValues = normalizeToComparableValues(
    resolveRelateParamValue(key, rowChain, formData),
  )
  if (expectedValues.length === 0 || actualValues.length === 0) {
    return false
  }
  return actualValues.some((value) => expectedValues.includes(value))
}

/** 根层计算 show；嵌套项占位 show:true，显隐在 GroupList 内按行 evaluate */
export function mapFormOptionsWithShowTree(
  initOptions: FormOption[],
  getItemShow: (item: FormOption) => boolean,
): FormOption[] {
  return initOptions.map((item) => mapOneRootWithNestedStub(item, getItemShow))
}

function mapOneRootWithNestedStub(item: FormOption, getItemShow: (item: FormOption) => boolean): FormOption {
  const show = getItemShow(item)
  const nestedItems = (item.props as { items?: FormOption[] })?.items
  if (item.name === 'GroupList' && Array.isArray(nestedItems)) {
    return {
      ...item,
      show,
      props: {
        ...item.props,
        items: mapNestedItemsShowStub(nestedItems),
      },
    }
  }
  return { ...item, show }
}

function mapNestedItemsShowStub(items: FormOption[]): FormOption[] {
  return items.map((child) => {
    const deep = (child.props as { items?: FormOption[] })?.items
    if (child.name === 'GroupList' && Array.isArray(deep)) {
      return {
        ...child,
        show: true,
        props: {
          ...child.props,
          items: mapNestedItemsShowStub(deep),
        },
      }
    }
    return { ...child, show: true }
  })
}
