import { defineComponent, reactive, ref, onMounted } from 'vue'
import { Form, FormItem, Input, Textarea, Button, message, InputNumber, RadioGroup, DatePicker } from '@ghcloud/cube-ui'
import { CubeLayout } from '@ghcloud/cube-app-design'
import { useRoute, useRouter } from 'vue-router'
import styles from './app-edit.module.less'
import { CubeEdit } from '@/components/cube-edit/edit'
import { cubeApplicationCenterService } from '@/api/service'
import type { ApplicationEntity } from '@ghcloud/cube-application-center-service'
import { AppTypeSelect } from '@/components/app-type-select/app-type-select'
import { AppSelect } from '@/components/app-select/app-select'
import { ClientSelect } from '@/components/client-select/client-select'
import dayjs, { type Dayjs } from 'dayjs'

export const AppEdit = defineComponent({
  setup: () => {
    const router = useRouter()
    const route = useRoute()
    const appId = route.query.id as string
    const formRef = ref()
    const loading = ref(false)
    const appData = ref<ApplicationEntity>()
    const createTime = ref<Dayjs | null>(null)
    const updateTime = ref<Dayjs | null>(null)

    // 表单数据
    const formState = reactive<{
      id: string;
      code: string;
      name: string;
      icon: string;
      enabled: boolean;
      publicAccess: boolean;
      applicationGroupId: string;
      createTime: string;
      updateTime: string;
      version: string;
      viewCount: number;
      dependAppIdList: string[];
      dependAppIds: string;
      terminalIdList: string[];
      remark: string;
      extendParam: {
        description: string;
        featureDesc: string;
        helpInfo: string;
        purchaseInfo: string;
        title: string;
        keywords: string;
        appDesc: string;
      };
    }>({
      id: '',
      code: '',
      name: '',
      icon: '',
      enabled: true,
      publicAccess: true,
      applicationGroupId: '',
      createTime: '',
      updateTime: '',
      version: '',
      viewCount: 0,
      dependAppIdList: [],
      dependAppIds: '',
      terminalIdList: [],
      remark: '',
      extendParam: {
        description: '',
        featureDesc: '',
        helpInfo: '',
        purchaseInfo: '',
        title: '',
        keywords: '',
        appDesc: '',
      },
    })

    // 表单验证规则
    const rules = {
      code: [
        { required: true, message: '请输入应用编码', trigger: 'blur' }
      ],
      name: [
        { required: true, message: '请输入应用名称', trigger: 'blur' }
      ],
      version: [
        { required: false, message: '请输入版本号', trigger: 'blur' },
        {
          pattern: /^(\d+)\.(\d+)(?:\.(\d+))?$/,
          message: '请输入有效的版本号格式，如：1.0.0或1.0',
          trigger: 'blur'
        }
      ],
    }

    // 初始化数据
    const initData = async (): Promise<void> => {
      if (!appId) return
      appData.value = await cubeApplicationCenterService.getApplication(appId)
      Object.assign(formState, appData.value)
      formState.dependAppIdList = appData.value.dependAppList.map(item => item.id)
      formState.dependAppIds = appData.value.dependAppList.map(item => item.id).join(',')
      formState.terminalIdList = appData.value.terminalList.map(item => item.id)
      formState.extendParam.description = appData.value.applicationExtendInfo?.description ?? ''
      formState.extendParam.featureDesc = appData.value.applicationExtendInfo?.featureDesc ?? ''
      formState.extendParam.helpInfo = appData.value.applicationExtendInfo?.helpInfo ?? ''
      formState.extendParam.purchaseInfo = appData.value.applicationExtendInfo?.purchaseInfo ?? ''
      formState.extendParam.title = appData.value.applicationExtendInfo?.title ?? ''
      formState.extendParam.keywords = appData.value.applicationExtendInfo?.keywords ?? ''
      formState.extendParam.appDesc = appData.value.applicationExtendInfo?.appDesc ?? ''

      // 正确处理时间戳转换为 dayjs 对象
      createTime.value = appData.value.createTime ? dayjs(appData.value.createTime) : dayjs()
      updateTime.value = appData.value.updateTime ? dayjs(appData.value.updateTime) : dayjs()
      formState.createTime = createTime.value.format('YYYY-MM-DD')
      formState.updateTime = updateTime.value.format('YYYY-MM-DD')
    }

    // 保存数据
    const handleSave = async (): Promise<void> => {
      try {
        loading.value = true
        await formRef.value?.validate()
        formState.dependAppIds = formState.dependAppIdList.join(',')
        formState.createTime = createTime.value?.format('YYYY-MM-DD') || ''
        formState.updateTime = updateTime.value?.format('YYYY-MM-DD') || ''
        if (appId) {
          await cubeApplicationCenterService.updateApplication(formState)
        } else {
          await cubeApplicationCenterService.addApplication(formState)
        }
        message.success('保存成功')
        router.back()
      } catch {
        message.error('保存失败，请检查表单数据')
      } finally {
        loading.value = false
      }
    }

    // 返回上一页
    const handleBack = (): void => {
      router.back()
    }

    onMounted(() => {
      initData()
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div class={styles.editContainer}>
            <Form
              ref={formRef}
              model={formState}
              rules={rules}
              labelCol={{ flex: '0 0 80px' }}
              wrapperCol={{ flex: '1' }}
            >
              {/* 第一行：应用ID、应用名称、最新版本、应用图标 */}
              <div class={styles.fourColumnRow}>
                <div class={styles.formItem}>
                  <FormItem label="应用编码" name="code">
                    <Input
                      v-model:value={formState.code}
                      placeholder="请输入应用编码"
                      showCount={false}
                    />
                  </FormItem>
                </div>
                <div class={styles.formItem}>
                  <FormItem label="应用名称" name="name">
                    <Input
                      v-model:value={formState.name}
                      placeholder="请输入应用名称"
                      showCount={false}
                    />
                  </FormItem>
                </div>
                <div class={styles.formItem}>
                  <FormItem label="最新版本" name="version">
                    <Input
                      v-model:value={formState.version}
                      placeholder="请输入版本号，如：1.0.0或1.0"
                      showCount={false}
                    />
                  </FormItem>
                </div>
                <div class={styles.formItem}>
                  <FormItem label="应用图标" name="icon">
                    <Input
                      v-model:value={formState.icon}
                      placeholder="请输入应用图标"
                      showCount={false}
                    />
                  </FormItem>
                </div>
              </div>

              {/* 第二行：应用分类 依赖应用、应用端 */}
              <div class={styles.fourColumnRow}>
                <div class={styles.formItem}>
                  <FormItem label="应用分类" name="applicationGroupId">
                    <AppTypeSelect
                      v-model:value={formState.applicationGroupId}
                    />
                  </FormItem>
                </div>
                <div class={styles.formItem}>
                  <FormItem label="依赖应用" name="dependentApps">
                    <AppSelect
                      v-model:value={formState.dependAppIdList}
                      multiple
                    />
                  </FormItem>
                </div>
                <div class={styles.formItem}>
                  <FormItem label="应用端" name="appPlatform">
                    <ClientSelect
                      v-model:value={formState.terminalIdList}
                      multiple
                    />
                  </FormItem>
                </div>
                <div class={styles.formItem}>
                  {/* 空占位 */}
                </div>
              </div>

              <FormItem label="应用介绍" name="description">
                <CubeEdit
                  text={formState.extendParam.description}
                  onGetHtml={(value: string): void => {
                    formState.extendParam.description = value
                  }} />
              </FormItem>

              <FormItem label="功能说明" name="featureDesc">
                <CubeEdit
                  text={formState.extendParam.featureDesc}
                  onGetHtml={(value: string): void => {
                    formState.extendParam.featureDesc = value
                  }} />
              </FormItem>

              <FormItem label="使用帮助" name="helpInfo" >
                <CubeEdit
                  text={formState.extendParam.helpInfo}
                  onGetHtml={(value: string): void => {
                    formState.extendParam.helpInfo = value
                  }} />
              </FormItem>

              <FormItem label="购买说明" name="purchaseInfo" >
                <CubeEdit
                  text={formState.extendParam.purchaseInfo}
                  onGetHtml={(value: string): void => {
                    formState.extendParam.purchaseInfo = value
                  }} />
              </FormItem>

              <FormItem label="备注说明" name="remark" >
                <Textarea
                  maxlength={200}
                  allowClear
                  rows={3}
                  v-model:value={formState.remark}
                  showCount
                  placeholder='输入备注信息'
                />
              </FormItem>

              {/* 官网：tdk搜索配置 */}
              <FormItem label="应用标题" name="title">
                <Input
                  v-model:value={formState.extendParam.title}
                  placeholder="请输入应用标题"
                  showCount={false}
                />
              </FormItem>
              <FormItem label="应用关键字" name="keywords" >
                <Textarea
                  maxlength={200}
                  allowClear
                  rows={3}
                  v-model:value={formState.extendParam.keywords}
                  showCount
                  placeholder='输入应用关键字'
                />
              </FormItem>
              <FormItem label="应用描述" name="appDesc" >
                <Textarea
                  maxlength={200}
                  allowClear
                  rows={3}
                  v-model:value={formState.extendParam.appDesc}
                  showCount
                  placeholder='输入应用描述'
                />
              </FormItem>

              {/* 第三行：浏览次数、是否展示、更新时间、发布时间*/}
              <div class={styles.fourColumnRow}>
                <div class={styles.formItem}>
                  <FormItem label="浏览次数" name="viewCount">
                    <div class={styles.viewCountContainer}>
                      <InputNumber
                        v-model:value={formState.viewCount}
                        placeholder="请输入"
                        min={0}
                        style={{ width: 'calc(100% - 70px)' }} // 调整宽度，为后缀预留空间
                        class={styles.viewCountInput}
                      />
                      <span class={styles.viewCountSuffix}>+1000次</span>
                    </div>
                  </FormItem>
                </div>
                <div class={styles.formItem}>
                  <FormItem label="是否展示" name="enabled">
                    <RadioGroup
                      v-model:value={formState.enabled}
                      options={[
                        { label: '是', value: true },
                        { label: '否', value: false }
                      ]}
                    />
                  </FormItem>
                </div>
                <div class={styles.formItem}>
                  <FormItem label="是否公开展示" name="publicAccess">
                    <RadioGroup
                      v-model:value={formState.publicAccess}
                      options={[
                        { label: '是', value: true },
                        { label: '否', value: false }
                      ]}
                    />
                  </FormItem>
                </div>
                <div class={styles.formItem}>
                  <FormItem label="更新时间" name="updateTime">
                    <DatePicker
                      v-model:value={updateTime.value}
                      placeholder="更新时间"
                      class={styles.readonlyField}
                    />
                  </FormItem>
                </div>
                <div class={styles.formItem}>
                  <FormItem label="发布时间" name="createTime">
                    <DatePicker
                      v-model:value={createTime.value}
                      placeholder="发布时间"
                      class={styles.readonlyField}
                    />
                  </FormItem>
                </div>
              </div>
            </Form>
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <div class={styles.footerActions}>
            <Button onClick={handleBack}>
              取消
            </Button>
            <Button
              type="primary"
              loading={loading.value}
              onClick={handleSave}
              style={{ marginLeft: '16px' }}
            >
              保存
            </Button>
          </div>
        )
      }
    }

    return (): JSX.Element => (
      <CubeLayout title="编辑应用" v-slots={layoutSlots} />
    )
  }
})