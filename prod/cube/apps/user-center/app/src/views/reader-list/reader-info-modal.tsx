import { cubeUserCenterService } from '@/api/service'
import { getDefaultImg } from '@/utils/tool'
import { Descriptions, DescriptionsItem, Modal, Spin, message, Image } from '@ghcloud/cube-ui'
import type { UserVO } from '@ghcloud/cube-user-center-service'
import { defineComponent, ref, reactive } from 'vue'
interface Props {
  labelWidth: string;
}
export const ReaderInfoModal = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '80px'
    },
  },
  emits: ['enter'],
  setup (props: Props, { emit, expose }) {
    const modalVisible = ref<boolean>(false)
    const state = reactive<{
      baseInfo: UserVO;
      loading: boolean;
    }>({
      baseInfo: {},
      loading: true
    })
    const genderData: Record<string, unknown> = {
      MALE: '男',
      FEMALE: '女',
      NONE: '保密'
    }
    const getInfo = async (id: number): Promise<void> => {
      try {
        state.loading = true
        state.baseInfo = await cubeUserCenterService.getRegisterUserDetail({ id })
      } catch {
      } finally {
        state.loading = false
      }
    }
    const closeModal = (): void => {
      modalVisible.value = false
      emit('enter')
    }
    const baseInfoState = [
      {
        label: '姓名',
        name: 'name',
        render: (val: unknown) => {
          return val || '--'
        }
      },
      {
        label: '手机号',
        name: 'mobile',
        render: (val: unknown) => {
          return val || '--'
        }
      },
      {
        label: '性别',
        name: 'gender',
        render: (val: string) => {
          return genderData[val] || '--'
        }
      },
    ]
    const openModal = async (row: { id: number; }): Promise<void> => {
      if (row.id) await getInfo(row.id)
      modalVisible.value = true
    }

    expose({
      openModal
    })
    return () =>
      <>
        <Modal
          visible={modalVisible.value}
          title='读者详情'
          onOk={closeModal}
          onCancel={closeModal}
          width='600px'
        >
          <Spin spinning={state.loading}>
            <div class='reader-info'>
              <div class='left'>
                <Image src={state.baseInfo?.fileVO?.path ?? getDefaultImg()} width={100} style='height: auto; overflow: hidden;' />
              </div>
              <div class='right'>
                <Descriptions column={1}>
                  {baseInfoState.map(item => {
                    return (
                      <DescriptionsItem label={item.label}>
                        {
                          item.render((state.baseInfo as Record<string, any>)[item.name])
                        }
                      </DescriptionsItem>
                    )
                  })}
                </Descriptions>
              </div>
            </div>
          </Spin>
        </Modal>
      </>
  }
})
