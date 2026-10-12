import { eventConfigType, conditionType, comparator, deviceEventAlarmType } from '@ghcloud/cube-iot-center-app/utils/enum'
import { Button, Row, Col, Cascader, Select, Input, InputNumber, message } from 'antd'
import FormItem from 'antd/es/form/FormItem'
import type { AlarmRulesDeviceType, EmergencyRuleConditionExpsType, RuleDataType } from './alarm-rule-model'
import { logger } from '@ghcloud/cube-iot-center-app/log'
import { useImmer } from 'use-immer'
import { cubeDeviceCenterService } from '@ghcloud/cube-iot-center-app/service'
import { DeviceService } from '@ghcloud/cube-service/src/device/device.service'
import type { ReactElement } from 'react'
import { useAsyncEffect } from '@ghcloud/cube-iot-center-app/hooks/use-async-effect'
import { guid } from '@ghcloud/cube-iot-center-app/utils/common'
export const AlarmRuleAttr = (props: { groupItem: RuleDataType; attrIndex: number;deleteAttr: () => void;getInfo: (value: RuleDataType) => void; }) => {
  const urlParams = new URLSearchParams(location.search)
  const { groupItem, attrIndex, deleteAttr, getInfo } = props
  const [atIndex, setIndex] = useImmer<number>(attrIndex)
  const [triggerType, setTriggerType] = useImmer<string | undefined>('')
  const [ruleData, setRuleData] = useImmer<RuleDataType>(groupItem)
  const [deviceInfo, setDeviceInfo] = useImmer<AlarmRulesDeviceType>({
    deviceType: [],
    deviceModel: [],
    devicePropCode: [],
    deviceEventCode: [],
    propCode: [],
    conditionType: 'CUSTOM_RULE_CONDITION'
  })
  useAsyncEffect(async () => {
    logger.info(deviceInfo)
    const data = await cubeDeviceCenterService.getIotProductCategoryTree()
    setDeviceInfo((draft) => {
      draft.deviceType = data
    })
  }, [])
  useAsyncEffect(async () => {
    getDeviceModel(groupItem.deviceProdCategoryCodeConcat)
    groupItem.deviceProdId && getVoList(groupItem.deviceProdId)
  }, [groupItem])
  useAsyncEffect(async () => {
    setIndex(attrIndex)
  }, [attrIndex])
  useAsyncEffect(async () => {
    getInfo(ruleData)
  }, [ruleData])

  /** 通过条件表达式推断事件配置类型（老数据兼容用） */
  const inferEventConfigTypeFromExps = (
    exps: EmergencyRuleConditionExpsType[]
  ): 'THRESHOLD_SETTING' | 'PARAMETER_SETTING' | undefined => {
    if (!exps.length) return undefined
    const thresholdCodes = deviceEventAlarmType.map((item) => item.value)
    const isThreshold = exps.every((ele) => thresholdCodes.includes(ele.propCode as string))
    return isThreshold ? 'THRESHOLD_SETTING' : 'PARAMETER_SETTING'
  }

  // 当不存在 eventConfigType 时，根据已有条件表达式推断一次并写回，确保提交给服务端
  useAsyncEffect(async () => {
    if (ruleData.eventConfigType) return
    const inferred = inferEventConfigTypeFromExps(ruleData.emergencyRuleConditionExps)
    if (!inferred) return
    setRuleData((draft) => {
      draft.eventConfigType = inferred
    })
  }, [ruleData.eventConfigType, ruleData.emergencyRuleConditionExps])

  /** 设备事件配置 */
  const deviceProp = (propList: EmergencyRuleConditionExpsType[]): ReactElement => {
    const inferredFromExps = inferEventConfigTypeFromExps(ruleData.emergencyRuleConditionExps)
    const eventConfigTypeValue: 'THRESHOLD_SETTING' | 'PARAMETER_SETTING' =
      ruleData.eventConfigType ?? inferredFromExps ?? 'THRESHOLD_SETTING'
    return (
      <>
        <Col span={3}>
          <FormItem>
            <Select
              disabled={urlParams.get('type') === 'detail'}
              value={ruleData.deviceEventCode}
              onChange={(e, optionItem) => {
                const data = deviceInfo.deviceEventCode.find(item => item.eventCode === e) as unknown as {
                  eventConfig: {
                    eventRelatedProp: string[];
                  };
                }
                setDeviceInfo((dra) => {
                  dra.propCode = data.eventConfig.eventRelatedProp.map((propItem) => {
                    return {
                      label: propItem,
                      value: propItem,
                    }
                  })
                })
                setRuleData(dra => {
                  dra.deviceEventCode = e
                  dra.deviceEventType = (optionItem as { eventConfig: { triggerType: string; }; }).eventConfig.triggerType
                  dra.eventConfigType = 'THRESHOLD_SETTING'
                  dra.emergencyRuleConditionExps = [{
                    propCode: '@dev_event_delay@',
                    op: null,
                    oprand: '',
                    id: guid(),
                    delayTime: 0,
                    propName: '',
                    propUnit: '',
                    emergencyRuleConditionId: '',
                    emergencyRuleId: '',
                    startDelayTime: 0,
                    endDelayTime: 0
                  }]
                })
                // 事件类型 属性事件 原生事件
                const options = deviceInfo.deviceEventCode as unknown as { eventCode: string; eventConfig: { triggerType: string; }; }[]
                setTriggerType(options.find(ele => ele.eventCode === e)?.eventConfig.triggerType)
              }}
              placeholder='请选择设备事件'
              options={
                deviceInfo.deviceEventCode.map(e => {
                  return {
                    ...e,
                  }
                })
              }
              fieldNames={{
                label: 'eventName',
                value: 'eventCode'
              }}
              getPopupContainer={() => document.querySelector('.alarm-container') as unknown as HTMLElement}
            />
          </FormItem>
        </Col>
        {triggerType === 'NATURE' && (
          <Col span={3}>
            <FormItem>
              <Select
                disabled={urlParams.get('type') === 'detail'}
                value={eventConfigTypeValue}
                onChange={(value: 'THRESHOLD_SETTING' | 'PARAMETER_SETTING') => {
                  setRuleData((draft) => {
                    draft.eventConfigType = value
                    if (value === 'THRESHOLD_SETTING') {
                      draft.emergencyRuleConditionExps = [{
                        propCode: '@dev_event_delay@',
                        op: null,
                        oprand: '',
                        id: guid(),
                        delayTime: 0,
                        propName: '',
                        propUnit: '',
                        emergencyRuleConditionId: '',
                        emergencyRuleId: '',
                        startDelayTime: 0,
                        endDelayTime: 0
                      }]
                    } else {
                      draft.emergencyRuleConditionExps = [{
                        propCode: undefined,
                        op: null,
                        oprand: '',
                        id: guid(),
                        delayTime: 0,
                        propName: '',
                        propUnit: '',
                        emergencyRuleConditionId: '',
                        emergencyRuleId: '',
                        startDelayTime: 0,
                        endDelayTime: 0
                      }]
                    }
                  })
                }}
                placeholder='请选择设定比较'
                options={eventConfigType}
                getPopupContainer={() => document.querySelector('.alarm-container') as unknown as HTMLElement}
              />
            </FormItem>
          </Col>
        )}
        <div>
          {triggerType === 'NATURE' && eventConfigTypeValue === 'THRESHOLD_SETTING' &&
            propList.map((item, index) => {
              return (
                <div key={item.id} style={{ display: 'flex' }}>
                  <Col>
                    <FormItem>
                      <Select
                        disabled={urlParams.get('type') === 'detail'}
                        value={item.propCode}
                        placeholder='参数分类'
                        style={{ width: '120px' }}
                        options={
                          deviceEventAlarmType.map(e => {
                            return {
                              label: e.label,
                              value: e.value,
                              disabled: item.propCode !== e.value && !!ruleData.emergencyRuleConditionExps.find(ele => ele.propCode === e.value)
                            }
                          })
                        }
                        onChange={(e) => {
                          setRuleData((draft) => {
                            draft.emergencyRuleConditionExps[index].propCode = e
                          })
                        }}
                      />
                    </FormItem>
                  </Col>
                  <Col>
                    <FormItem>
                      <InputNumber
                        disabled={urlParams.get('type') === 'detail'}
                        value={item.oprand}
                        min='0'
                        onChange={(e) => {
                          setRuleData((draft) => {
                            const time: string = e as unknown as string
                            draft.emergencyRuleConditionExps[index].oprand = time
                          })
                        }}
                        addonAfter='秒'
                        placeholder='状态持续时延'
                      />
                    </FormItem>
                  </Col>
                  {urlParams.get('type') !== 'detail' && index === 0 ? <Button type='link' style={{ color: '#00ba8b' }} onClick={() => {
                    addPropList()
                  }}>添加</Button> : null}
                  {(urlParams.get('type') !== 'detail' && index !== 0) && <Button type='link' danger onClick={() => {
                    deletePropList(item.id)
                  }}>删除</Button>}
                </div>
              )
            })
          }
          {triggerType === 'NATURE' && eventConfigTypeValue === 'PARAMETER_SETTING' &&
            (() => {
              const selectedEvent = deviceInfo.deviceEventCode.find((e) => e.eventCode === ruleData.deviceEventCode)
              const eventParams = selectedEvent?.eventConfig?.params ?? []
              return propList.map((item, index) => {
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Col>
                      <FormItem>
                        <Select
                          disabled={urlParams.get('type') === 'detail'}
                          value={item.propCode}
                          style={{ width: '180px' }}
                          onChange={(e) => {
                            const param = eventParams.find((p) => p.param_code === e)
                            setRuleData((draft) => {
                              draft.emergencyRuleConditionExps[index].propCode = e
                              draft.emergencyRuleConditionExps[index].propName = param?.name ?? ''
                            })
                          }}
                          placeholder='请选择参数'
                          options={eventParams}
                          fieldNames={{
                            label: 'name',
                            value: 'param_code'
                          }}
                          getPopupContainer={() => document.querySelector('.alarm-container') as unknown as HTMLElement}
                        />
                      </FormItem>
                    </Col>
                  <Col>
                    <FormItem>
                      <Select
                        disabled={urlParams.get('type') === 'detail' || !item.propCode}
                        value={item.op}
                        style={{ width: '100px' }}
                        onChange={(e) => {
                          setRuleData((draft) => {
                            draft.emergencyRuleConditionExps[index].op = e
                          })
                        }}
                        placeholder='比较操作'
                        options={comparator}
                        getPopupContainer={() => document.querySelector('.alarm-container') as unknown as HTMLElement}
                      />
                    </FormItem>
                  </Col>
                  <Col>
                    <FormItem>
                      <Input
                        disabled={urlParams.get('type') === 'detail' || !item.propCode}
                        value={item.oprand}
                        onChange={(e: { target: { value: string } }) => {
                          setRuleData((draft) => {
                            draft.emergencyRuleConditionExps[index].oprand = e.target.value
                          })
                        }}
                        placeholder='请输入参数值'
                      />
                    </FormItem>
                  </Col>
                  {urlParams.get('type') !== 'detail' && index === 0 ? <Button type='link' style={{ color: '#00ba8b' }} onClick={() => addPropList()}>添加</Button> : null}
                  {urlParams.get('type') !== 'detail' && index !== 0 ? <Button type='link' danger onClick={() => deletePropList(item.id)}>删除</Button> : null}
                </div>
              )
            })
          })()}
        </div>
      </>
    )
  }
  /** 属性判断配置 */
  const getDeviceEvent = (propList: EmergencyRuleConditionExpsType[]): ReactElement => {
    return (
      <div style={{ display: 'inline-flex', flexFlow: 'column', width: '600px' }}>
        {
          propList.map((item, index) => {
            return (
              <div key={item.id} style={{ display: 'inline-flex' }}>
                <Col>
                  <FormItem>
                    <Select
                      disabled={urlParams.get('type') === 'detail'}
                      value={item.propCode}
                      style={{ width: '180px' }}
                      onChange={(e) => {
                        const name = deviceInfo.devicePropCode.find((item) => {
                          return item.propCode === e
                        })?.propName
                        setRuleData((draft) => {
                          draft.emergencyRuleConditionExps[index].propCode = e
                          draft.emergencyRuleConditionExps[index].propName = name as unknown as string
                        })
                      }}
                      placeholder='请选择设备属性' options={deviceInfo.devicePropCode} fieldNames={{
                        label: 'propName',
                        value: 'propCode'
                      }}
                      getPopupContainer={() => document.querySelector('.alarm-container') as unknown as HTMLElement}
                    />
                  </FormItem>
                </Col>
                <Col>
                  <FormItem>
                    <Select
                      disabled={urlParams.get('type') === 'detail'}
                      value={item.op}
                      style={{ width: '100px' }}
                      onChange={e => {
                        setRuleData((draft) => {
                          draft.emergencyRuleConditionExps[index].op = e
                        })
                      }}
                      placeholder='比较操作' options={comparator}
                      getPopupContainer={() => document.querySelector('.alarm-container') as unknown as HTMLElement}
                    />
                  </FormItem>
                </Col>
                <Col>
                  <FormItem>
                    <Input
                      disabled={urlParams.get('type') === 'detail'}
                      value={item.oprand}
                      onChange={(e: { target: { value: string; }; }) => {
                        setRuleData((draft) => {
                          draft.emergencyRuleConditionExps[index].oprand = e.target.value
                        })
                      }}
                      placeholder='请输入属性值'
                    />
                  </FormItem>
                </Col>
                <Col>
                  <FormItem>
                    <InputNumber
                      disabled={urlParams.get('type') === 'detail'}
                      min={0}
                      value={item.delayTime}
                      onChange={(e) => {
                        setRuleData((draft) => {
                          const time: number = e as unknown as number
                          draft.emergencyRuleConditionExps[index].delayTime = time
                        })
                      }}
                      addonAfter='秒'
                      placeholder='请输入具体值'
                      style={{ width: '100px' }}
                    />
                  </FormItem>
                </Col>
                {urlParams.get('type') !== 'detail' && index === 0 ? <Button type='link' style={{ color: '#00ba8b' }} onClick={() => {
                  addPropList()
                }}>添加</Button> : null}
                {(urlParams.get('type') !== 'detail' && index !== 0 && ruleData.emergencyRuleConditionExps.length > 1) ? <Button type='link' danger onClick={() => {
                  deletePropList(item.id)
                }}>删除</Button> : null}
              </div>
            )
          })
        }
      </div>
    )
  }

  /** 通过选择的类型获取对应的配置dom */
  const getRuleConfigDomByConditionType = (): ReactElement => {
    if (!ruleData.conditionType) {
      return <></>
    }
    switch (ruleData.conditionType) {
      case 'CUSTOM_RULE_CONDITION':
        return getDeviceEvent(ruleData.emergencyRuleConditionExps)
      case 'DEVICE_EVENT_CONDITION':
        return deviceProp(ruleData.emergencyRuleConditionExps)
      default:
        return <div>暂不支持{ruleData.conditionType}</div>
    }
  }

  return (
    <div className='alarm-rule-attr'>
      <FormItem label='报警规则:'>
        <Row gutter={21} wrap={false}>
          <Col span={3}>
            <FormItem>
              <Cascader
                fieldNames={{
                  label: 'categoryName',
                  value: 'categoryCode'
                }}
                getPopupContainer={() => document.querySelector('.alarm-container') as unknown as HTMLElement}
                value={ruleData.deviceProdCategoryCodeConcat === '' || ruleData.deviceProdCategoryCodeConcat === undefined ? [] : ruleData.deviceProdCategoryCodeConcat.split('-')}
                onChange={(value) => {
                  getModel(value)
                }}
                disabled={urlParams.get('type') === 'detail'} options={deviceInfo.deviceType} changeOnSelect placeholder='请选择产品品类'
              />
            </FormItem>
          </Col>
          <Col span={3}>
            <FormItem>
              <Select
                disabled={urlParams.get('type') === 'detail'}
                value={ruleData.deviceProdId}
                onChange={(value) => {
                  value && getCondition(value)
                }}
                placeholder='请选择产品名称' options={deviceInfo.deviceModel} fieldNames={{
                  label: 'name',
                  value: 'id'
                }}
                getPopupContainer={() => document.querySelector('.alarm-container') as unknown as HTMLElement}
              />
            </FormItem>
          </Col>
          <Col span={3}>
            <FormItem>
              <Select
                disabled={urlParams.get('type') === 'detail'}
                value={ruleData.conditionType}
                onChange={(value) => {
                  setRuleData((de) => {
                    de.emergencyRuleConditionExps = [{
                      propCode: undefined,
                      op: null,
                      oprand: '',
                      id: guid(),
                      delayTime: 0,
                      propName: '',
                      propUnit: '',
                      emergencyRuleConditionId: '',
                      emergencyRuleId: '',
                      startDelayTime: 0,
                      endDelayTime: 0
                    }]
                  })
                  setDifferentType(value)
                }}
                placeholder='请选择条件类型'
                options={conditionType}
                getPopupContainer={() => document.querySelector('.alarm-container') as unknown as HTMLElement}
              />
            </FormItem>
          </Col>
          {getRuleConfigDomByConditionType()}
          {(urlParams.get('type') !== 'detail' && atIndex !== 0 && ruleData.emergencyRuleConditionExps.length > 0) && <Button type='link' danger onClick={() => {
            deleteAlarmRule()
          }}>删除规则</Button>}
        </Row>
      </FormItem>
    </div>
  )

  async function getModel (value: any): Promise<void> {
    const info = (value)[(value).length - 1]
    getDeviceModel(info)
    setRuleData((draft) => {
      draft.deviceProdCategoryCodeConcat = (value).join('-')
    })
  }
  async function getDeviceModel (value: string): Promise<void> {
    try {
      if (!value) return
      const data = await cubeDeviceCenterService.getProductModel(value)
      setDeviceInfo((draft) => {
        draft.deviceModel = data
      })
    } catch (error: unknown) {
      message.error((error as { toJSON: () => Record<string, string>; }).toJSON().errorMessage)
    }
  }
  async function getCondition (value: string): Promise<void> {
    setRuleData((draft) => {
      draft.deviceProdId = value
    })
    getVoList(value)
  }
  async function getVoList (id: string): Promise<void> {
    if (!id) return
    const data = await DeviceService.getDeviceCondition({
      prodIds: id,
      withPropertySpec: true
    })
    logger.info(data, 1234)
    if (data.length === 0) return
    setDeviceInfo((draft) => {
      draft.devicePropCode = data[0]?.productPropVoList
      draft.deviceEventCode = data[0]?.productEventVoList

      // trigger 配置 回显
      const options = draft.deviceEventCode as unknown as { eventCode: string; eventConfig: { triggerType: string; }; }[]
      ruleData.deviceEventCode && setTriggerType(options.find(ele => ele.eventCode === ruleData.deviceEventCode)?.eventConfig.triggerType)
    })
  }
  function setDifferentType (value: string | null): void {
    logger.info(value)
    setRuleData((draft) => {
      draft.conditionType = value
    })
  }
  function addPropList (): void {
    setRuleData((draft) => {
      draft.emergencyRuleConditionExps.push({
        propCode: undefined,
        op: null,
        oprand: '',
        delayTime: 0,
        id: guid(),
        startDelayTime: 0,
        endDelayTime: 0,
        propName: '',
        propUnit: '',
        emergencyRuleConditionId: '',
        emergencyRuleId: '',
      })
    })
  }
  function deletePropList (index: string): void {
    setRuleData((draft) => {
      draft.emergencyRuleConditionExps = draft.emergencyRuleConditionExps.filter(item => item.id !== index)
    })
  }
  function deleteAlarmRule (): void {
    deleteAttr()
  }
}
