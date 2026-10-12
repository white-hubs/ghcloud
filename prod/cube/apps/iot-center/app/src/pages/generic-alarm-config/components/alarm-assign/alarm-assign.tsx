
import FormItem from 'antd/es/form/FormItem'
import { SelectNotice } from '../common/select-notice/select-notice'
import '../components.less'
import { Button, Checkbox, Col, message, Row, Select } from 'antd'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import type { AlarmAssignRef, AlarmAssignType } from './alarm-assign-modal'
import type { NoticeType, TargetModifyParams } from '../common/select-notice/select-notice.model'
import { guid } from '@ghcloud/cube-iot-center-app/utils/common'
import { useAsyncEffect } from '@ghcloud/cube-iot-center-app/hooks/use-async-effect'
import { OuaaService, type Application } from '@ghcloud/cube-service'
import { cubeMessageCenterService } from '../../../../api/service'
import { BooleanTag, getNoticeTargetLabel, getNoticeTargetNames, getOptionLabels, ReadonlyDescriptions, ReadonlyTags } from '../common/read-only/read-only'

const appCode = 'ATTENDANCE_MANAGEMENT'
/** 报警指派 */
export const AlarmAssign = forwardRef<AlarmAssignRef, { info: AlarmAssignType<'ALARM_NOTIFY_ACTION'>; application: string; readonly?: boolean; }>(({ info, application, readonly }, ref) => {
  useImperativeHandle(ref, () => ({ // 暴露给父组件的方法
    getValue,
    addRule
  }))
  const [hasAttendance, setHasAttendance] = useState<boolean>(false)
  const urlParams = new URLSearchParams(location.search)
  const isReadonly = readonly ?? urlParams.get('type') === 'detail'
  const [alarmAssign, setAlarmAssign] = useState<AlarmAssignType<'ALARM_NOTIFY_ACTION'>>(
    {
      actionType: 'ALARM_NOTIFY_ACTION',
      enabled: true,
      actionConfig: {
        dutyUser: false,
        targetModifyParams: [
          {
            id: guid(),
            messageTargetNotify: 'USER',
            targetConfig: []
          }
        ],
        channelTypes: []
      }
    }
  )
  const [copyAlarmAssign, setCopyAlarmAssign] = useState<AlarmAssignType<'ALARM_NOTIFY_ACTION'>>(
    {
      actionType: 'ALARM_NOTIFY_ACTION',
      enabled: true,
      actionConfig: {
        dutyUser: false,
        targetModifyParams: [
          {
            id: guid(),
            messageTargetNotify: 'USER',
            targetConfig: []
          }
        ],
        channelTypes: []
      }
    }
  )
  const [noticeWay, setNoticeWay] = useState<{
    value: string;
    label: string;
  }[]>([])
  const getNoticeWays = async (): Promise<void> => {
    try {
      const currentApplication = JSON.parse((sessionStorage.getItem('GH-currentApplication') as unknown as string)) as { code: string; }
      const appCode = currentApplication.code === 'EMERGENCY_CENTER' ? application : currentApplication.code
      if (!appCode) return
      const noticeMethod = await cubeMessageCenterService.sceneNotificationMethod(`${appCode}_ALARM_ASSIGN_NOTIFY`)
      setNoticeWay(noticeMethod)
    } catch (error: unknown) {
      message.error((error as { toJSON: () => Record<string, string>; }).toJSON().errorMessage)
    }
  }
  const getValue = (): AlarmAssignType<'ALARM_NOTIFY_ACTION'> => {
    return copyAlarmAssign
  }
  useAsyncEffect(async () => {
    if (info === undefined) return
    info.actionConfig.targetModifyParams.forEach((item) => {
      item.id = guid()
    })
    setCopyAlarmAssign(info)
    setAlarmAssign(info)
  }, [info])
  const getAppList = async (): Promise<void> => {
    const tenant = sessionStorage.getItem('cube-auth--tenant') as unknown as string
    const result = await OuaaService.productApplications(tenant, false)
    const attendanceIndex = result.findIndex((item: Application) => item.code === appCode)
    if (attendanceIndex !== -1) {
      setHasAttendance(true)
    } else {
      setHasAttendance(false)
    }
  }
  useAsyncEffect(async () => {
    getAppList()
  }, [])
  useEffect(() => {
    getNoticeWays()
  }, [application])
  const changeParams = (value: TargetModifyParams, index: number): void => {
    const copyActionConfig = JSON.parse(JSON.stringify(copyAlarmAssign.actionConfig)) as NoticeType
    copyActionConfig.targetModifyParams[index].messageTargetNotify = value.messageTargetNotify
    copyActionConfig.targetModifyParams[index].targetConfig = value.targetConfig
    setCopyAlarmAssign({
      ...copyAlarmAssign,
      actionConfig: copyActionConfig
    })

    const actionConfig = JSON.parse(JSON.stringify(alarmAssign.actionConfig)) as NoticeType
    actionConfig.targetModifyParams[index].messageTargetNotify = value.messageTargetNotify
    actionConfig.targetModifyParams[index].targetConfig = value.targetConfig
    setAlarmAssign({
      ...alarmAssign,
      actionConfig
    })
  }
  if (isReadonly) {
    return (
      <div>
        {alarmAssign.actionConfig.targetModifyParams.map((item, index) => (
          <div key={item.id} className='alarm-detail-card'>
            <div className='alarm-detail-card-title'>指派对象 {index + 1}</div>
            <ReadonlyDescriptions
              items={[
                { label: '对象类型', value: getNoticeTargetLabel(item.messageTargetNotify) },
                { label: '对象名称', value: <ReadonlyTags values={getNoticeTargetNames(item)} />, span: 3 },
              ]}
            />
          </div>
        ))}
        {hasAttendance && (
          <ReadonlyDescriptions items={[{ label: '仅指派给当班人员', value: <BooleanTag value={alarmAssign.actionConfig.dutyUser} /> }]} />
        )}
        <ReadonlyDescriptions
          items={[
            {
              label: '通知方式',
              value: <ReadonlyTags values={getOptionLabels(noticeWay, alarmAssign.actionConfig.channelTypes)} />,
            },
          ]}
        />
      </div>
    )
  }
  return (
    <>
      {
        alarmAssign.actionConfig.targetModifyParams.map((item, index) => {
          return (
            <div key={item.id} style={{ marginTop: '20px', display: 'flex' }}>
              <SelectNotice setTargetModifyParams={(value) => {
                changeParams(value, index)
              }} info={item} />
              {urlParams.get('type') !== 'detail' && (index !== 0 && <Button danger type='link' onClick={() => {
                deleteNotice(item.id)
              }}>删除</Button>)}
            </div>
          )
        })
      }
      {hasAttendance &&
        <FormItem>
          <Checkbox
            disabled={isReadonly}
            checked={alarmAssign.actionConfig.dutyUser}
            onChange={(e) => {
              let actionConfig = { ...alarmAssign.actionConfig }
              actionConfig.dutyUser = e.target.checked
              setAlarmAssign({
                ...alarmAssign,
                actionConfig
              })

              actionConfig = { ...copyAlarmAssign.actionConfig }
              actionConfig.dutyUser = e.target.checked
              setCopyAlarmAssign({
                ...copyAlarmAssign,
                actionConfig
              })
            }}
          >是否仅指派给当班人员
          </Checkbox>
        </FormItem>}

      <Row gutter={16}>
        <Col span={8}>
          <FormItem label='通知方式'>
            <Select
              disabled={isReadonly}
              options={noticeWay}
              mode='multiple'
              placeholder='未设置则按照消息中心配置进行通知'
              value={alarmAssign.actionConfig.channelTypes}
              onChange={(e) => {
                setAlarmAssign({
                  ...alarmAssign,
                  actionConfig: {
                    dutyUser: alarmAssign.actionConfig.dutyUser,
                    targetModifyParams: alarmAssign.actionConfig.targetModifyParams,
                    channelTypes: e
                  }
                })
                setCopyAlarmAssign({
                  ...copyAlarmAssign,
                  actionConfig: {
                    dutyUser: copyAlarmAssign.actionConfig.dutyUser,
                    targetModifyParams: copyAlarmAssign.actionConfig.targetModifyParams,
                    channelTypes: e
                  }
                })
              }}
            />
          </FormItem>
        </Col>
      </Row>
    </>
  )

  function deleteNotice (id: string | undefined): void {
    setAlarmAssign({
      ...alarmAssign,
      actionConfig: {
        dutyUser: alarmAssign.actionConfig.dutyUser,
        targetModifyParams: alarmAssign.actionConfig.targetModifyParams.filter((item) => {
          return item.id !== id
        }),
        channelTypes: alarmAssign.actionConfig.channelTypes
      }
    })
    setCopyAlarmAssign({
      ...copyAlarmAssign,
      actionConfig: {
        dutyUser: copyAlarmAssign.actionConfig.dutyUser,
        targetModifyParams: copyAlarmAssign.actionConfig.targetModifyParams.filter((item) => {
          return item.id !== id
        }),
        channelTypes: copyAlarmAssign.actionConfig.channelTypes
      }
    })
  }
  function addRule (): void {
    setCopyAlarmAssign({
      ...copyAlarmAssign,
      actionConfig: {
        dutyUser: copyAlarmAssign.actionConfig.dutyUser,
        targetModifyParams: [...copyAlarmAssign.actionConfig.targetModifyParams, {
          messageTargetNotify: 'USER',
          id: guid(),
          targetConfig: []
        }],
        channelTypes: copyAlarmAssign.actionConfig.channelTypes
      }
    })
    setAlarmAssign({
      ...alarmAssign,
      actionConfig: {
        dutyUser: alarmAssign.actionConfig.dutyUser,
        targetModifyParams: [...alarmAssign.actionConfig.targetModifyParams, {
          messageTargetNotify: 'USER',
          id: guid(),
          targetConfig: []
        }],
        channelTypes: alarmAssign.actionConfig.channelTypes
      }
    })
  }
})
