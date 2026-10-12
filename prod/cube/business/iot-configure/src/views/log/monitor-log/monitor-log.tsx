
import { Button, Form, FormItem, Input, Modal, Table, Tag, message, Space, Tooltip } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, onUnmounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import Select from '@ghcloud/cube-ui/src/components/select/select'
import { getSystemLogList, updateLogLevel, type LoggerInfo } from '@/api/log-monitor'
import '@/views/log/monitor-log/monitor-log.less'

export const MonitorLog = defineComponent({
  setup: () => {
    const loading = ref(false)
    const dataSource = ref<LoggerInfo[]>([])
    const timer = ref<NodeJS.Timeout | null>(null)

    // 获取列表数据
    const getList = async () => {
      try {
        loading.value = true
        const res = await getSystemLogList()
        if (res.data) {
          dataSource.value = res.data
        }
      } catch (error) {
      } finally {
        loading.value = false
      }
    }

    // 倒计时逻辑
    const startTimer = () => {
      timer.value = setInterval(() => {
        dataSource.value.forEach(item => {
          if (item.isReverting && item.remainingSeconds > 0) {
            item.remainingSeconds--
            if (item.remainingSeconds <= 0) {
              item.isReverting = false
              // 可选：倒计时结束自动刷新一次
              // getList()
            }
          }
        })
      }, 1000)
    }

    onMounted(() => {
      getList()
      startTimer()
    })

    onUnmounted(() => {
      if (timer.value) {
        clearInterval(timer.value)
      }
    })

    // 设置等级弹窗相关
    const modalVisible = ref(false)
    const submitLoading = ref(false)
    const currentLogger = ref<LoggerInfo | null>(null)
    const modalMode = ref<'add' | 'edit'>('edit')
    const formState = reactive({
      gwId: '',
      level: 'INFO',
      duration: 30
    })

    const handleEdit = (record: LoggerInfo) => {
      modalMode.value = 'edit'
      currentLogger.value = record
      formState.gwId = record.gwId // 显示用
      formState.level = record.level
      formState.duration = 30 // 默认建议值
      modalVisible.value = true
    }

    const handleAdd = () => {
      modalMode.value = 'add'
      currentLogger.value = null
      formState.gwId = ''
      formState.level = 'DEBUG'
      formState.duration = 30
      modalVisible.value = true
    }

    const handleOk = async () => {
      const targetGwId = modalMode.value === 'add' ? formState.gwId : currentLogger.value?.gwId
      
      if (!targetGwId) {
        message.warning('请填写网关ID')
        return
      }
      try {
        submitLoading.value = true
        await updateLogLevel({
          gwId: targetGwId,
          level: formState.level,
          duration: Number(formState.duration)
        })
        message.success(modalMode.value === 'add' ? '添加成功' : '设置成功')
        modalVisible.value = false
        getList() // 刷新列表
      } catch (error) {
      } finally {
        submitLoading.value = false
      }
    }

    const levelOptions = [
      { label: 'DEBUG', value: 'DEBUG' },
      { label: 'INFO', value: 'INFO' },
      { label: 'WARN', value: 'WARN' },
      { label: 'ERROR', value: 'ERROR' },
      { label: 'OFF', value: 'OFF' },
    ]

    const columns = [
      {
        title: 'Logger 名称',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true
      },
      {
        title: '网关 ID',
        dataIndex: 'gwId',
        key: 'gwId',
        width: 180,
        customRender: ({ text }: { text: string }) => text || <span style={{ color: '#ccc' }}>未关联</span>
      },
      {
        title: '当前等级',
        dataIndex: 'level',
        key: 'level',
        width: 100,
        customRender: ({ text }: { text: string }) => {
            let color = 'default'
            if (text === 'DEBUG') color = 'blue'
            if (text === 'INFO') color = 'green'
            if (text === 'WARN') color = 'orange'
            if (text === 'ERROR') color = 'red'
            return <Tag color={color}>{text}</Tag>
        }
      },
      {
        title: '状态',
        key: 'status',
        width: 200,
        customRender: ({ record }: { record: LoggerInfo }) => {
          if (record.isReverting) {
             const minutes = Math.floor(record.remainingSeconds / 60)
             const seconds = record.remainingSeconds % 60
             return <span style={{color: '#faad14'}}>
               倒计时: {minutes}分{seconds}秒
             </span>
          }
          return record.isAttached ? <Tag color="cyan">独立日志中</Tag> : <span>-</span>
        }
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        customRender: ({ record }: { record: LoggerInfo }) => {
          const disabled = !record.gwId
          const btn = (
            <Button type="link" onClick={() => handleEdit(record)} disabled={disabled}>
              调整等级
            </Button>
          )
          if (disabled) {
            return (
              <Tooltip title="需关联网关插件后才可调试">
                {btn}
              </Tooltip>
            )
          }
          return btn
        }
      }
    ]

    const layoutSlots = {
      'layout-content': () => (
        <div class="monitor-log-container">
           <Space direction="vertical" size="middle" style={{ width: '100%' }}>
             <div class="search-bar">
               <Space>
                 <Button type="primary" onClick={handleAdd}>新增调试</Button>
                 <Button onClick={getList} loading={loading.value}>刷新列表</Button>
               </Space>
             </div>
             <Table
                columns={columns}
                dataSource={dataSource.value}
                loading={loading.value}
                rowKey="name"
                pagination={false}
             />
           </Space>
           <Modal
             v-model:visible={modalVisible.value}
             title="调整日志等级"
             onOk={handleOk}
             confirmLoading={submitLoading.value}
           >
             <Form layout="vertical">
               <FormItem label="网关 ID" required>
                 <Input 
                    v-model:value={formState.gwId} 
                    disabled={modalMode.value === 'edit'} 
                    placeholder="请输入网关ID"
                 />
               </FormItem>
               <FormItem label="目标等级">
                 <Select v-model:value={formState.level} options={levelOptions} />
               </FormItem>
               <FormItem label="持续时长 (分钟)">
                 <Input type="number" v-model:value={formState.duration} />
                 <div style={{color: '#999', fontSize: '12px', marginTop: '4px'}}>
                   设为 0 表示永久生效（不自动回退）
                 </div>
               </FormItem>
             </Form>
           </Modal>
        </div>
      )
    }

    return () => (
      <Layout title="日志调试" v-slots={layoutSlots} showFooter={false} />
    )
  }
})
