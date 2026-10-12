import { defineComponent, ref } from 'vue'
import { UserCheckModal } from '@ghcloud/generic-component'
import { message } from '@ghcloud/cube-ui'
import { handleDesignate } from '@/api/alarm/index'
export const DesignateModal = defineComponent({
  props: {
    selectRow: {
      type: String,
      default: () => ''
    }
  },
  emits: ['update:selectRow', 'getList'],
  setup: (props, { emit, expose }) => {
    const visible = ref(false)
    const loading = ref(false)
    const openModal = (): void => {
      visible.value = true
    }
    const handleOk = async (val: Record<string, unknown>[]): Promise<void> => {
      if (!val.length) return message.error('请选择人员')
      try {
        loading.value = true
        const feature = (window.config as unknown as { feature: Record<string, boolean>; }).feature
        const usePersonal = feature ? Boolean(feature.usePersonal) : false
        const assignUsers = val.map(item => {
          return {
            userId: usePersonal ? item.userId : item.id,
            userName: item.name,
            departmentId: usePersonal ? item.organizationId : (item.organizations as Record<string, string>[])[0]?.id,
            departmentName: usePersonal ? item.organizationName : (item.organizations as Record<string, string>[])[0].name
          }
        })
        const params = {
          id: props.selectRow,
          assignUsers
        }
        await handleDesignate(params)
        message.success('操作成功')
        emit('update:selectRow', '')
        emit('getList')
        visible.value = false
      } catch {

      } finally {
        loading.value = false
      }
    }
    expose({
      openModal
    })
    return (): JSX.Element => (
      <UserCheckModal v-model:visible={visible.value} loading={loading.value} onOk={handleOk} />
    )
  }
})
