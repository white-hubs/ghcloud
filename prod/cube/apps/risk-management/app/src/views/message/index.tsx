import { Button, CheckboxGroup, FormItem, InputNumber, Select, TabPane, Tabs, TreeSelect, message } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { cubeMessageCenterService, cubeMessageService, cubeOuaaService, cubeTypeService } from '@/api/service'
import { Layout } from '@/components/layout/layout'
import { usePageName } from '@ghcloud/cube-utils'

export const Message = defineComponent({

  setup: () => {
    const { pageTitle } = usePageName()
    const ouaaOptions = ref([])
    const riskType = ref([])
    const activeKey = ref('RISK_SOURCE_OVERDUE_ABOUT')
    const startClock = ref<unknown[]>([])
    const startImperative = ref<unknown[]>([])
    const endClock = ref<unknown[]>([])
    const tabChange = (value: string): void => {
      activeKey.value = value
    }
    const uuid = (): string => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0; const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
    const OverTimeList = ref<{
      id: string;
      label: string;
      noticeObjs: {
        objId: string[];
        objType: string | undefined;
        id: string;
      }[];
      noticeWays: { noticeWay: string }[];
      sceneCode: string;
      value: number;
      name: string | null;
    }[]>([{
      id: uuid(),
      label: 'RISK_SOURCE_OVERDUE',
      noticeObjs: [{
        objId: [],
        objType: undefined,
        id: uuid()
      }],
      noticeWays: [],
      sceneCode: 'RISK_SOURCE_OVERDUE',
      value: 1,
      name: null
    }])
    const soonOverTimeList = ref<{
      id: string;
      label: string;
      noticeObjs: {
        objId: string[];
        objType: string | undefined;
        id: string;
      }[];
      noticeWays: { noticeWay: string }[];
      sceneCode: string;
      value: number;
      name: string | null;
    }[]>([{
      id: uuid(),
      label: 'RISK_SOURCE_OVERDUE_ABOUT',
      noticeObjs: [{
        objId: [],
        objType: undefined,
        id: uuid()
      }],
      noticeWays: [],
      sceneCode: 'RISK_SOURCE_OVERDUE_ABOUT',
      value: 1,
      name: null
    }])
    const imperativeTimeList = ref<{
      id: string;
      label: string;
      noticeObjs: {
        objId: string[];
        objType: string | undefined;
        id: string;
      }[];
      noticeWays: { noticeWay: string }[];
      sceneCode: string;
      value: number;
      name: string | null;
    }[]>([{
      id: uuid(),
      label: 'MANDATORY_TESTING_OVERDUE_ABOUT',
      noticeObjs: [{
        objId: [],
        objType: undefined,
        id: uuid()
      }],
      noticeWays: [],
      sceneCode: 'MANDATORY_TESTING_OVERDUE_ABOUT',
      value: 1,
      name: null
    }])
    const addSoList = (): void => {
      OverTimeList.value.push(
        {
          id: uuid(),
          label: 'RISK_SOURCE_OVERDUE',
          noticeObjs: [{
            objId: [],
            objType: undefined,
            id: uuid()
          }],
          noticeWays: [],
          sceneCode: 'RISK_SOURCE_OVERDUE',
          value: 1,
          name: null
        }
      )
    }
    const addSoonList = (): void => {
      soonOverTimeList.value.push(
        {
          id: uuid(),
          label: 'RISK_SOURCE_OVERDUE_ABOUT',
          noticeObjs: [{
            objId: [],
            objType: undefined,
            id: uuid()
          }],
          noticeWays: [],
          sceneCode: 'RISK_SOURCE_OVERDUE_ABOUT',
          value: 1,
          name: null
        }
      )
    }
    const addImperativeList = (): void => {
      imperativeTimeList.value.push(
        {
          id: uuid(),
          label: 'MANDATORY_TESTING_OVERDUE_ABOUT',
          noticeObjs: [{
            objId: [],
            objType: undefined,
            id: uuid()
          }],
          noticeWays: [],
          sceneCode: 'MANDATORY_TESTING_OVERDUE_ABOUT',
          value: 1,
          name: null
        }
      )
    }
    const addSoonOverUser = (index: number): void => {
      soonOverTimeList.value[index].noticeObjs.push(
        {
          objId: [],
          objType: undefined,
          id: uuid()
        }
      )
    }
    const deleteSoonOverUser = (index: number): void => {
      soonOverTimeList.value[index].noticeObjs.splice(index, 1)
    }
    const addOverUser = (index: number): void => {
      OverTimeList.value[index].noticeObjs.push(
        {
          objId: [],
          objType: undefined,
          id: uuid()
        }
      )
    }
    const deleteOverUser = (index: number): void => {
      OverTimeList.value[index].noticeObjs.splice(index, 1)
    }
    const addImperativeUser = (index: number): void => {
      imperativeTimeList.value[index].noticeObjs.push(
        {
          objId: [],
          objType: undefined,
          id: uuid()
        }
      )
    }
    const deleteImperativeUser = (index: number): void => {
      imperativeTimeList.value[index].noticeObjs.splice(index, 1)
    }

    const deleteSoon = (index: number): void => {
      OverTimeList.value.splice(index, 1)
    }
    const deleteList = (index: number): void => {
      soonOverTimeList.value.splice(index, 1)
    }
    const deleteImperativeList = (index: number): void => {
      imperativeTimeList.value.splice(index, 1)
    }

    const changeSelect = (value: string[]): void => {
    }

    const getStart = async (): Promise<void> => {
      const data = await cubeMessageService.getMessage({
        businessType: 'RISK_SOURCE',
        label: 'RISK_SOURCE_OVERDUE_ABOUT'
      })

      startClock.value = await cubeMessageCenterService.sceneNotificationMethod('RISK_SOURCE_OVERDUE_ABOUT')
      
      // 处理空数据情况，防止 data 为 undefined 或 null
      if (data && Array.isArray(data) && data.length > 0) {
        soonOverTimeList.value = data.map((item: {
          id: string; noticeWays: { noticeWay: string }[]; noticeObjs: {
            id: string; objId: string; objType: string | undefined
          }[]
        }) => ({
          id: item.id || uuid(),
          label: 'RISK_SOURCE_OVERDUE_ABOUT',
          noticeWays: (item.noticeWays?.map(e => e.noticeWay) || []) as never[],
          noticeObjs: (item.noticeObjs || []).map(e => ({
            objId: e.objId ? (typeof e.objId === 'string' ? (e.objId as string).split(',').filter(id => id) : e.objId) as never[] : [],
            objType: e.objType,
            id: e.id || uuid()
          })),
          sceneCode: 'RISK_SOURCE_OVERDUE_ABOUT',
          value: 1,
          name: null
        }))
      } else {
        // 如果没有数据，保持默认的初始状态
        soonOverTimeList.value = [{
          id: uuid(),
          label: 'RISK_SOURCE_OVERDUE_ABOUT',
          noticeObjs: [{
            objId: [],
            objType: undefined,
            id: uuid()
          }],
          noticeWays: [],
          sceneCode: 'RISK_SOURCE_OVERDUE_ABOUT',
          value: 1,
          name: null
        }]
      }
    }
    const getImperative = async (): Promise<void> => {
      const data = await cubeMessageService.getMessage({
        businessType: 'RISK_SOURCE',
        label: 'MANDATORY_TESTING_OVERDUE_ABOUT'
      })
      startImperative.value = await cubeMessageCenterService.sceneNotificationMethod('MANDATORY_TESTING_OVERDUE_ABOUT')
      
      // 处理空数据情况，防止 data 为 undefined 或 null
      if (data && Array.isArray(data) && data.length > 0) {
        imperativeTimeList.value = data.map((item: {
          id: string; noticeWays: { noticeWay: string }[]; noticeObjs: {
          id: string; objId: string; objType: string | undefined
        }[]
        }) => ({
          id: item.id || uuid(),
          label: 'MANDATORY_TESTING_OVERDUE_ABOUT',
          noticeWays: (item.noticeWays?.map(e => e.noticeWay) || []) as never[],
          noticeObjs: (item.noticeObjs || []).map(e => ({
            objId: e.objId ? (typeof e.objId === 'string' ? (e.objId as string).split(',').filter(id => id) : e.objId) as never[] : [],
            objType: e.objType,
            id: e.id || uuid()
          })),
          sceneCode: 'MANDATORY_TESTING_OVERDUE_ABOUT',
          value: 1,
          name: null
        }))
      } else {
        // 如果没有数据，保持默认的初始状态
        imperativeTimeList.value = [{
          id: uuid(),
          label: 'MANDATORY_TESTING_OVERDUE_ABOUT',
          noticeObjs: [{
            objId: [],
            objType: undefined,
            id: uuid()
          }],
          noticeWays: [],
          sceneCode: 'MANDATORY_TESTING_OVERDUE_ABOUT',
          value: 1,
          name: null
        }]
      }
    }
    const getEnd = async (): Promise<void> => {
      const data = await cubeMessageService.getMessage({
        businessType: 'RISK_SOURCE',
        label: 'RISK_SOURCE_OVERDUE'
      })
      
      endClock.value = await cubeMessageCenterService.sceneNotificationMethod('RISK_SOURCE_OVERDUE')
      
      // 处理空数据情况，防止 data 为 undefined 或 null
      if (data && Array.isArray(data) && data.length > 0) {
        OverTimeList.value = data.map((item: {
          id: string; noticeWays: { noticeWay: string; }[]; noticeObjs: {
          id: string; objId: string; objType: string | undefined; 
        }[]; }) => ({
          id: item.id || uuid(),
          label: 'RISK_SOURCE_OVERDUE',
          noticeWays: (item.noticeWays?.map(e => e.noticeWay) || []) as never[],
          noticeObjs: (item.noticeObjs || []).map(e => ({
            objId: e.objId ? (typeof e.objId === 'string' ? (e.objId as string).split(',').filter(id => id) : e.objId) as never[] : [],
            objType: e.objType,
            id: e.id || uuid()
          })),
          sceneCode: 'RISK_SOURCE_OVERDUE',
          value: 1,
          name: null
        }))
      } else {
        // 如果没有数据，保持默认的初始状态
        OverTimeList.value = [{
          id: uuid(),
          label: 'RISK_SOURCE_OVERDUE',
          noticeObjs: [{
            objId: [],
            objType: undefined,
            id: uuid()
          }],
          noticeWays: [],
          sceneCode: 'RISK_SOURCE_OVERDUE',
          value: 1,
          name: null
        }]
      }
    }
    const getData = async (): Promise <void> => {
      getStart()
      getEnd()
      getImperative()
    }
    const loading = ref(false)
    
    // 输入校验函数
    const validateForm = (): { isValid: boolean; errorMessage: string; targetTab?: string } => {
      // 校验即将到期提醒
      for (let i = 0; i < soonOverTimeList.value.length; i++) {
        const item = soonOverTimeList.value[i]
        
        // 校验天数
        if (!item.value || item.value < 1 || item.value > 999) {
          return { 
            isValid: false, 
            errorMessage: `即将到期提醒天数：请输入1-999之间的天数`,
            targetTab: 'RISK_SOURCE_OVERDUE_ABOUT'
          }
        }
        
        // 校验通知方式
        if (startClock.value.length > 0 && (!item.noticeWays || item.noticeWays.length === 0)) {
          return { 
            isValid: false, 
            errorMessage: `即将到期提醒通知方式：请选择至少一种通知方式`,
            targetTab: 'RISK_SOURCE_OVERDUE_ABOUT'
          }
        }
        
        // 校验通知对象
        for (let j = 0; j < item.noticeObjs.length; j++) {
          const obj = item.noticeObjs[j]
          if (!obj.objType) {
            return { 
              isValid: false, 
              errorMessage: `即将到期提醒：请选择风险源分类`,
              targetTab: 'RISK_SOURCE_OVERDUE_ABOUT'
            }
          }
          if (!obj.objId || obj.objId.length === 0) {
            return { 
              isValid: false, 
              errorMessage: `即将到期提醒：请选择通知人员`,
              targetTab: 'RISK_SOURCE_OVERDUE_ABOUT'
            }
          }
        }
      }
      
      // 校验已经到期提醒
      for (let i = 0; i < OverTimeList.value.length; i++) {
        const item = OverTimeList.value[i]
        
        // 校验通知方式
        if (endClock.value.length > 0 && (!item.noticeWays || item.noticeWays.length === 0)) {
          return { 
            isValid: false, 
            errorMessage: `已经到期提醒通知方式：请选择至少一种通知方式`,
            targetTab: 'RISK_SOURCE_OVERDUE'
          }
        }
        
        // 校验通知对象
        for (let j = 0; j < item.noticeObjs.length; j++) {
          const obj = item.noticeObjs[j]
          if (!obj.objType) {
            return { 
              isValid: false, 
              errorMessage: `已经到期提醒：请选择风险源分类`,
              targetTab: 'RISK_SOURCE_OVERDUE'
            }
          }
          if (!obj.objId || obj.objId.length === 0) {
            return { 
              isValid: false, 
              errorMessage: `已经到期提醒：请选择通知人员`,
              targetTab: 'RISK_SOURCE_OVERDUE'
            }
          }
        }
      }
      
      // 校验强检提醒
      for (let i = 0; i < imperativeTimeList.value.length; i++) {
        const item = imperativeTimeList.value[i]
        
        // 校验天数
        if (!item.value || item.value < 1 || item.value > 999) {
          return { 
            isValid: false, 
            errorMessage: `强检提醒天数：请输入1-999之间的天数`,
            targetTab: 'MANDATORY_TESTING_OVERDUE_ABOUT'
          }
        }
        
        // 校验通知方式
        if (startImperative.value.length > 0 && (!item.noticeWays || item.noticeWays.length === 0)) {
          return { 
            isValid: false, 
            errorMessage: `强检提醒通知方式：请选择至少一种通知方式`,
            targetTab: 'MANDATORY_TESTING_OVERDUE_ABOUT'
          }
        }
        
        // 校验通知对象
        for (let j = 0; j < item.noticeObjs.length; j++) {
          const obj = item.noticeObjs[j]
          if (!obj.objType) {
            return { 
              isValid: false, 
              errorMessage: `强检提醒：请选择风险源分类`,
              targetTab: 'MANDATORY_TESTING_OVERDUE_ABOUT'
            }
          }
          if (!obj.objId || obj.objId.length === 0) {
            return { 
              isValid: false, 
              errorMessage: `强检提醒：请选择通知人员`,
              targetTab: 'MANDATORY_TESTING_OVERDUE_ABOUT'
            }
          }
        }
      }
      
      return { isValid: true, errorMessage: '' }
    }
    
    const save = async (): Promise<void> => {
      // 执行输入校验
      const validation = validateForm()
      if (!validation.isValid) {
        // 如果校验失败，跳转到对应的tab页面
        if (validation.targetTab) {
          activeKey.value = validation.targetTab
        }
        message.error(validation.errorMessage)
        return
      }
      
      loading.value = true
      const soonList = soonOverTimeList.value.map(item => {
        item.noticeWays = (item.noticeWays.map(way => {
          return {
            noticeWay: way
          }
        }) as unknown as never[])
        item.noticeObjs = item.noticeObjs.map(obs => {
          (obs as { objId: unknown[]; }).objId = obs.objId.length === 0 ? [] : obs.objId.join(',') as unknown as never[]
          return obs
        })
        return item
      })
      const imperativeList = imperativeTimeList.value.map(item => {
        item.noticeWays = (item.noticeWays.map(way => {
          return {
            noticeWay: way
          }
        }) as unknown as never[])
        item.noticeObjs = item.noticeObjs.map(obs => {
          (obs as { objId: unknown[]; }).objId = obs.objId.length === 0 ? [] : obs.objId.join(',') as unknown as never[]
          // obs.objType = obs.objType.join(',') as unknown as never[]
          return obs
        })
        return item
      })
      const list = OverTimeList.value.map(item => {
        item.noticeWays = (item.noticeWays.map(way => {
          return {
            noticeWay: way
          }
        }) as unknown as never[])
        item.noticeObjs = item.noticeObjs.map(obs => {
          (obs as { objId: unknown[]; }).objId = obs.objId.length === 0 ? [] : obs.objId.join(',') as unknown as never[]
          // obs.objType = obs.objType.join(',') as unknown as never[]

          return obs
        })
        return item
      })
      try {
        await cubeMessageService.addMessage({
          businessType: 'RISK_SOURCE',
          sceneConfigDTOS: [
            ...soonList,
            ...list,
            ...imperativeList
          ]
        })
        getData()
        loading.value = false
        message.success('保存成功')
        // getData()
      } catch {
        loading.value = false
        message.error('请完整填写数据')
      }
    }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Tabs activeKey={activeKey.value} onTabChange={tabChange} type='card'>
              <TabPane tab='即将到期提醒' key='RISK_SOURCE_OVERDUE_ABOUT'>
                <Button type='primary' onClick={() => {
                  addSoonList()
                }}>添加</Button>
                {soonOverTimeList.value.map((item, itemIndex) => {
                  return (
                    <div key={item.id} style={{ border: '1px solid #e8e8e8', padding: '10px', width: '60%', display: 'flex', alignItems: 'center', marginTop: '10px', justifyContent: 'space-between' }}>
                      <div>
                        <FormItem label='通知条件:'>距离风险源设备到期还有 
                          <InputNumber 
                            style='width:200px!important' 
                            max={999} 
                            min={1} 
                            v-model:value={item.value}
                            placeholder="请输入天数"
                            precision={0}
                          /> 天提醒
                        </FormItem>
                        <FormItem label='通知方式:'>
                          <div style='display: flex; flex-direction: row; flex-wrap: wrap;'>
                            {startClock.value.length === 0 ? <span>当前场景未配置可使用的通知方式</span> : <CheckboxGroup class='ml-15px' v-model:value={item.noticeWays} options={startClock.value} />}
                          </div>
                        </FormItem>
                        <FormItem label='通知内容:'>【风险源名称、风险源名称】等【xx】个风险源设备】使用期限将在【配置的通知条件】后到期,请知悉</FormItem>
                        {
                          item.noticeObjs.map((obj, index) => {
                            return (
                              <div style={{ display: 'flex', marginTop: '10px' }} key={obj.id}>
                                <TreeSelect
                                  style='min-width: 200px;'
                                  treeData={riskType.value} 
                                  v-model:value={obj.objType} 
                                  placeholder='请选择风险源分类' 
                                  allowClear
                                  fieldNames={{
                                    label: 'name',
                                    value: 'code',
                                    children: 'nextList'
                                  }}
                                />
                                <Select
                                  maxTagCount={6}
                                  mode='multiple'
                                  optionFilterProp='name'
                                  v-model:value={obj.objId} 
                                  style='min-width: 200px; margin-right: 10px;height: 30px;margin-left:10px'
                                  allowClear
                                  showSearch
                                  filterOption={(input: string, option: any) => 
                                    option?.name?.toLowerCase().includes(input.toLowerCase())
                                  }
                                  fieldNames={{
                                    label: 'name',
                                    value: 'id'
                                  }}
                                  onChange={changeSelect}
                                  options={ouaaOptions} 
                                  placeholder='请选择人员'
                                />
                                <div>
                                  {index === 0 && <Button type='link' onClick={() => {
                                    addSoonOverUser(itemIndex)
                                  }}>添加</Button>}
                                  {index !== 0 && <Button danger type='link' onClick={() => {
                                    deleteSoonOverUser(itemIndex)
                                  }}> 删除 </Button>}
                                </div>
                              </div>
                            )
                          })

                        }
                      </div>
                      <div>
                        {itemIndex !== 0 && <Button danger onClick={() => {
                          deleteList(itemIndex)
                        }}>删除</Button>}
                      </div>

                    </div>
                  )
                })}
              </TabPane>
              <TabPane tab='已经到期提醒' key='RISK_SOURCE_OVERDUE'>
                <Button type='primary' onClick={() => {
                  addSoList()
                }}>添加</Button>
                <div>
                  {OverTimeList.value.map((item, itemIndex) => {
                    return (
                      <div key={item.id} style={{ border: '1px solid #e8e8e8', padding: '10px', width: '60%', display: 'flex', alignItems: 'center', marginTop: '10px', justifyContent: 'space-between' }}>
                        <div>
                          <FormItem label='通知条件:'>风险源设备已到期,提醒相关人员 </FormItem>
                          <FormItem label='通知方式:'>
                            <div style='display: flex; flex-direction: row; flex-wrap: wrap;'>
                              {endClock.value.length === 0 ? <span>当前场景未配置可使用的通知方式</span> : <CheckboxGroup class='ml-15px' v-model:value={item.noticeWays} options={endClock.value} />}

                            </div>
                          </FormItem>
                          <FormItem label='通知内容:'>【风险源名称、风险源名称、风险源名称】使用期限已到期，请知悉</FormItem>
                          {
                            item.noticeObjs.map((obj, index) => {
                              return (
                                <div style={{ display: 'flex', marginTop: '10px' }} key={obj.id}>
                                  <TreeSelect
                                    style='min-width: 200px;'
                                    treeData={riskType.value} 
                                    v-model:value={obj.objType} 
                                    placeholder='请选择风险源分类' 
                                    allowClear
                                    fieldNames={{
                                      label: 'name',
                                      value: 'code',
                                      children: 'nextList'
                                    }}
                                  />
                                  <Select
                                    maxTagCount={6}
                                    mode='multiple'
                                    optionFilterProp='name'
                                    v-model:value={obj.objId} 
                                    style='min-width: 200px; margin-right: 10px;height: 30px;margin-left:10px'
                                    allowClear
                                    showSearch
                                    filterOption={(input: string, option: any) => 
                                      option?.name?.toLowerCase().includes(input.toLowerCase())
                                    }
                                    fieldNames={{
                                      label: 'name',
                                      value: 'id'
                                    }}
                                    onChange={changeSelect}
                                    options={ouaaOptions} 
                                    placeholder='请选择人员'
                                  />
                                  <div>
                                    {index === 0 && <Button type='link' onClick={() => {
                                      addOverUser(itemIndex)
                                    }}>添加</Button>}
                                    {index !== 0 && <Button danger type='link' onClick={() => {
                                      deleteOverUser(itemIndex)
                                    }}> 删除</Button>}
                                  </div>
                                </div>
                              )
                            })

                          }
                        </div>
                        <div>
                          {itemIndex !== 0 && <Button danger onClick={() => {
                            deleteSoon(itemIndex)
                          }}>删除</Button>}
                        </div>

                      </div>
                    )
                  })}
                </div>
              </TabPane>
              <TabPane tab='强检提醒' key='MANDATORY_TESTING_OVERDUE_ABOUT'>
                <Button type='primary' onClick={() => {
                  addImperativeList()
                }}>添加</Button>
                {imperativeTimeList.value.map((item, itemIndex) => {
                  return (
                    <div key={item.id} style={{ border: '1px solid #e8e8e8', padding: '10px', width: '60%', display: 'flex', alignItems: 'center', marginTop: '10px', justifyContent: 'space-between' }}>
                      <div>
                        <FormItem label='通知条件:'>距离风险源设备强检到期还有 
                          <InputNumber 
                            style='width:200px!important' 
                            max={999} 
                            min={1} 
                            v-model:value={item.value}
                            placeholder="请输入天数"
                            precision={0}
                          /> 天提醒
                        </FormItem>
                        <FormItem label='通知方式:'>
                          <div style='display: flex; flex-direction: row; flex-wrap: wrap;'>
                            {startImperative.value.length === 0 ? <span>当前场景未配置可使用的通知方式</span> : <CheckboxGroup class='ml-15px' v-model:value={item.noticeWays} options={startImperative.value} />}
                          </div>
                        </FormItem>
                        <FormItem label='通知内容:'>风险源名称、风险源名称】等【xx】个风险源设备】强检日期将在【配置的通知条件（例：5天）】后到期，请知悉</FormItem>
                        {
                          item.noticeObjs.map((obj, index) => {
                            return (
                              <div style={{ display: 'flex', marginTop: '10px' }} key={obj.id}>
                                <TreeSelect
                                  style='min-width: 200px;'
                                  treeData={riskType.value} 
                                  v-model:value={obj.objType} 
                                  placeholder='请选择风险源分类' 
                                  allowClear
                                  fieldNames={{
                                    label: 'name',
                                    value: 'code',
                                    children: 'nextList'
                                  }}
                                />
                                <Select
                                  maxTagCount={6}
                                  mode='multiple'
                                  optionFilterProp='name'
                                  v-model:value={obj.objId} 
                                  style='min-width: 200px; margin-right: 10px;height: 30px;margin-left:10px'
                                  allowClear
                                  showSearch
                                  filterOption={(input: string, option: any) => 
                                    option?.name?.toLowerCase().includes(input.toLowerCase())
                                  }
                                  fieldNames={{
                                    label: 'name',
                                    value: 'id'
                                  }}
                                  onChange={changeSelect}
                                  options={ouaaOptions} 
                                  placeholder='请选择人员'
                                />
                                <div>
                                  {index === 0 && <Button type='link' onClick={() => {
                                    addImperativeUser(itemIndex)
                                  }}>添加</Button>}
                                  {index !== 0 && <Button danger type='link' onClick={() => {
                                    deleteImperativeUser(itemIndex)
                                  }}> 删除 </Button>}
                                </div>
                              </div>
                            )
                          })

                        }
                      </div>
                      <div>
                        {itemIndex !== 0 && <Button danger onClick={() => {
                          deleteImperativeList(itemIndex)
                        }}>删除</Button>}
                      </div>

                    </div>
                  )
                })}
              </TabPane>
            </Tabs>
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button type='primary' loading={loading.value} onClick={() => {
              save()
            }} style={{ marginRight: '10px' }}>保存</Button>
          </>
        )
      }
    }

    onMounted(async () => {
      const res = await cubeTypeService.getType({ itemCode: 'risk-source-type' })
      riskType.value = res ?? []
      const data = await cubeOuaaService.getStaffPage({
        pageSize: 999,
        pageNumber: 1,

      })
      ouaaOptions.value = (data.records as unknown as never[])
      getData()
    })
    return (): JSX.Element =>
      <Layout title={pageTitle} v-slots={layoutSlots} showFooter />
  }
})
