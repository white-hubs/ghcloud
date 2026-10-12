
import { computed, defineComponent, reactive, ref, watch } from 'vue'
import { Button, Table, Modal, Form, FormItem, Input, InputNumber, Select, Space, message, type FormInstance, PopOver, PopConfirm } from '@ghcloud/cube-ui'
import styles from './guide-content.module.less'
import { useRoute } from 'vue-router'

export interface GuideContentItem {
  key?: string;
  contentName: string;
  priority: number | null;
  boundField: string | null;
  fontSize?: number | undefined;
  fontColor?: string;
  id?: number;
}

const DATA_SOURCE_OPTIONS = [
  { label: '车位总数', value: 'total' },
  { label: '使用车位数', value: 'used' },
  { label: '剩余车位数', value: 'remain' },
]

export const GuideContent = defineComponent({
  props: {
    initData: {
      type: Array as () => GuideContentItem[],
      default: () => []
    }
  },
  setup: (props, { expose }) => {
    const route = useRoute()
    const dataSource = ref<GuideContentItem[]>([])
    const modalVisible = ref(false)
    const modalType = ref<'add' | 'edit'>('add')
    const currentEditIndex = ref<number>(-1)
    const formRef = ref<FormInstance>()

    const formState = reactive<GuideContentItem>({
      contentName: '',
      priority: null,
      boundField: null,
      fontSize: undefined,
      fontColor: '#080808'
    })

    const rules = {
      contentName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      priority: [{ required: true, message: '请输入优先级', trigger: 'blur' }],
      boundField: [{ required: true, message: '请选择数据绑定', trigger: 'change' }]
    }

    watch(() => props.initData, (newVal) => {
      if (newVal) {
        dataSource.value = JSON.parse(JSON.stringify(newVal))
      }
    }, { deep: true, immediate: true })

    const isView = computed(() => route.query.type === 'info')

    const columns = [
      { 
        title: '名称', 
        dataIndex: 'contentName', 
        key: 'contentName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      { 
        title: '优先级', 
        dataIndex: 'priority', 
        key: 'priority',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      { 
        title: '数据源绑定', 
        dataIndex: 'boundField', 
        key: 'boundField',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          const option = DATA_SOURCE_OPTIONS.find(opt => opt.value === text)
          const textVal = option ? option.label : text
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        dataIndex: 'action',
        title: '操作',
        slots: {
          customRender: 'action',
        },
        fixed: 'right',
        width: 180,
        customRender: ({ index }: { index: number }) => (
          <>
            <Button
              type='link'
              size='small'
              onClick={() => {
                handleEdit(index)
              }}
            >
              编辑
            </Button>
            <PopConfirm title='确认删除该项？' onConfirm={() => {
              handleDelete(index)
            }}>
              <Button type='link' size='small' danger>删除</Button>
            </PopConfirm>
          </>
        )
      }
    ]

    const handleAdd = () => {
      modalType.value = 'add'
      formState.contentName = ''
      formState.priority = null
      formState.boundField = null
      formState.fontSize = undefined
      formState.fontColor = '#080808'
      modalVisible.value = true
    }

    const handleEdit = (index: number) => {
      modalType.value = 'edit'
      currentEditIndex.value = index
      const item = dataSource.value[index]
      Object.assign(formState, item)
      modalVisible.value = true
    }

    const handleDelete = (index: number) => {
      dataSource.value.splice(index, 1)
    }

    const handleModalOk = async () => {
      try {
        await formRef.value?.validate()
        const newItem = { ...formState }
        if (modalType.value === 'add') {
          dataSource.value.push(newItem)
        } else {
          dataSource.value[currentEditIndex.value] = newItem
        }
        modalVisible.value = false
      } catch (error) {
      }
    }

    const getApiParams = () => {
      return dataSource.value
    }

    expose({ getApiParams })

    return () => (
      <div class={styles.container}>
        {
          !isView.value && 
          <div class={styles.header}>
             <Button type="primary" onClick={handleAdd}>添加</Button>
          </div>
        }
        <Table columns={isView.value ? columns?.slice(0, -1) : columns} dataSource={dataSource.value} pagination rowKey="id" size='small' />
        
        <Modal
          v-model:visible={modalVisible.value}
          title={`${modalType.value === 'add' ? '添加' : '编辑'}引导内容`}
          onOk={handleModalOk}
          width={600}
        >
          <Form ref={formRef} model={formState} rules={rules} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
            <FormItem label="名称" name="contentName">
              <Input v-model:value={formState.contentName} placeholder="请输入名称" />
            </FormItem>
            <FormItem label="优先级" name="priority">
              <InputNumber v-model:value={formState.priority} placeholder="请输入优先级" max={99999} style={{ width: '100%' }} />
            </FormItem>
            <FormItem label="数据源绑定" name="boundField">
              <Select v-model:value={formState.boundField} options={DATA_SOURCE_OPTIONS} placeholder="请选择数据源绑定" allowClear />
            </FormItem>
            <FormItem label="字体大小" name="fontSize">
              <InputNumber v-model:value={formState.fontSize} style={{ width: '100%' }} max={99999} placeholder="请输入字体大小" />
            </FormItem>
            <FormItem label="字体颜色" name="fontColor">
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Input v-model:value={formState.fontColor} style={{ marginRight: '8px' }} placeholder="请输入字体颜色" />
                  <input type="color" v-model={formState.fontColor} />
               </div>
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
})
