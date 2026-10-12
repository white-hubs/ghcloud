import { defineComponent, onMounted, ref } from 'vue'
import { Popup, NavBar, Cascader } from 'vant'
import type { KnowledgeDocumentTypeModel } from '@ghcloud/cube-knowledge-document-service'
import { cubeKnowledgeDocumentService } from '@/api/server'

export const KnowledgeDocumentTypeSelect = defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  emits: ['confirm', 'close'],
  setup: (props, { emit }) => {
    const options = ref<KnowledgeDocumentTypeModel[]>([])
    const select = ref<{ id: string; name: string; }>({
      id: props.value.id,
      name: props.value.name
    })

    const getTypeData = async (): Promise<void> => {
      const res = await cubeKnowledgeDocumentService.getKnowledgeTypeTreeList()
      options.value = res
    }

    onMounted(() => {
      getTypeData()
    })

    const handleCancel = (): void => {
      emit('close')
    }

    const handleConfirm = (): void => {
      emit('confirm', select.value)
    }

    const onChange = (selectedOption: { selectedOptions: KnowledgeDocumentTypeModel[]; value: string; }): void => {
      const item = selectedOption.selectedOptions[selectedOption.selectedOptions.length - 1]
      select.value = {
        id: item.id,
        name: item.name
      }

    };

    return (): JSX.Element => (
      <>
        <Popup onClose={handleCancel} v-model:show={props.show} round position="bottom">
          <NavBar
            class="nav"
            title="文档类型选择"
            left-text="取消"
            right-text="确认"
            onClickLeft={handleCancel}
            onClickRight={handleConfirm}
          />
          <Cascader
            v-model={select.value.id}
            options={options.value}
            fieldNames={
              {
                text: 'name',
                value: 'id',
                children: 'children'
              }
            }
            onChange={onChange}
            showHeader={false} />
        </Popup>
      </>
    )
  }
})