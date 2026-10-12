
import { cubeBroadcastService } from '@/api/server'
import { CubeDataTimePicker, CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { Button, CellGroup, Field, Form, Picker, Popup, showFailToast } from 'vant'
import { computed, defineComponent, ref } from 'vue'
import { buildInVariables, extractVariables } from './broadcast-template-variables'
import { DateInput } from './components/date-input/date-input'
import { TimeInput } from './components/time-input/time-input'
import { DeviceSelectQueryByApplicationCode } from '@ghcloud/cube-iot-center-h5/src/components/device-select-by-application-code/device-select-by-application-code'
import type { SecurityDeviceRecord } from '@ghcloud/cube-security-management-service'
import dayjs from 'dayjs'

enum BroadcastWaySelect {
  '循环播放' = '循环播放',
  '次数播放' = '次数播放'
}
export const BroadcastCall = defineComponent({
  setup: () => {
    const loading = ref(false)
    const showTemplatesPicker = ref(false)
    const showWaysPicker = ref(false)
    const showDevicePicker = ref(false)
    const showStartTimePicker = ref(false)
    const showEndTimePicker = ref(false)
    const broadcastWaySelect = ref<BroadcastWaySelect | ''>('')
    const playCount = ref(0)
    const startTime = ref('')
    const endTime = ref('')
    const selectTerminal = ref<SecurityDeviceRecord | undefined>()
    const selectTemplate = ref<{
      id: string;
      name: string;
      content: string;
      defaulted: string;
    }>()
    const dynamicsVariables = ref<Record<string, string>>({})
    const templates = ref<{
      'id': string;
      'name': string;
      'content': string;
      'defaulted': string;
    }[]>([])
    cubeBroadcastService.getBroadcastTemplates().then(res => {
      templates.value = res
      if (res.length === 0) {
        showFailToast('没有查询到可用的广播模板')
      }
    })

    const variables = computed(() => {
      return extractVariables(selectTemplate.value?.content ?? '')
        .filter(e => Object.prototype.hasOwnProperty.call(buildInVariables, e))
    })
    const content = computed(() => {
      if (selectTemplate.value) {
        let res = selectTemplate.value.content
        variables.value.forEach((element, index) => {
          res = res.replace(element, dynamicsVariables.value[index] || `{变量${index + 1}-${buildInVariables[element].label}}`)
        })
        return res
      }
      return ''
    })

    const templateVariables = computed(() => {
      return variables.value.map((element, index) => {
        const labelText = `变量${index + 1}—${buildInVariables[element].label}`
        const placeholderText = `${buildInVariables[element].placeholder}`
        if (buildInVariables[element].type === 'datePicker') {
          return (
            <DateInput required label={labelText} placeholder={placeholderText} v-model:value={dynamicsVariables.value[index]} key={element + index} />
          )
        } else if (buildInVariables[element].type === 'timePicker') {
          return (
            <TimeInput required label={labelText} placeholder={placeholderText} v-model:value={dynamicsVariables.value[index]} key={element + index} />
          )
        } else {
          return (
            <Field
              key={element + index}
              label={labelText}
              placeholder={placeholderText}
              v-model={dynamicsVariables.value[index]}
              type={buildInVariables[element].type}
              autosize
              rules={[{ required: true, message: placeholderText }]}
            />
          )
        }
      })
    })

    const onSubmit = async (): Promise<void> => {
      if (!selectTemplate.value || !selectTerminal.value) {
        return
      }
      if (!dayjs(startTime.value).isBefore(dayjs(endTime.value))) {
        showFailToast('开始时间需小于结束时间')
        return
      }
      try {
        const broadcastTemplateCidontentParam = variables.value.map((element, index) => {
          return {
            name: element.slice(2, -1),
            value: dynamicsVariables.value[index] ?? ''
          }
        })
        const broadcastPlayDevices = [
          {
            id: selectTerminal.value.deviceId,
            code: selectTerminal.value.deviceCode,
            name: selectTerminal.value.deviceName,
            thirdPartyCode: selectTerminal.value.thirdPartyId
          }
        ]
        if (broadcastWaySelect.value === BroadcastWaySelect.次数播放) {
          const params = {
            id: selectTemplate.value.id,
            broadcastTemplateCidontentParam,
            broadcastPlayDevices,
            broadcastPlayNum: playCount.value,
          }
          await cubeBroadcastService.broadcastPlayByNum(params)
        } else {
          const params = {
            id: selectTemplate.value.id,
            broadcastTemplateCidontentParam,
            broadcastPlayDevices,
            startTime: startTime.value,
            endTime: endTime.value,
          }
          await cubeBroadcastService.broadcastPlayByCirculate(params)
        }
      } catch {
        showFailToast('广播失败')
      } finally {
        loading.value = false
      }
    }
    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='广播记录' />
        <Form onSubmit={onSubmit}>
          <CellGroup inset>
            <Field
              label='广播终端'
              placeholder='请选择'
              modelValue={selectTerminal.value?.deviceName}
              is-link
              readonly
              rules={[{ required: true, message: '请选择' }]}
              onClick={() => {
                showDevicePicker.value = true
              }}
            />
            <Field
              label='广播方式'
              placeholder='请选择'
              v-model={broadcastWaySelect.value}
              is-link
              readonly
              rules={[{ required: true, message: '请选择' }]}
              onClick={() => {
                showWaysPicker.value = true
              }}
            />
            {
              broadcastWaySelect.value === BroadcastWaySelect.次数播放 &&
                <Field
                  label='播放次数'
                  placeholder='请输入'
                  type='digit'
                  v-model={playCount.value}
                  rules={[{ required: true, message: '请输入播放次数' }]}
                  v-slots={{
                    extra: () => '次'
                  }}
                />
            }
            {
              broadcastWaySelect.value === BroadcastWaySelect.循环播放 &&
                <>
                  <Field
                    label='开始时间'
                    placeholder='请选择'
                    is-link
                    readonly
                    modelValue={startTime.value}
                    rules={[{ required: true, message: '请选择' }]}
                    onClick={() => {
                      showStartTimePicker.value = true
                    }}
                  />
                  <Field
                    label='结束时间'
                    placeholder='请选择'
                    is-link
                    readonly
                    modelValue={endTime.value}
                    rules={[{ required: true, message: '请选择' }]}
                    onClick={() => {
                      showEndTimePicker.value = true
                    }}
                  />
                </>
            }
            <Field
              label='广播模板'
              placeholder='请选择'
              modelValue={selectTemplate.value?.name}
              is-link
              readonly
              rules={[{ required: true, message: '请选择' }]}
              onClick={() => {
                showTemplatesPicker.value = true
              }}
            />
            {
              selectTemplate.value &&
                <>
                  {templateVariables.value}
                  <Field
                    label='广播内容'
                    modelValue={content.value}
                    readonly
                    type='textarea'
                    autosize
                  />
                </>
            }
          </CellGroup>
          <div style='margin: 16px;'>
            <Button round block type='primary' native-type='submit' loading={loading.value}>
              提交
            </Button>
          </div>
        </Form>
        {/* 广播方式弹窗 */}
        <Popup v-model:show={showWaysPicker.value} position='bottom'>
          <Picker
            columns={[
              { text: BroadcastWaySelect.次数播放, value: BroadcastWaySelect.次数播放 },
              { text: BroadcastWaySelect.循环播放, value: BroadcastWaySelect.循环播放 },
            ]}
            onCancel={() => {
              showWaysPicker.value = false
            }}
            onConfirm={(selected: { selectedValues: BroadcastWaySelect[]; }) => {
              broadcastWaySelect.value = selected.selectedValues[0]
              if (broadcastWaySelect.value === BroadcastWaySelect.次数播放) {
                playCount.value = 3
              }
              showWaysPicker.value = false
            }}
          />
        </Popup>
        {/* 广播模板弹窗 */}
        <Popup v-model:show={showTemplatesPicker.value} position='bottom'>
          <Picker
            columns={templates.value.map(e => {
              return {
                text: e.name, value: e
              }
            })}
            onCancel={() => {
              showTemplatesPicker.value = false
            }}
            onConfirm={(selected: { selectedOptions: { text: string;value: {
              id: string;
              name: string;
              content: string;
              defaulted: string;
            }; }[]; }) => {
              selectTemplate.value = selected.selectedOptions[0].value
              showTemplatesPicker.value = false
              dynamicsVariables.value = {}
            }}
          />
        </Popup>
        {/* 开始时间Picker */}
        <CubeDataTimePicker
          title='开始时间'
          v-model:visible={showStartTimePicker.value}
          v-model:value={startTime.value}
        />
        {/* 结束时间Picker */}
        <CubeDataTimePicker
          title='结束时间'
          v-model:visible={showEndTimePicker.value}
          v-model:value={endTime.value}
        />
        <DeviceSelectQueryByApplicationCode
          applicationCode={__ENV__.applicationCode}
          v-model:visible={showDevicePicker.value}
          selectDevice={selectTerminal.value}
          onSelected={(device: SecurityDeviceRecord) => {
            if (!device.thirdPartyId) {
              showFailToast('该设备未配置第三方ID')
            } else {
              selectTerminal.value = device
            }
            showDevicePicker.value = false
          }}
        />
      </>
  }
})
