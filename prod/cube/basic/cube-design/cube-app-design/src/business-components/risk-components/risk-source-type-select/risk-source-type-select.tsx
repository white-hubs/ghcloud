import { TreeSelect } from '@ghcloud/cube-ui'
import { cubeRiskManagementService } from "../../../api/service";
import { defineComponent, reactive, onMounted, ref, watch } from 'vue'

interface Props {
  title: string;
  multiple: boolean;
  checkable: boolean;
  value: string | string[];
  placeholder: string;
  readonly: boolean;
}

export const RiskSourceTypeSelect = defineComponent({
  props: ['title', 'multiple', 'value', 'checkable', 'placeholder', 'readonly'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const select = ref(props.value)
    const options = ref([])

    watch(() => props.value, () => {
      select.value = props.value ?? (props.checkable ? [] : '')
    })

    onMounted(async () => {
      const response = await cubeRiskManagementService.getRiskSourceType({ itemCode: 'risk-source-type' })
      options.value = response || []
    })

    return (): JSX.Element => (
      <TreeSelect
        fieldNames={ { label: 'name', value: 'code', children: 'nextList' } }
        placeholder={props.placeholder ?? '请选择风险源类别'}
        treeData={options.value}
        allow-clear
        tree-checkable={props.checkable}
        multiple={props.multiple ?? false}
        v-model:value={select.value}
        onChange={(val: string[]) => {
          emit('update:value', val)
        }}
        disabled={props.readonly}
      />
    )
  }
})