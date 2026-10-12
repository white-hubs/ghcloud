import { cubeAnnouncementService, cubeFileService } from '@/api/service'
import { CubeEdit } from '@/components/edit'
import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Cascader, Col, Form, FormItem, Input, Select, Upload } from '@ghcloud/cube-ui'
import type { FormInstance, UploadProps } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { MessageModule, type SetList } from './message-module'
import type { NoticeType } from '@ghcloud/cube-bulletin-service/src/announcement.service'

/** 新增公告管理 */
export const BulletinManageAdd = defineComponent({
  setup: () => {
    const formState = reactive<{
      type: string;
      level: string;
      title: string;
      tagId: string;
      publishAgency: string;
      content: string;
    }>({
      type: '',
      level: '',
      title: '',
      tagId: '',
      publishAgency: '',
      content: '',
    })
    const detailFormRef = ref<FormInstance>()
    const MessageModuleRef = ref<{ getData: () => SetList[]; }>()
    const typeOptions = ref<{
      value: string;
      label: string;
      children: NoticeType[];
    }[]>([])
    const loading = ref(false)
    const levelOptions = ref<{ name: string;code: string; }[]>([])
    const tagOptions = ref<NoticeType[]>([])
    const publishAgencyOptions = ref<NoticeType[]>([])
    const panelRules = ref({
      title: [{ required: true, message: '请输入公告标题' }] as Rule[],
      type: [{ required: true, message: '请选择公告类型' }] as Rule[],
      level: [{ required: true, message: '请选择公告级别' }] as Rule[],
      content: [{ required: true, message: '请填写公告内容' }] as Rule[],
    })
    const fileList = ref<{
      uid: string;
      name: string;
      status: string;
      path: string;
    }[]>([])
    const customRequest: UploadProps['customRequest'] = async (data) => {
      const res = await cubeFileService.uploadFile({
        businessKey: 'ouaa',
        file: data.file as File,
      })

      if (res.id && res.name && res.path) {
        fileList.value.push({
          uid: res.id,
          name: res.name,
          status: 'success',
          path: res.path,
        })
      }
    }
    const removeFile = (data: { uid: string; }): void => {
      fileList.value = fileList.value.filter((item) => item.uid !== data.uid)
    }
    const getHtml = (value: string): void => {
      formState.content = value
    }
    const onCancel = (): void => {
      history.go(-1)
    }
    const onSubmit = async (): Promise<void> => {
      detailFormRef.value && detailFormRef.value?.validate()
      let msg = ''
      MessageModuleRef.value?.getData().forEach(item => {
        if (item.way.length === 0) {
          msg = '请选择通知方式'
        }
        if (!item.deptIds && !item.postIds && !item.roleIds && !item.userIds) {
          msg = '请选择通知人员'
        }
      })
      if (!msg) {
        const setList = JSON.parse(JSON.stringify(MessageModuleRef.value?.getData())) as SetList[]
        const noticeConfigCommands = setList.map(
          (item) => {
            item.way = Array.isArray(item.way) && item.way.length ? item.way.join(',') : ''
            return {
              ...item,
              deptIds: item.deptIds.map(e => e.id),
              postIds: item.postIds.map(e => e.id),
              roleIds: item.roleIds.map(e => e.id),
              userIds: item.userIds.map(e => e.id)
            }
          }
        )
        const params = {
          ...formState,
          noticeConfigCommands,
          fileIds: fileList.value.map((item) => item.uid),
          type: formState.type[1]
        }
        loading.value = true
        await cubeAnnouncementService.noticeInfoAdd(params)
        loading.value = false
        history.go(-1)
      }
    }
    const getTypeList = async (): Promise<void> => {
      const res = await cubeAnnouncementService.noticeType()
      const news = res.filter(e => e.oneLevelType === 'NEW_INFORMATION').map(e => {
        return { value: e.id, label: e.typeName, ...e }
      })
      const notice = res.filter(e => e.oneLevelType === 'ANNOUNCEMENT').map(e => {
        return { value: e.id, label: e.typeName, ...e }
      })
      typeOptions.value = [
        {
          value: 'ANNOUNCEMENT',
          label: '通知公告',
          children: notice
        },
        {
          value: 'NEW_INFORMATION',
          label: '新闻资讯',
          children: news
        },
      ]
      publishAgencyOptions.value = await cubeAnnouncementService.noticeInstitution()
      tagOptions.value = await cubeAnnouncementService.noticeLabel()
      levelOptions.value = await cubeAnnouncementService.noticeLevel()
    }
    onMounted(() => {
      getTypeList()
    })
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form ref={detailFormRef} model={formState} rules={panelRules.value} layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='公告标题' style={{ margin: '10px 0' }} name='title'>
                <Input style={{ width: '250px' }} placeholder='请输入' v-model:value={formState.title} />
              </FormItem>
              <FormItem label='公告类别' style={{ margin: '10px 0' }} name='type'>
                <Cascader style={{ width: '250px' }} allowClear options={typeOptions.value} placeholder='请选择' v-model:value={formState.type} />
              </FormItem>
              <FormItem label='公告级别' style={{ margin: '10px 0' }} name='level'>
                <Select fieldNames={{ label: 'name', value: 'code' }} style={{ width: '250px' }} allowClear options={levelOptions.value} placeholder='请选择' v-model:value={formState.level} />
              </FormItem>
              <FormItem label='公告标签' style={{ margin: '10px 0' }}>
                <Select fieldNames={{ label: 'typeName', value: 'id' }} style={{ width: '260px' }} allowClear options={tagOptions.value} placeholder='请选择' v-model:value={formState.tagId} />
              </FormItem>
              <FormItem label='发布机构' style={{ margin: '10px 0' }}>
                <Select fieldNames={{ label: 'typeName', value: 'id' }} style={{ width: '260px' }} allowClear options={publishAgencyOptions.value} placeholder='请选择' v-model:value={formState.publishAgency} />
              </FormItem>
              <FormItem label='公告内容' style={{ margin: '10px 0' }} name='content'>
                <CubeEdit onGetHtml={getHtml} />
              </FormItem>
              <FormItem label='附件信息' style={{ margin: '10px 0' }}>
                <Upload
                  fileList={fileList.value}
                  v-model={[fileList.value, 'fileList']}
                  customRequest={customRequest}
                  onRemove={removeFile}
                  showUploadList
                  maxCount={50}
                  accept=''
                >
                  <Button type='primary'>上传</Button>
                </Upload>
              </FormItem>
              <Col span='24'>
                <FormItem label='公告人员' style={{ margin: '10px 0' }}>
                  <MessageModule ref={MessageModuleRef} />
                </FormItem>
              </Col>
            </Form>
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <div>
            <Button onClick={onCancel}>返回</Button>
            <Button style={{ marginLeft: '10px' }} loading={loading.value} type='primary' onClick={onSubmit}>保存</Button>
          </div>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <CubeLayout title='新增公告管理' v-slots={layoutSlots} />
      </>
  }
})
