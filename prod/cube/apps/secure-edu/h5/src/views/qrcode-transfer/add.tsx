import { defineComponent, reactive, ref } from 'vue'
import { Form, Field, CellGroup, Button, RadioGroup, Radio, Calendar, Uploader, showNotify, type UploaderFileListItem, TimePicker, Popup } from 'vant'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { cubeFileService, cubeSecureEduService } from '@/api/server'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import './qrcode-transfer.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

interface FormState {
  trainTheme: string;
  trainType: string | null;
  numberOfParticipant: number | null;
  trainDuration: number | null;
  trainDate: string;
  onSitePhotos: { url: string;isImage: true; }[];
}

type FileList = UploaderFileListItem & { ossId: string; }

/** 安全教育 添加页面 */
export const SecureEduAdd = defineComponent({
  setup: () => {
    document.title = '安全教育'
    const router = useRouter()
    const objId: string = router.currentRoute.value.query.entityId as string

    const maxPicLimit = 3
    const formState = reactive<FormState>({
      trainTheme: '',
      trainType: null,
      numberOfParticipant: null,
      trainDuration: null,
      trainDate: '',
      onSitePhotos: []
    })
    const fileList = ref<FileList[]>([])
    const showCalendar = ref(false)
    const showTimePicker = ref(false)
    const subLoading = ref(false)

    const calendarConfirm = (date: Date): void => {
      formState.trainDate = dayjs(date).format('YYYY-MM-DD')
      showCalendar.value = false
    }
    const timeConfirm = ({ selectedValues }: { selectedValues: string[]; }): void => {
      formState.trainDate += ` ${selectedValues.join(':')}`
      showTimePicker.value = false
    }

    const clickUpload = async (): Promise<void> => {
      const remainNum = maxPicLimit - formState.onSitePhotos.length
      if (remainNum < 1) {
        return
      }
      if (getEnvironment() === 'cubeApp') {
        // js sdk 能力调取
        const res = await cubeAppService.uploadImage(remainNum + '', { sceneCode: GLOBAL_SCENE_CODE.safetyEducationCultivatePhoto })
        fileList.value = [...fileList.value, ...res.map(e => {
          const item = e as { path: string; id: string; }
          return {
            url: item.path,
            ossId: item.id,
            isImage: true
          }
        })]
      } else {
        (document.querySelector('.van-uploader__input') as unknown as HTMLElement).click()
      }
    }
    const customUploader = async (uploadItem: UploaderFileListItem): Promise<void> => {
      if (!uploadItem.file) {
        return
      }
      const fileIndex = fileList.value.findIndex(e => uploadItem.file && e.file && e.file.name === uploadItem.file.name)
      if (fileIndex === -1) {
        return
      }
      if (uploadItem.file.size / 1024 > 1024 * 100) {
        showNotify('附件图片大小不能超过100MB')
        fileList.value.splice(fileIndex, 1)
        return
      }
      fileList.value[fileIndex].status = 'uploading'
      const res = await cubeFileService.uploadFile({ file: uploadItem.file, businessKey: 'maintain', sceneCode: GLOBAL_SCENE_CODE.safetyEducationCultivatePhoto })
      fileList.value[fileIndex].status = ''
      fileList.value[fileIndex].ossId = res.id ?? ''
    }

    const onSubmit = async (): Promise<void> => {
      const params = {
        themeName: formState.trainTheme,
        cultivateType: formState.trainType,
        personNum: parseInt(formState.numberOfParticipant as unknown as string),
        cultivateDate: formState.trainDate,
        cultivateDuration: formState.trainDuration ? parseInt(formState.trainDuration as unknown as string) : null,
        photo: fileList.value.map(e => e.ossId).join(','),
        objId
      }
      try {
        subLoading.value = true
        await cubeSecureEduService.saveSafetyCultivate(params)
        showNotify({ message: '提交成功', type: 'success' })
        setTimeout(() => {
          history.go(-1)
        }, 1000)
      } catch (error) {
        showNotify({ type: 'danger', message: (error as { errorMessage?: string })?.errorMessage || '提交失败' })
      } finally {
        subLoading.value = false
      }
    }

    return (): JSX.Element =>
      <>
        <CubeNavBar title='安全教育' showBack />
        <Form onSubmit={onSubmit} class='secure-edu-qrcode-form'>
          <CellGroup inset>
            <Field
              name='trainTheme'
              label='培训主题'
              placeholder='请输入'
              rules={[{ required: true, message: '请输入培训主题' }]}
              v-model={formState.trainTheme}
              required
            />
            <Field
              readonly
              name='培训类型'
              label='培训类型'
              placeholder='请选择'
              rules={[{ required: true, message: '请选择' }]}
              v-slots={
                {
                  input: () => {
                    return (
                      <RadioGroup v-model={formState.trainType} direction='horizontal'>
                        <Radio name='INSIDE'>内部培训</Radio>
                        <Radio name='COMMERCIAL'>商户培训</Radio>
                      </RadioGroup>
                    )
                  }
                }
              }
              required
            />
            <Field
              name='参与人数'
              label='参与人数'
              placeholder='请输入'
              type='digit'
              rules={[{ required: true, message: '请输入参与人数' }]}
              v-model={formState.numberOfParticipant}
              required
            />
            <Field
              name='trainDate'
              label='培训日期'
              placeholder='点击选择'
              rules={[{ required: true, message: '请选择日期' }]}
              required
              readonly
              v-model={formState.trainDate}
              onClick={() => {
                showCalendar.value = true
              }}
            />
            <Field
              name='培训时长'
              label='培训时长'
              placeholder='请输入'
              type='digit'
              v-model={formState.trainDuration}
              v-slots={
                { extra: () => <span>分钟</span> }
              }
            />
            <Field
              label='现场照片'
              v-slots={
                {
                  input: () => {
                    return (
                      <Uploader
                        v-model={fileList.value}
                        max-count={maxPicLimit}
                        readonly={getEnvironment() === 'cubeApp'}
                        onClickUpload={clickUpload}
                        afterRead={(file: UploaderFileListItem) => {
                          customUploader(file)
                        }}
                      />
                    )
                  }
                }
              }
            />
          </CellGroup>
          <div style='margin: 16px;'>
            <Button round block type='primary' native-type='submit' loading={subLoading.value}>
              提交
            </Button>
          </div>
        </Form>
        <Calendar v-model:show={showCalendar.value} onConfirm={calendarConfirm} />
        <Popup v-model:show={showTimePicker.value} round position='bottom' close-on-click-overlay={false}>
          <TimePicker title='选择时间' cancel-button-text='' onConfirm={timeConfirm} />
        </Popup>
      </>
  }
})
