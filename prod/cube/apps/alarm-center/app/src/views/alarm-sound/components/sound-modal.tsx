import { defineComponent, ref, reactive } from 'vue'
import { Modal, Form, InputNumber, Upload, Button, Switch, message, type FormInstance, type UploadFile, FormItem } from '@ghcloud/cube-ui'
import { cubeAlarmCenterService, cubeFileService } from '@/api/service'
import styles from './sound-modal.module.less'
import { UploadOutlined } from '@ghcloud/cube-ui'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import type { AlarmLevel, AlarmLevelPlayConfigVO, FileVOState } from '@ghcloud/cube-alarm-center-service/src/types/alarm-center'
import type { UploadProps } from 'ant-design-vue/es'

interface FormState {
  looped: boolean | null;
  playNum: number | null;
  file: string | null;
}

type SoundConfig = (AlarmLevel & AlarmLevelPlayConfigVO)
export const SoundModal = defineComponent({
  emits: ['enter'],
  setup (props, { emit, expose }) {
    const showSoundModal = ref(false)
    const loading = ref(false)
    const soundFile = ref<FileVOState | null>(null)
    const alarmLevel = ref<SoundConfig>()
    const fileList = ref<UploadFile[]>([])

    const formState = reactive<FormState>({
      looped: null,
      playNum: null,
      file: null,
    })

    const formRef = ref<FormInstance>()

    // 打开弹窗方法
    const openImportModal = (record: SoundConfig): void => {
      showSoundModal.value = true
      soundFile.value = null
      alarmLevel.value = record
      reset()
      initData()
    }

    // 初始化数据
    const initData = async (): Promise<void> => {
      if (!alarmLevel.value?.code) return

      try {
        const res = await cubeAlarmCenterService.getAlarmLevelPlayConfig({
          alarmLevelCode: alarmLevel.value.code
        })
        formState.looped = res?.looped ?? null
        formState.playNum = res?.playNum ?? null
        if (res?.file) {
          soundFile.value = res.file ?? null
          fileList.value = [{
            uid: res.file.id,
            name: res.file.name ?? '',
            status: 'success',
            url: res.file.path
          }]
        }
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '初始化失败')
      }
    }

    // 自定义上传
    const customRequest: UploadProps['customRequest'] = async ({ file }): Promise<void> => {
      if ((file as File).size / 1024 > 1024 * 300) {
        message.warn('附件上传大小不能超过300MB')
        return
      }
      try {
        const res = await cubeFileService.uploadFile({
          businessKey: 'alarm',
          file: file as File,
          sceneCode: GLOBAL_SCENE_CODE.alarmLevelPlayConfig
        })

        fileList.value = [{
          uid: res.id ?? '',
          name: res.name ?? '',
          status: 'success',
          url: res.path ?? ''
        }]
        soundFile.value = res as FileVOState
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '上传失败')
      }
    }

    // 删除文件
    const removeFile = async (file: UploadFile): Promise<void> => {
      try {
        await cubeFileService.deleteFile(file.uid)
        soundFile.value = null
        fileList.value = []
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '删除失败')
      }
    }

    // 提交表单
    const handleOk = async (): Promise<void> => {
      if (!alarmLevel.value?.code) return

      try {
        loading.value = true
        const params = {
          alarmLevelCode: alarmLevel.value.code,
          file: soundFile.value?.id || '',
          looped: !!formState.looped,
          playNum: formState.playNum || 0
        }

        await cubeAlarmCenterService.saveAlarmLevelPlayConfig(params)
        message.success('操作成功')
        emit('enter')
        showSoundModal.value = false
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      } finally {
        loading.value = false
      }
    }

    // 关闭弹窗
    const handleCancel = (): void => {
      showSoundModal.value = false
      reset()
    }

    // 重置表单
    const reset = (): void => {
      fileList.value = []
      Object.keys(formState).forEach(key => {
        formState[key as keyof FormState] = null
      })
    }

    expose({ openImportModal })

    return (): JSX.Element => (
      <Modal
        centered
        visible={showSoundModal.value}
        title='配置报警音频'
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading.value}
        width={640}
        v-slots={{
          footer: () => (
            <>
              <Button key='back' onClick={handleCancel}>取消</Button>
              <Button type='primary' loading={loading.value} onClick={handleOk}>确定</Button>
            </>
          )
        }}
      >
        <Form model={formState} ref={formRef} labelCol={{ span: 4, offset: 0 }}>
          <FormItem label='报警级别'>
            {alarmLevel.value?.name || '--'}
          </FormItem>
          <FormItem label='是否循环播放' name='looped'>
            <Switch
              v-model:checked={formState.looped}
              checkedChildren='是'
              unCheckedChildren='否'
            />
          </FormItem>
          {!formState.looped && (
            <FormItem label='播放次数' name='playNum'>
              <InputNumber
                min={0}
                max={999}
                placeholder='请输入播放次数'
                v-model:value={formState.playNum}
                style={{ width: '180px !important', marginRight: '10px' }}
              />
              次
            </FormItem>
          )}
          <FormItem label='音频附件' name='file'>
            <Upload
              fileList={fileList.value}
              name='file'
              multiple={false}
              customRequest={customRequest}
              accept='.mp3,.mp4'
              onRemove={removeFile}
            >
              <Button><UploadOutlined /> 上传</Button>
            </Upload>
            <span class={styles.placeholder}>支持上传（.mp3/.mp4）</span>
          </FormItem>
        </Form>
      </Modal>
    )
  }
})
