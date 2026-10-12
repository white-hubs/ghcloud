import { defineComponent, onMounted, ref } from 'vue'
import styles from './add-report.module.less'
import { useRouter } from 'vue-router'
import { Button, Form, CellGroup, Field, Popup, Picker, showNotify, DatePicker } from 'vant'
import { cubeMaintainService } from '@/api/server'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
type Columns = Record<string, string>
interface FormData {
  fileIds?: string[];
  name: string;
  value: string ;
  label?: string;
  key?: string;
  showPicker?: boolean;
  columns?: Columns[];
  files?: { path: string; };
}
export const AddReport = defineComponent({
  setup () {
    const router = useRouter()
    const formRef = ref()
    const columnsType = ref(['year', 'month', 'day'])
    const formItem = ref<FormData[]>([
      {
        name: '报告类型',
        value: '',
        label: '',
        columns: [
          { name: '日报', value: 'REPORT_DAY' },
          { name: '周报', value: 'REPORT_WEEK' },
          { name: '月报', value: 'REPORT_MONTH' },
        ]
      },
      {
        name: '报告时间',
        value: ''
      },
      {
        name: '故障描述',
        value: ''
      },
    ])
    const iosInputHandle = (): void => {
      // 判断是否是ios
      const ua = navigator.userAgent
      if (ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
        let flag = false
        let pageBackNormFunc: string | number | NodeJS.Timeout | null | undefined = null
        document.body.addEventListener('focusin', () => {
          // 软键盘弹起事件
          flag = true
          pageBackNormFunc && clearTimeout(pageBackNormFunc)
        })
        document.body.addEventListener('focusout', () => {
          // 软键盘关闭事件
          if (flag) {
            pageBackNormFunc = setTimeout(function () {
              // 当键盘收起的时候让页面回到原始位置
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
            }, 200)
          }
          flag = false
        })
      }
    }
    onMounted(async () => {
      iosInputHandle()
    })
    const handelPopup = (item: FormData): void => {
      if (['报告类型', '报告时间'].includes(item.name)) {
        if (item.name === '报告时间' && formItem.value.find(x => x.name === '报告类型')?.value === '') {
          showNotify({ type: 'warning', message: '请先选择报告类型' })
          return
        }
        item.showPicker = true
      }
    }
    // 下拉选择
    const pickerConfirm = (item: FormData, selectedOptions: Columns[]): void => {
      item.value = selectedOptions[0].name
      item.label = selectedOptions[0].value
      item.showPicker = false
      const form = formItem.value.find(x => x.name === '报告时间')
      if (form)form.value = ''
      if (item.name === '报告类型') {
        columnsType.value = item.label === 'REPORT_MONTH' ? ['year', 'month'] : ['year', 'month', 'day']
      }
    }
    // 选择时间
    const handlePicker = (item: FormData, selectedOptions: { text: string; }[]): void => {
      item.showPicker = false
      item.value = selectedOptions.map((item) => item.text).join('-')
    }
    // 提交表单
    const submit = async (): Promise<void> => {
      try {
        await formRef.value.validate()
        const formData = {
          type: formItem.value?.find(x => x.name === '报告类型')?.label ?? '',
          reportTime: formItem.value?.find(x => x.name === '报告时间')?.value ?? '',
          remark: formItem.value?.find(x => x.name === '故障描述')?.value ?? '',
        }
        if (formData.type === 'REPORT_MONTH')formData.reportTime = formData.reportTime + '-01'
        cubeMaintainService.addReport(formData).then(() => {
          router.go(-1)
          showNotify({ type: 'success', message: '提交成功' })
        }).catch(((e) => {
          showNotify({ type: 'danger', message: e.errorMessage })
        }))
      } catch {
      }
    }
    return (): JSX.Element =>
      <div class={styles.wrapper}>
        <CubeNavBar showBack title='新增报告' />
        <Form style={{ height: '89vh', overflow: 'auto' }} ref={formRef}>
          <div class={styles.basic}>
            <CellGroup inset>
              {
                formItem.value?.map((item) =>
                  <div key={item.name}>
                    <Field
                      placeholder={['报告类型', '报告时间'].includes(item.name) ? `请选择${item.name}` : `请输入${item.name}`}
                      readonly={['报告类型', '报告时间'].includes(item.name)}
                      type={item.name === '故障描述' ? 'textarea' : 'text'}
                      maxlength={item.name === '故障描述' ? 150 : 50}
                      show-word-limit={item.name === '故障描述'}
                      style={{ paddingLeft: '0px' }}
                      name={item.name}
                      label={item.name}
                      v-model={item.value}
                      rules={[{ required: true, message: `${item.name}不能为空` }]}
                      right-icon={['报告类型', '报告时间'].includes(item.name) ? 'arrow' : ''}
                      onClick={() => {
                        handelPopup(item)
                      }}
                    />
                    <Popup v-model:show={item.showPicker} position='bottom'>
                      {
                        item.name === '报告类型'
                          ? <Picker
                            columns={item.columns}
                            columns-field-names={{
                              text: 'name',
                              value: 'value',
                            }}
                            onConfirm={({ selectedOptions }: { selectedOptions: []; }) => {
                              pickerConfirm((item), selectedOptions)
                            }}
                            onCancel={() => {
                              item.showPicker = false
                            }}
                          />
                          : null
                      }
                      {
                        item.name === '报告时间'
                          ? <DatePicker
                            columnsType={columnsType.value}
                            onConfirm={({ selectedOptions }: { selectedOptions: { text: string; }[]; }) => {
                              handlePicker(item, selectedOptions)
                            }} onCancel={() => {
                              item.showPicker = false
                            }}
                          />
                          : null
                      }
                    </Popup>
                  </div>)
              }
            </CellGroup>
          </div>
        </Form>
        <Button block type='primary' class={styles.button} native-type='submit' onClick={submit}>提交</Button>
      </div>
  }
})
