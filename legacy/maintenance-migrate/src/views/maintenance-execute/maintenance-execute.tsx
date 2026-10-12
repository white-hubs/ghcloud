import { defineComponent, reactive, ref, onMounted } from 'vue'
import { 
  Card, 
  Form, 
  FormItem, 
  Input, 
  Button, 
  Descriptions, 
  DescriptionsItem,
  Textarea,
  message
} from 'ant-design-vue'
import styles from './maintenance-execute.module.less'
import {  maintenanceTaskId, saveProgetRecord } from '@/api/maintenance'
import { useRoute } from 'vue-router'

// 定义维保任务接口
interface MaintenanceTask {
  taskId: string;
  publishTime: string;
  deviceName: string;
  categoryName: string;
  responsible: string;
  status: string;
  planId: string;
}

// 定义维保记录表单接口
interface MaintenanceRecordForm {
  "id": string,
  "taskId": string,
  "maintrenaceProject": string,
  "record": string,
  "maintenanceDescribe": string
}

export const MaintenanceExecute = defineComponent({
  setup() {
    const route = useRoute()
    // 表单引用
    const formRefs = ref<{
      validate: () => Promise<void>;
    }[]>([])
    const setChildRef = (el) => {
      if (el) {
        formRefs.value.push(el)
      }
    };
    
    // 加载状态
    const loading = ref<boolean>(false)
    const taskInfo = reactive<MaintenanceTask>({
      taskId: '',
      planId: '',
      publishTime: '',
      deviceName: '',
      categoryName: '',
      responsible: '',
      status: ''
    })
    /** 总体结论 */
    const taskRemark = ref<string>('')
    const fileIds = ref<string[]>([])
    
    // 维保记录表单
    const recordForm = reactive<MaintenanceRecordForm[]>([])
    
    // 表单验证规则
    const rules = {
      record: [{ required: true, message: '请填写', trigger: 'blur' }],
      maintenanceDescribe: [{ required: true, message: '请填写', trigger: 'blur' }]
    }    
  
    const onChangeFile = (value: string[]) => {
      fileIds.value = value
    }
    
    // 提交表单
    const handleSubmit = async (): Promise<void> => {
      if (!formRefs.value.length) return
      let validate = true
      for await (const element of formRefs.value) {
        await element.validate().catch(() => {
          validate = false
        })
      }
      if(!validate) return
      if (!fileIds.value?.length) {
        message.error('请上传附件')
        return
      }
      try {
        loading.value = true
        const params = {
          id: route.query.id as string,
          fileIds: fileIds.value,
          taskRemark:taskRemark.value,
          planId:taskInfo.planId,
          maintenanceProgetRecordCommands:recordForm
        }
        await saveProgetRecord(params)
        message.success('提交成功')
        history.back()
      } catch (error) {
        message.error('提交失败')
      }finally{
        loading.value = false
      }
    }
    
    // 返回上一页
    const handleBack = (): void => {
      history.back()
    }
    
    onMounted(() => {
      maintenanceTaskId({id:route.query.id as string}).then(res=>{
        taskInfo.taskId = res.code
        taskInfo.planId = res.planId
        taskInfo.publishTime = res.maintenanceTime
        taskInfo.deviceName = res.objectName
        taskInfo.categoryName = res.categoryName
        if (res.responsibilityType === "per") {
          taskInfo.responsible = res.responsibilityPersonName || '--'
        } else {
          if (res.responsibilityPositionName) {
            taskInfo.responsible = res.responsibilityPositionName
          } 
        }
        if (res.maintenanceTaskStatus === "BE_MAINTAINED") {
          taskInfo.status = "待维保";
        } else if (res.maintenanceTaskStatus === "COMPLETED") {
          taskInfo.status = "已完成";
        } else if (res.maintenanceTaskStatus === "STOP") {
          taskInfo.status = "--";
        }
        res.maintenanceProgetRecordVos.forEach(item=>{
          recordForm.push(item)
        })
      })
    })
    
    return () => (
      <g-layout title="维保执行">
        {
          {
            'content-table':()=>(
              <div class={styles.container}>
                <Card title="基本信息" class={styles.card}>
                  <Descriptions bordered column={2}>
                    <DescriptionsItem label="任务编号">{taskInfo.taskId}</DescriptionsItem>
                    <DescriptionsItem label="发布时间">{taskInfo.publishTime}</DescriptionsItem>
                    <DescriptionsItem label="设备名称">{taskInfo.deviceName}</DescriptionsItem>
                    <DescriptionsItem label="产品品类">{taskInfo.categoryName}</DescriptionsItem>
                    <DescriptionsItem label="责任人">{taskInfo.responsible}</DescriptionsItem>
                    <DescriptionsItem label="任务状态">{taskInfo.status}</DescriptionsItem>
                  </Descriptions>
                </Card>
                {
                  recordForm.map((item, index) => (
                    <Card title="维保记录" class={styles.card} key={item.id}>
                      <Form 
                        ref={setChildRef}
                        model={item}
                        rules={rules}
                        labelCol={{ span: 3 }}
                        wrapperCol={{ span: 21 }}
                      >
                        <FormItem label="维保项名称">
                          {item.maintrenaceProject ?? '--'}
                        </FormItem>
                        <FormItem label="维保结果" name="record">
                          <Input v-model:value={item.record} placeholder="请输入维保结果" />
                        </FormItem>
                        
                        <FormItem label="维保备注" name="maintenanceDescribe">
                          <Textarea 
                            v-model:value={item.maintenanceDescribe}
                            placeholder="请输入维保备注" 
                            //@ts-ignore
                            rows={4} 
                          />
                        </FormItem>
                      </Form>
                    </Card>
                  ))
                }
                <FormItem label="总体结论">
                  <Textarea 
                    v-model:value={taskRemark.value}
                    placeholder="请输入总体结论" 
                    //@ts-ignore
                    rows={4} 
                  />
                </FormItem>
                <FormItem 
                  label={(
                    <span>
                      <span style="color: #ff4d4f; margin-right: 4px;">*</span>
                      上传附件
                    </span>
                  )}
                >
                  <g-upload 
                    onChangeFile={onChangeFile}
                    size="200"
                    max={10}
                    sceneCode=''>
                  </g-upload>
                </FormItem>
              </div>
            ),
            'footer-page':()=>(
              <>
                <Button onClick={handleBack}>返回</Button>
                <Button type="primary" loading={loading.value} onClick={handleSubmit}>提交</Button>
              </>
            )
          }
        }
      </g-layout>
    )
  }
})