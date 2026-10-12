import { holidayBalanceDownLoad, holidayBalanceImport } from '@/api/staff-leave'
import { Button, message } from '@ghcloud/cube-ui'
import { FileUpload } from '@ghcloud/generic-component'
import { defineComponent, onMounted, ref, type PropType, computed, type VNode } from 'vue'

export const ImportData = defineComponent({
  props: {
    isAdd: {
      type: Boolean,
      default: false
    },
    holidayList: {
      type: Array as PropType<{ label: string; value: string; }[]>,
      default: []
    },
  },
  emits: ['update:value', 'success'],
  setup: (props, { emit, expose }) => {
    const excel = ref<Blob | null>(null)
    const fileUploadRef = ref<{ triggerUpload: () => void;clearAll: () => void; }>()
    onMounted(() => {
      fileUploadRef.value?.clearAll()
    })
    const ids = computed(() => {
      const res = props.holidayList ? props.holidayList.map(item => item.value) : []
      return res
    })
    const names = computed(() => {
      const res = props.holidayList ? props.holidayList.map(item => item.label) : []
      return res
    })
    const exportTemplate = async (): Promise<void> => {
      try {
        const res = await holidayBalanceDownLoad({
          holidayIdList: ids.value ?? [],
          initTemplate: !props.isAdd
        })
        if (res.data) {
          const link = document.createElement('a')
          const blob = new Blob([res.data as BlobPart], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          link.style.display = 'none'
          link.href = URL.createObjectURL(blob)
          link.setAttribute('download', `假期余额批量${props.isAdd ? '新增' : '修改'}模版.xlsx`)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch (error) {
      }
    }
    const handleImport = async (): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        try {
          if (!excel.value || JSON.stringify(excel.value) === '[]') {
            message.destroy()
            message.warning('请先上传文件')
            reject(new Error('请先上传文件'))
            return
          }
          holidayBalanceImport({
            file: excel.value,
            init: !props.isAdd,
            ruleNames: names.value ? names.value.join(',') : ''
          }).then(res => {
            if (res.data) {
              emit('success', res.data)
              resolve(res.data)
            }
          }).catch(error => {
            reject(error)
          })
        } catch (error) {
          reject(error)
          message.error((error as { errorMessage: string; })?.errorMessage ?? '网络异常')
        }
      })
    }
    expose({
      handleImport
    })
    return (): VNode=>
      <>
        <p style={{ margin: '5px 0' }}>
          点击下载
          <Button type='link' style={{ margin: '0', padding: '0' }} onClick={exportTemplate}>假期余额批量{props.isAdd ? '新增' : '修改'}模版</Button>
          ，按格式完善表格信息后，点击下方选择进行上传。
        </p>
        <FileUpload
          ref={fileUploadRef}
          showtext
          typelist={['.xls', '.xlsx']}
          customText='支持上传（.xls/.xlsx）文件'
          multiple={false}
          customupload
          v-modal:value={excel.value}
          onFile={(file) => {
            excel.value = file
            emit('update:value', excel.value)
          }}
          type='picture'
          dragger
        />
      </>
  }
})
