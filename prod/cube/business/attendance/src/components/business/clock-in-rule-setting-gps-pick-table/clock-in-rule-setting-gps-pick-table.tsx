import { Button, Form, FormItem, Input, Modal, PopConfirm, PopOver, Table, type FormExpose, RadioGroup } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref, watch, type VNode } from 'vue'
import { Map } from './map'
import InputNumber from '@ghcloud/cube-ui/src/components/input-number/input-number'
import Checkbox from '@ghcloud/cube-ui/src/components/checkbox/checkbox'
import { KEYWORD_ALIAS } from '@ghcloud/cube-business-alias-manage-plugin'

interface Props {
  readonly: boolean;
  value: {
    locationList: unknown[];
    faceRecognition: boolean;
    outClock: boolean;
  };
}

export const ClockInRuleSettingGPSPickerTable = defineComponent({
  props: ['readonly', 'value'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const modalVisible = ref(false)
    const openModal = (): void => {
      modalVisible.value = true
    }
    const formInstance = ref<FormExpose>()
    const formState = reactive({
      address: '',
      ranges: undefined,
      latitude: 0,
      longitude: 0
    })
    const inputDisabled = ref(true)

    const locationList = ref<unknown[]>(props.value.locationList ?? [])
    const outClock = ref(props.value?.outClock ?? false)
    const faceRecognition = ref(props.value?.faceRecognition ?? false)

    const delRow = (index: number): void => {
      locationList.value.splice(index, 1)
    }
    const columns = [
      {
        title: '考勤地址',
        dataIndex: 'address',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '考勤范围',
        dataIndex: 'ranges',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text + '米' || '--'}>{text + '米' || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        customRender: ({ index }: { index: number; }): VNode => {
          return (
            <>
              <PopConfirm title='确认移除该项？' onConfirm={() => {
                delRow(index)
              }}>
                <Button type='link' size='small' danger>移除</Button>
              </PopConfirm>
            </>
          )
        }
      }
    ]
    if (props.readonly) {
      columns.pop()
    }
    const emitValue = (): void => {
      if (props.readonly) {
        return
      }
      emit('update:value', {
        locationList: locationList.value,
        outClock: outClock.value,
        faceRecognition: faceRecognition.value,
      })
    }

    const ok = async (): Promise<void> => {
      formInstance.value?.clearValidate()
      await formInstance.value?.validate()
      locationList.value.push({ ...formState })
      formState.address = ''
      formState.ranges = undefined
      formState.latitude = 0
      formState.longitude = 0
      modalVisible.value = false
      emitValue()
    }
    const clickMap = (map: { lat: number; lng: number;address: string; }): void => {
      inputDisabled.value = false
      formState.address = map.address
      formState.latitude = map.lat
      formState.longitude = map.lng
    }

    watch(() => props.value, () => {
      if (props.value) {
        locationList.value = props.value.locationList ?? []
        outClock.value = props.value?.outClock ?? false
        faceRecognition.value = props.value?.faceRecognition ?? false
      }
    }, { deep: true, immediate: true })

    return (): VNode => {
      const header = (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          {
            !props.readonly &&
              <>
                <Button type='primary' shape='round' onClick={openModal} disabled={locationList.value.length >= 5}>添加考勤地点</Button>
              </>
          }
        </div>
      )

      const body = (
        <>
          <Table columns={columns} dataSource={locationList.value} pagination={false} size='small' scrollY={440} />
          <div style='margin-top:20px'>
            <span style='margin-right:20px'>外勤打卡</span>
            <RadioGroup
              readonly={props.readonly}
              v-model:value={outClock.value}
              options={[{ label: '允许范围外打卡，考勤计为正常外勤考勤', value: true }, { label: '不允许范围外打卡', value: false }]}
              onUpdate:value={() => {
                emitValue()
              }}
            />
          </div>
          <div style='margin-top:20px'>
            <span style='margin-right:20px'>人脸识别</span>
            <Checkbox
              v-model:checked={faceRecognition.value}
              style='margin-top:10px;margin-left:0'
              onUpdate:checked={() => {
                emitValue()
              }}
              disabled={props.readonly}
            >{`${KEYWORD_ALIAS.staff}`}GPS打卡时必须进行人脸识别认证
            </Checkbox>
          </div>
        </>
      )

      const form = (
        <Form
          layout='inline' style={{ marginBottom: '20px' }} rules={{
            address: [{ required: true, message: '请输入考勤地址' }],
            ranges: [{ required: true, message: '请输入考勤范围' }]
          }}
          ref={formInstance}
          model={formState}
        >
          <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px', width: '500px' }} label='考勤地址' name='address'>
            <Input v-model:value={formState.address} placeholder='请输入考勤地址' showCount maxlength='50' disabled={inputDisabled.value} />
          </FormItem>
          <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='考勤范围' name='ranges'>
            <div style='display: flex;align-items: center;'>
              <InputNumber v-model:value={formState.ranges} placeholder='单位（米）' min={1} max={3000} disabled={inputDisabled.value} />
              <span style='margin-left:5px'>米</span>
            </div>
          </FormItem>
        </Form>
      )
      return (
        <>
          {header}
          {body}
          <Modal v-model:visible={modalVisible.value} title='添加考勤地点' width='1000px' destroyOnClose onOk={ok}>
            {form}
            <Map onClick={clickMap} />
          </Modal>
        </>
      )
    }
  }
})
