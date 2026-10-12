type FormJsonField = {
  id?: unknown
  name?: unknown
  title?: unknown
  props?: {
    items?: unknown
  }
}

const GROUP_LIST_FIELD_NAME = 'GroupList'

const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object'
}

const toField = (value: unknown): FormJsonField | undefined => {
  if (!isObject(value)) {
    return undefined
  }
  return value as FormJsonField
}

const toLabel = (value: FormJsonField): string => {
  const title = value.title !== undefined && value.title !== null ? String(value.title).trim() : ''
  const id = value.id !== undefined && value.id !== null ? String(value.id).trim() : ''
  return title !== '' ? title : id
}

export type FormFieldCascaderOption = {
  label: string
  value: string
  children?: FormFieldCascaderOption[]
}

/** 将 `/form-flow/{id}` 返回的 `formJson` 转为级联选项（GroupList 含 children） */
export function mapFormJsonToCascaderOptions (formJson: string | undefined | null): FormFieldCascaderOption[] {
  const raw = formJson?.trim()
  if (!raw) {
    return []
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return []
  }

  const seen = new Set<string>()

  const appendFields = (fields: unknown[]): FormFieldCascaderOption[] => {
    const out: FormFieldCascaderOption[] = []
    for (const rawField of fields) {
      const field = toField(rawField)
      if (!field) {
        continue
      }
      const id = field.id !== undefined && field.id !== null ? String(field.id).trim() : ''
      const baseLabel = toLabel(field)
      if (id === '' || baseLabel === '') {
        continue
      }
      if (seen.has(id)) {
        continue
      }
      seen.add(id)

      const isGroupList = String(field.name ?? '').trim() === GROUP_LIST_FIELD_NAME
      const items = field.props?.items
      const children = isGroupList && Array.isArray(items) && items.length > 0 ? appendFields(items) : undefined

      out.push({
        value: id,
        label: baseLabel,
        ...(children && children.length > 0 ? { children } : {}),
      })
    }
    return out
  }

  return appendFields(parsed)
}
