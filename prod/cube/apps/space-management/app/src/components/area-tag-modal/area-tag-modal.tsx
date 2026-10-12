import { defineComponent, reactive, ref } from 'vue'
import { CheckboxGroup, Empty, message } from '@ghcloud/cube-ui'
import { useCubeModal } from '@ghcloud/cube-app-design'
import styles from './area-tag-modal.module.less'
import { cubeMdataService } from '@ghcloud/cube-app-design/src/api/service'
import type { AreaListVO } from '@ghcloud/cube-mdata-service/src/type'

interface Props {
  title: string;
}
export const AreaTagModal = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const tagOptions = ref<{ label: string; value: string; }[]>([])
    const formState = reactive<{
      id: string | number | undefined;
      tags: string | string[] | undefined;
    }>({
      id: undefined,
      tags: undefined,
    })
    const [CubeModal, modalApi] = useCubeModal({
      title: '关联标签',
      onConfirm: async () => {
        try {
          modalApi.setState({ confirmLoading: true })
          const params = {
            areaId: formState.id || '',
            tagIds: Array.isArray(formState.tags) ? formState.tags.join(',') : formState.tags ?? '',
          }
          await cubeMdataService.linkSpaceTag(params)
          message.success('操作成功')
          modalApi.close()
          emit('enter')
        } catch (error) {
          message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
        } finally {
          modalApi.setState({ confirmLoading: false })
        }
      },
      onCancel: () => {
        modalApi.close()
        emit('cancel')
      }
    })
    const getTagOptions = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaTagList()
      if (res){
        tagOptions.value = res?.map(e => {
          return {
            label: e.name ?? e.value ?? '',
            value: e.id ?? e.key ?? ''
          }
        }) ?? []
      }
    };
    const openModal = (record?: AreaListVO): void => {
      modalApi.open()
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined
      }
      formState.id = record?.id ?? ''
      formState.tags = record?.tagIds ? record?.tagIds.split(',') : []
      getTagOptions()
      if (record) {
        Object.assign(formState, record)
        modalApi.setState({ title: `关联标签【${record.name}】` })
      }
    }
    expose({
      openModal
    })
    const modalSlots = {
      default: (): JSX.Element => {
        return (
          <div class={styles.tags}>
            {
              tagOptions.value.length === 0 ?
                <Empty />
                :
                <CheckboxGroup v-model:value={formState.tags} options={tagOptions.value} />
            }
          </div>
        )
      }
    }
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />
  }
})
