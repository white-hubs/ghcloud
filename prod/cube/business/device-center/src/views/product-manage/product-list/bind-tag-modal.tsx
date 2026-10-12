import { cubeDeviceCenterInternalService } from '@/api/service'
import { Button, Checkbox, Modal, PopConfirm, PopOver, Spin, Table } from '@ghcloud/cube-ui'
import { message } from 'ant-design-vue/es'
import { defineComponent, ref, watch } from 'vue'

export const BindTagModal = defineComponent({
  props: {
    showTagTable: {
      type: Boolean,
      default: false
    },
    productId: {
      type: String,
      default: ''
    }
  },
  setup (props, { expose }) {
    const tagList = ref<{
      tagCode: string;
      tagName: string;
    }[]>([])
    cubeDeviceCenterInternalService.getTagBuiltins().then(res => {
      tagList.value = res
    })
    const loading = ref(false)
    const visible = ref(false)
    const id = ref<string | string[]>('')
    const productTagList = ref<{
      tagCode: string;
      tagName: string;
    }[]>([])
    const openModal = async (prodId: string): Promise<void> => {
      visible.value = true
      getProductTagList(prodId)
    }
    const batchTag = async (prodIds: string[]): Promise<void> => {
      visible.value = true
      productTagList.value = []
      id.value = prodIds
    }

    const checkChange = async (checked: boolean, tag: { tagCode: string; tagName: string; }): Promise<void> => {
      if (loading.value) return
      try {
        loading.value = true
        if (checked) {
          productTagList.value.push(tag)
          await cubeDeviceCenterInternalService.bindTagBuiltins({ tagCode: tag.tagCode, businessKeys: Array.isArray(id.value) ? id.value : [id.value] })
          message.success(tag.tagName + '-绑定成功')
        } else {
          const index = productTagList.value.findIndex(ele => ele.tagCode === tag.tagCode)
          productTagList.value.splice(index, 1)
          await cubeDeviceCenterInternalService.unbindTagBuiltins({ tagCode: tag.tagCode, businessKeys: Array.isArray(id.value) ? id.value : [id.value] })
          message.success(tag.tagName + '-解绑成功')
        }
      } catch {
      } finally {
        loading.value = false
      }
    }
    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): string=> `${index + 1}`
      },
      {
        title: '标签名称',
        dataIndex: 'tagName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        customRender: ({ record }: { record: { tagCode: string;tagName: string; }; }): JSX.Element => {
          return (
            <>
              <PopConfirm title='确认移除该项？' onConfirm={() => {
                checkChange(false, record)
              }}>
                <Button type='link' size='small' danger>移除</Button>
              </PopConfirm>
            </>
          )
        }
      }
    ]
    const getProductTagList = async (prodId: string): Promise<void> => {
      id.value = prodId
      if (!id.value) return
      try {
        loading.value = true
        const res = await cubeDeviceCenterInternalService.getProductDeviceTags(id.value)
        productTagList.value = res
      } catch {

      } finally {
        setTimeout(() => {
          loading.value = false
        }, 0)
      }
    }
    watch([(): string => props.productId, (): boolean => props.showTagTable], () => {
      getProductTagList(props.productId)
    }, { immediate: true, deep: true })
    expose({
      openModal,
      batchTag
    })

    return (): JSX.Element =>
      <>
        <Modal
          title='标签绑定'
          v-model:visible={visible.value}
          destroyOnClose
          // onUpdate:visible={() => { productTagList.value.length = 0 }}
          cancelText='关闭'
          okButtonProps={{ style: { display: 'none' } }}
        >
          <Spin spinning={loading.value}>
            {tagList.value.map(e => {
              return <Checkbox key={e.tagCode} checked={productTagList.value.some(ele => ele.tagCode === e.tagCode)} onUpdate:checked={(bool) => {
                checkChange(bool, e)
              }}>{e.tagName}</Checkbox>
            })}
          </Spin>
        </Modal>
        {props.showTagTable &&
          <Table columns={columns} loading={loading.value} dataSource={productTagList.value} pagination={false} size='small' scrollY={400} />}
      </>
  }
})
