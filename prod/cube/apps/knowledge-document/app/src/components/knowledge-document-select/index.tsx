import { defineComponent, ref, watch } from 'vue'
import type { KnowledgeDocumentTypeModel } from '@ghcloud/cube-knowledge-document-service'
import { cubeKnowledgeDocumentService } from '@/api/service'
import { TreeSelect } from '@ghcloud/cube-ui'

interface Props {
  multiple: boolean;
  value: string | string[];
  placeholder: string;
  readonly: boolean;
  maxTagCount: number;
}

/** 文档类型选择 */
export const KnowledgeDocumentSelect = defineComponent({
  props: ['multiple', 'value', 'placeholder', 'readonly', 'maxTagCount'],
  emits: ['update:value', 'change'],
  setup (props: Props, { emit }) {
    const select = ref(props.value)
    const options = ref<KnowledgeDocumentTypeModel[]>([])
    cubeKnowledgeDocumentService.getKnowledgeTypeTreeList().then(res => {
      options.value = res
    })

    watch(() => props.value, () => {
      select.value = props.value ?? (props.multiple ? [] : '')
    })
    return (): JSX.Element =>
      <TreeSelect
        {...props}
        fieldNames={ { label: 'name', value: 'id', children: 'children' } }
        placeholder={props.placeholder ?? '请选择'}
        allow-clear
        multiple={props.multiple ?? false}
        treeData={options.value}
        v-model:value={select.value}
        onChange={(val: string[], selectedOptions: KnowledgeDocumentTypeModel[]) => {
          emit('update:value', val)
          emit('change', selectedOptions)
        }}
        disabled={props.readonly}
        showSearch
        maxTagCount={props.maxTagCount}
      />
  }
})

