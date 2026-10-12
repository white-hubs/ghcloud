import { defineComponent, onMounted, ref, type VNode } from 'vue'
import {
  Form,
  Field,
  CellGroup,
  Popup,
  Picker,
  Button,
  type PickerConfirmEventParams,
  showNotify,
  SwipeCell,
  Checkbox,
  CheckboxGroup,
} from 'vant'
import styles from './standard.module.less'
 
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { cubeDailyTaskService } from '@/api/server'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import type { TaskResultItem } from '@ghcloud/cube-daily-task-service'
interface FormItem {
  name: string;
  resultName: string;
  resultId: string;
  defaultResultId: string;
  defaultResultName: string;
  photoValues: string[];
  remakeValues: string[];
  resultList: Array<{
    text: string;
    value: string;
    errorFlag: boolean;
  }>;
}
interface ListItem { text: string; value: string; errorFlag: boolean; }
export  const TaskAddStandard = defineComponent({
  name: 'TaskAddStandard',
  setup (): () => VNode {
    const form = ref<FormItem>({
        name: '',
        resultName: '',
        resultId:'',
        defaultResultId:'',
        defaultResultName:'',
        photoValues: [],
        remakeValues: [],
        resultList:[]
      })
    const name = ref('')
    const showProjectPicker = ref(false)
    const showResultPicker = ref(false)
    const activeFormIndex = ref(0)  
    const projectColumns = ref<{  text: string; value: string; list: ListItem[] }[]>([])
    const resultColumns = ref<ListItem[]>([])
    const showPhotoPicker = ref(false)
    const showRemarkPicker = ref(false)
    const onConfirmProject = (value:PickerConfirmEventParams): void => {
        const v = (value as PickerConfirmEventParams).selectedOptions
          if(v){
          form.value.resultName = String(v[0]?.text ?? v[0]?.text ?? '')
          form.value.resultId= String(v[0]?.value ?? v[0]?.value ?? '')
          form.value.resultList = v[0]?.list??[]
          form.value.defaultResultName = ''
          form.value.defaultResultId = ''
          form.value.photoValues = []
          form.value.remakeValues = []
          const list = v[0]?.list
          list.map((item:{text:string;value:string;errorFlag:boolean},key:number) => {
            if(!key){
              form.value.defaultResultName = item.text
              form.value.defaultResultId= item.value
            }
            if(item.errorFlag){
              form.value.photoValues.push(item.value)
              form.value.remakeValues.push(item.value)
            }
          })
        }
      
      showProjectPicker.value = false
    }   
    const onConfirmResultProject = (value:PickerConfirmEventParams): void => { 
        const v = (value as PickerConfirmEventParams).selectedOptions
        if(v){
          form.value.defaultResultId = String(v[0]?.value ?? v[0]?.value ?? '')
          form.value.defaultResultName = String(v[0]?.text ?? v[0]?.text ?? '')
          showResultPicker.value = false
        }
    }
    
    /**
     * 生成多选展示文案
     * - 将多选的值映射为对应的文本，并以顿号连接
     */
    const getLabelText = (selected: string[] = [], options: Array<{ text: string; value: string }>): string => {
      const map = new Map((options ?? []).map(o => [String(o.value), String(o.text)]))
      const label = (selected ?? []).map(v => map.get(String(v)) ?? String(v)).join('、')
      return label || ''
    }

    /**
     * 打开“必须拍照”多选弹层
     * - 设置当前表单索引与候选项
     */
    const openPhotoPicker = ( item: { resultList: ListItem[] }): void => {
      resultColumns.value = item.resultList ?? []
      showPhotoPicker.value = true
    }

    /**
     * 打开“必须备注”多选弹层
     * - 设置当前表单索引与候选项
     */
    const openRemarkPicker = ( item: { resultList: ListItem[] }): void => {
      resultColumns.value = item.resultList ?? []
      showRemarkPicker.value = true
    }
    const getResultList = async (): Promise<void> => { 
      const data = await cubeDailyTaskService.getDailyResultPage({
        pageNumber:'1',
        pageSize:'1000',
        dailyType:'DAILY_TASK'
       })
       projectColumns.value = data.records.map((item:TaskResultItem) => {
        return {
          text: item.name,
          value: item.id,
          list:item.resultLabelList?.map((i =>{
            return {
              text: i.label,
              value: i.value,
              errorFlag:i.errorFlag
            }
          }))
        }
      })
    }
    const submit = () =>{
      if(!form.value.name){
        showNotify('请选择标准项')
        return;
      }
      if(!form.value.resultName){
        showNotify('请选择标准结果')
        return;
      }
      if(!form.value.defaultResultName){
        showNotify('请选择标准结果默认项')
        return;
      }
      if(!form.value.photoValues.length){
        showNotify('请选择标准项拍照结果')
        return;
      }  
      if(!form.value.remakeValues.length){
        showNotify('请选择标准项备注结果')
        return;
      }
      
      addStandardMethod()
    }
    const addStandardMethod = async(): Promise<void> =>{
      const params = {
        itemName:form.value.name,
        itemContent:form.value.name,
        resultId:form.value.resultId,
        defaultResultItem: form.value.defaultResultId,
        mustTakePhotoResultItems: form.value.photoValues.join(','),
        mustRemarkResultItems: form.value.remakeValues.join(','),
        dailyType:'DAILY_TASK'
      }
      try{
        const data = await cubeDailyTaskService.addDailyItemResultRelation(params)
        if(data){
          showNotify({type:'success',message:'添加成功'})
          cancel()
        }
      } catch (error) {

      }
    }
    const cancel = (): void => {
       if (getEnvironment() === 'cubeApp') {
        cubeAppService.backPage()
      } else {
        history.back()
      }
    }
    onMounted(()=>{
      getResultList()
    })
    return (): VNode => (
      <div class={styles.task_standard_page}>
        <CubeNavBar showBack title="新增标准" />
        <Form>
          {/* <div class={styles.form_name}>
          <Field
              label="标准名称"
              placeholder="请输入标准名称"
              required
              modelValue={name.value}
              onUpdate:modelValue={(val:string) => (name.value = String(val))}
            />
             </div> */}
        </Form>
        <div class={styles.title}>
          {/* <span onClick={addStandard}>添加标准项</span> */}
          
        </div>
        <div class={styles.form_body}>
          {/* <div class={styles.form_name}> */}
          
          {/* </div> */}
        <Form>
          <div class={styles.form_item}>
                  {/* <SwipeCell  v-slots={{
                          // right: () => <Button square type='danger' text='删除' onClick={ (e: Event) => handleDelete(e, item) } style={{ width: '50px', height: '100%'}} />
                        }}> */}
                  <CellGroup inset>
                  <Field
                    label="内容描述"
                    placeholder="请输入内容描述"
                    required
                    modelValue={form.value.name}
                    onUpdate:modelValue={(val:string) => (form.value.name = String(val))}
                  />
                  <Field
                    label="结果项"
                    readonly
                    required
                    clickable
                    placeholder="请选择"
                    modelValue={form.value.resultName}
                    is-link
                    onClick={() =>{
                      showProjectPicker.value = true
                    }}
                  />
                  <Field
                    label="默认结果"
                    readonly
                    required
                    clickable
                    placeholder="请选择"
                    modelValue={form.value.defaultResultName}
                    is-link
                    onClick={() =>{
                      resultColumns.value = form.value.resultList
                      showResultPicker.value = true
                    }}
                  />
                  <Field
                    label="必须拍照"
                    readonly
                    required
                    clickable
                    placeholder="请选择"
                    modelValue={getLabelText(form.value.photoValues as any, form.value.resultList as any)}
                    is-link
                    onClick={() => openPhotoPicker( form.value)}
                  />
                  <Field
                    label="必须备注"
                    readonly
                    required
                    clickable
                    placeholder="请选择"
                    modelValue={getLabelText(form.value.remakeValues as any, form.value.resultList as any)}
                    is-link
                    onClick={() => openRemarkPicker(form.value)}
                  />
                </CellGroup>
                  {/* </SwipeCell> */}
                
              </div>
        {/* 选择弹层 */}
        <Popup
          show={showProjectPicker.value}
          position="bottom"
          onUpdate:show={(val:boolean) => (showProjectPicker.value = Boolean(val))}
        >
          <Picker
            columns={projectColumns.value}
            onConfirm={(val:PickerConfirmEventParams) => onConfirmProject(val as PickerConfirmEventParams)}
            onCancel={() => (showProjectPicker.value = false)}
          />
        </Popup>
        
        <Popup
          show={showResultPicker.value}
          position="bottom"
          onUpdate:show={(val:boolean) => (showResultPicker.value = Boolean(val))}
        >
          <Picker
            columns={resultColumns.value}
            onConfirm={(val:PickerConfirmEventParams) => onConfirmResultProject(val as PickerConfirmEventParams)}
            onCancel={() => (showResultPicker.value = false)}
          />
        </Popup>

        {/* 必须拍照多选弹层 */}
        <Popup
          show={showPhotoPicker.value}
          position="bottom"
          onUpdate:show={(val:boolean) => (showPhotoPicker.value = Boolean(val))}
        >
          <div style={{ padding: '12px' }} class={styles.check_body}>
            <div class={styles.header}>
                <div onClick={() => (showPhotoPicker.value = false)} class={styles.cancel}>取消</div>
                <div onClick={() => (showPhotoPicker.value = false)}>确定</div>
              </div>
            <div class={styles.check_box}>
            <CheckboxGroup
              modelValue={(form.value?.photoValues ?? []) as any}
              onUpdate:modelValue={(v:string[]) => (form.value.photoValues = (v ?? []) as string[])}
            >
              {resultColumns.value.map((opt: any) => (
                <Checkbox class={styles.check_box_item} name={String(opt.value)}>{String(opt.text)}</Checkbox>
              ))}
            </CheckboxGroup>
            </div>
            {/* <div style={{ marginTop: '12px' }} class={styles.button_group}>
              <Button type="primary" block onClick={() => (showRemarkPicker.value = false)}>确定</Button>
            </div> */}
          </div>
        </Popup>

        {/* 必须备注多选弹层 */}
        <Popup
          show={showRemarkPicker.value}
          position="bottom"
          onUpdate:show={(val:boolean) => (showRemarkPicker.value = Boolean(val))}
        >
          <div style={{ padding: '12px' }} class={styles.check_body}>
            <div class={styles.header}>
                <div onClick={() => (showRemarkPicker.value = false)} class={styles.cancel}>取消</div>
                <div onClick={() => (showRemarkPicker.value = false)}>确定</div>
              </div>
            <div class={styles.check_box}>
            <CheckboxGroup
              modelValue={(form.value?.remakeValues ?? []) as any}
              onUpdate:modelValue={(v:string[]) => (form.value.remakeValues = (v ?? []) as string[])}
            >
              {resultColumns.value.map((opt: any) => (
                <Checkbox class={styles.check_box_item} name={String(opt.value)}>{String(opt.text)}</Checkbox>
              ))}
            </CheckboxGroup>
            </div>
          </div>
        </Popup>
          </Form>

        </div>
          <div style={{ marginTop: '12px' }} class={styles.button_group}>
              <Button  block onClick={() => cancel()}>取消</Button>
              <Button type="primary" block onClick={() => (submit())}>确定</Button>
            </div>
      </div>
    )
  },
})