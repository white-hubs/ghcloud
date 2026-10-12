import { defineComponent, ref, reactive, onMounted, nextTick } from 'vue'
import styles from './command-action-select.module.less'
import { Button, Popup, Search, Empty, Loading, Field } from 'vant'
import { useRouter } from 'vue-router'
import { DisplayCell } from '@/components/displayCell/displayCell'
import { cubeDeviceCenterService, cubeZhongdaHeshunService } from '@/api/server'
import { showNotify } from 'vant'
import type { DeviceVO } from '@ghcloud/cube-zhongda-heshun-service'
  // 在文件顶部引入store
  import { useCommandStore } from '@/store/command'
import { storeKill } from '@/store/kill'
/**
 * 设备状态选择页面组件
 */
export const CommandActionSelect = defineComponent({
  setup: () => {
    const router = useRouter()
    const commandName = ref('') 
    const store = storeKill()
    
    // 设备状态选择相关变量
    const showStatusPicker = ref(false) // 控制状态选择器弹出层显示
    const selectedStatus = ref('') // 存储选择的状态用于回显
    const searchValue = ref('') // 搜索关键字
    const loading = ref(false) // 加载状态
    const finished = ref(false) // 是否已加载全部数据
    
    // 分页参数
    const pagination = reactive({
      pageSize: 20,
      pageNumber: 1,
      total: 0
    })
    
    //设备列表
    const equipmentList = ref<DeviceVO[]>([])
      const getattributeValue = async (id:string): Promise<void> => {
         const data = await cubeDeviceCenterService.getNorthDeviceDetail({
           deviceId: id,
           withSnapShot: true,
           withPropertySpec: true,
         })
         if (data) {
          //  propsCodeList.value = data.deviceInfo.productPropVoList
          const canChange = data.productPropVoList?.filter(item => item.dataWrite === 1)
          commandName.value = data.deviceName ?? '' // 设置回显的值
          statusOptions.value = canChange.map(item => {
            return {
              title: item.propName,
              code: item.propCode,
              type: item.dataType,
              options: item.dataConstraint,
              ...item
            }
          })
         }
       }
    /**
     * 获取设备列表数据
     * @param isReset 是否重置列表
     */
    const getEquipmentList = async (isReset = false) => {
      if (loading.value || (finished.value && !isReset)) return
      
      // 重置列表
      if (isReset) {
        equipmentList.value = []
        pagination.pageNumber = 1
        finished.value = false
      }
      
      loading.value = true
      
      try {
        const result = await cubeZhongdaHeshunService.getDevicePageList({
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
          keyword: searchValue.value || undefined,
          groupId: store.groupActive,
        })
        
        if (isReset) {
          equipmentList.value = result.records
        } else {
          equipmentList.value = [...equipmentList.value, ...result.records]
        }
        
        pagination.total = result.total
        pagination.pageNumber++
        
        // 判断是否已加载全部数据
        finished.value = equipmentList.value.length >= result.total
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      } finally {
        loading.value = false
      }
    }
    
    /**
     * 加载更多数据
     */
    const loadMore = () => {
      // 滚动到底部时触发加载更多
      const container = document.querySelector(`.${styles.statusOptions}`)
      if (!container) return
      
      const { scrollTop, scrollHeight, clientHeight } = container
      // 距离底部20px时加载更多
      if (scrollHeight - scrollTop - clientHeight < 20 && !loading.value && !finished.value) {
        getEquipmentList()
      }
    }
    
    /**
     * 搜索设备
     */
    const onSearch = () => {
      getEquipmentList(true)
    }
    
    /**
     * 清空搜索
     */
    const onClear = () => {
      searchValue.value = ''
      getEquipmentList(true)
    }
    
    const statusOptions = ref<any>([])
    /**
     * 处理返回按钮点击
     */
    const handleBack = (): void => {
      router.back()
    }
    

    
    // 在setup函数中获取store实例
    const commandStore = useCommandStore()
    
    /**
     * 处理下一步按钮点击
     */
    const handleNext = (): void => {
      const propWriteValueList: {
        code: string,
        name: string,
        expectedValue: string
        expectedName?: string
      }[] = []
      let propWriteName:string[] = []
      statusOptions.value.forEach((item:any) => {
        if (item.value !== ''&& item.value !== null&& item.value !== undefined) {
          propWriteValueList.push({
          code: item.code,
          name:item.title,
          expectedValue: item.value,
          expectedName:item.checkLabel||null
          })
          if(item.type === 'enum'||item.type === 'boolean'){
            propWriteName.push(`${item.title}:${item.checkLabel}`)
          }else{
            propWriteName.push(`${item.title}:${item.value}`)
          }
          
        }
      })      
      if(statusOptions.value.length === 0){
        showNotify({
        message: '该设备没有属性可设置',
        type: 'danger',
      })
      return;
      }
      if(propWriteValueList.length === 0){
        showNotify({
        message: '请选择属性值',
        type: 'warning',
      })
      return;
      }
    if(!selectedStatus.value){
      showNotify({
      message: '请选择设备状态',
      type: 'warning',
    })
    return;
    }
    const deviceData = {
    commandName: commandName.value,
    deviceId: selectedStatus.value,
    propWriteValueList: propWriteValueList,
    name: propWriteName.join(',')
    }
    // 保存数据到store
    commandStore.saveDeviceData(deviceData)
    
    // 返回上一页
    router.back()
    }
    
    /**
     * 处理条件点击，打开状态选择器
     */
    const conditionClick = () => {
      showStatusPicker.value = true
      // 打开弹窗时重新加载数据
      nextTick(() => {
        getEquipmentList(true)
      })
    }

    /**
     * 处理设备点击选择
     */
    const equipmentClick = (item: { id: string, name: string, code: string }) => {
      selectedStatus.value = item.id
      
      showStatusPicker.value = false // 关闭弹出层
      getattributeValue(item.id)
    }
    
    /**
     * 处理状态选择器取消
     */
    const onStatusCancel = () => {
      showStatusPicker.value = false // 关闭弹出层
    }
    
    //enum
    const itemActive = (index: number, optionIndex: number) => {
      statusOptions.value[index].options.map((option: { active: boolean }) => {
        option.active = false
      })
      if(statusOptions.value[index].value === statusOptions.value[index].options[optionIndex].value){
        statusOptions.value[index].value = ''
        statusOptions.value[index].checkLabel = ''
        return;
      }
      statusOptions.value[index].options[optionIndex].active = true
      statusOptions.value[index].value = statusOptions.value[index].options[optionIndex].value
      statusOptions.value[index].checkLabel = statusOptions.value[index].options[optionIndex].label
    }
    
    const isAdmin = ref(store.isAdmin)
    // 组件挂载时初始化数据
    onMounted(async() => {
      await store.updateGroupInfo()
      isAdmin.value = store.isAdmin
      // 初始化时不加载数据，等打开弹窗时再加载
      // commandName.value = commandStore.name
      // commandStore.deviceId
      if(!commandStore.deviceId){
        return;
      }
      await getattributeValue(commandStore.deviceId)
      selectedStatus.value = commandStore.deviceId
      statusOptions.value.map((item) =>{
        commandStore.propWriteValueList.map((i) =>{
          if(item.code === i.code){
            item.value = i.expectedValue
            item.checkLabel = i.expectedName
            if(item.options){
              item.options.map((option) =>{
                if(option.value == i.expectedValue){
                  option.active = true
                }
              })
            }
          }
        })
      })
    })
    
    return (): JSX.Element => (
      <div class={styles.container}>
        {/* <NavBar
          title="执行"
          leftArrow
          onClickLeft={handleBack}
          class={styles.navbar}
        /> */}
        
        <div class={styles.content}>
            <div class={styles.sectionTitles}>选择设备</div>
            <DisplayCell value={commandName.value} placeholder ='请选择设备' onClick={conditionClick}></DisplayCell>
              <div>
                {statusOptions.value.map((item: { title: any; options: any[];type:string;value:string;dataConstraint:number[] },index: number)=>{
                  return (
                    <> 
                    <div class={styles.sectionTitle}>{item.title}</div>

                    {(item.type === 'enum'||item.type==='boolean')&&<div class={styles.item_container}>
                       {item.options.map((option: { active: any; label: any },optionIndex: number) =>{
                        return (
                            <div  class={[styles.item_option, option.active? styles.actives : '']} onClick={()=>itemActive(index,optionIndex)}>
                              {option.label}
                            </div>
                        )
                    })}
                    </div>
                    }   
                    {(item.type === 'int'|| item.type === 'long' || item.type === 'float' || item.type === 'double')&&<div class={styles.item_container}>
                      <Field type='number' v-model={item.value} max={item.dataConstraint[1]} min={item.dataConstraint[0]}
                        placeholder={`请输入${item.dataConstraint[0]}-${item.dataConstraint[1]}`}
                      onUpdate:model-value={(value: string) => {
                        item.value = value
                      }}>

                      </Field>
                    </div>
                    }  
                    {(item.type === 'string')&&<div class={styles.item_container}>
                      <Field  v-model={item.value} 
                        placeholder={'请输入'}
                      onUpdate:model-value={(value: string) => {
                        item.value = value
                      }}>

                      </Field>
                    </div>
                    }          


                    </>   
                  )
                })}
                 </div>
        </div>
        {isAdmin.value &&
        <div class={styles.footer}>
          <Button 
            type="primary" 
            block 
            onClick={handleNext}
            class={styles.nextBtn}
          >
            下一步
          </Button>
        </div>
        }
        {/* 设备状态选择弹出层 */}
        <Popup 
          v-model:show={showStatusPicker.value} 
          position="right"
          style={ { width: '80%',height:'100%' }}
          round
        >
          <div class={styles.statusPickerContainer}>
            <div class={styles.statusPickerHeader}>
              <div class={styles.cancelBtn} onClick={onStatusCancel}>取消</div>
              <div class={styles.statusTitle}>设备列表</div>
              <div class={styles.confirmBtn}></div>
            </div>
            
            {/* 搜索框 */}
            <div class={styles.searchContainer}>
              <Search
                v-model={searchValue.value}
                placeholder="请输入设备名称"
                onSearch={onSearch}
                onClear={onClear}
                shape="round"
                class={styles.nameInput}
                clearable
              />
            </div>
            
            {/* 设备列表 */}
            <div class={styles.statusOptions} onScroll={loadMore}>
              {equipmentList.value.length > 0 ? (
                equipmentList.value.map((item) => (
                  <div class={styles.statusOption} onClick={() => equipmentClick(item)}>
                    <div class={styles.deviceName}>{item.name}</div>
                    <div class={styles.deviceCode}>ID: {item.code}</div>
                  </div>
                ))
              ) : (
                <Empty description="暂无设备" />
              )}
              
              {/* 加载状态 */}
              <div class={styles.loadingContainer}>
                {loading.value && <Loading size="24px">加载中...</Loading>}
                {finished.value && equipmentList.value.length > 0 && <div class={styles.noMore}>没有更多了</div>}
              </div>
            </div>
          </div>
        </Popup>
      </div>
    )
  }
})