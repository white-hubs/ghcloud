import type { Ref, UnwrapNestedRefs } from 'vue'
import { reactive, ref } from 'vue'
import type { FormInstance } from '@ghcloud/cube-ui'
import type { FormApiOptions, FormState, SchemaProp, FormValueChangeMeta } from './form.type'
import { bindMethods } from '../../utils/index'
export class FormApi {
  public state: UnwrapNestedRefs<FormState> = reactive({
    layout: 'horizontal',
    schema: [],
    isCollapsed: true,
    showButton: true,
    showCollapseButton: false,
  })

  public formValues: UnwrapNestedRefs<Record<string, unknown>> = reactive({})
  public formRef: Ref<FormInstance | undefined> = ref<FormInstance>()
  private readonly api: Pick<
    FormApiOptions,
  | 'handleSubmit'
  | 'handleReset'
  | 'handleValuesChange'
  | 'getValues'
  >

  public constructor (options: FormApiOptions) {
    const {
      handleSubmit,
      handleReset,
      handleValuesChange,
      getValues,
      ...optionsState
    } = options
    this.api = {
      handleSubmit,
      handleReset,
      handleValuesChange,
      getValues
    }
    Object.assign(this.state, optionsState)
    this.formValues = this.getFormModel()
    bindMethods(this)
  }

  public getFormSchema (columnCount: number): SchemaProp[] {
    const schemas = this.state.schema
    if (!this.state.isCollapsed) {
      return schemas
    }
    const showSchemaIndex = columnCount
    const filterSchema = schemas.filter((item, index) => {
      if (showSchemaIndex === 0) {
        return index === 0
      }
      return showSchemaIndex > index
    })
    return filterSchema
  }

  public setState (state: Partial<FormState>): void {
    Object.assign(this.state, state)
  }

  public toggleCollapse (): void {
    this.state.isCollapsed = !this.state.isCollapsed
  }

  public handleSubmit (): void {
    this.api?.handleSubmit?.(this.formValues)
  }

  public getValues (): void {
    this.api.getValues?.(this.formValues)
  }

  public handleValuesChange (changedValues?: Record<string, unknown>, meta?: FormValueChangeMeta): void {
    this.api.handleValuesChange?.(this.formValues, changedValues, meta)
  }

  public setFormValues (state: Partial<Record<string, unknown>>): void {
    Object.assign(this.formValues, state)
  }

  public updateSchema (schema: SchemaProp[]): void {
    this.state.schema = schema
    const model = this.state.schema.reduce<Record<string, unknown>>((acc, cur) => {
      acc[cur.fieldName] = cur.defaultValue ?? null
      return acc
    }, {})
    for (const key of Object.keys(model)) {
      if (!Object.prototype.hasOwnProperty.call(this.formValues, key) || this.formValues[key] === undefined) {
        this.formValues[key] = model[key]
      }
    }
  }

  public updateFieldSchema (schema: SchemaProp): void {
    const index = this.state.schema.findIndex(item => item.fieldName === schema.fieldName)
    if (index === -1) {
      throw new Error('field not found')
    }
    this.state.schema[index] = schema
  }

  public setFieldValue (fieldName: string, value: unknown): void {
    this.formValues[fieldName] = value
  }

  public handleReset (): void {
    const model = this.state.schema.reduce<Record<string, unknown>>((acc, cur) => {
      acc[cur.fieldName] = cur.defaultValue ?? null
      return acc
    }, {})
    for (const key of Object.keys(model)) {
      this.formValues[key] = model[key]
    }
    this.api.handleReset?.()
  }

  private getFormModel (): UnwrapNestedRefs<Record<string, unknown>> {
    const model = this.state.schema.reduce<Record<string, unknown>>((acc, cur) => {
      acc[cur.fieldName] = cur.defaultValue ?? null
      return acc
    }, {})
    return reactive({
      ...model,
    })
  }
}
