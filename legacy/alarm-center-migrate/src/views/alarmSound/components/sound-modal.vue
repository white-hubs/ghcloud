<template>
  <a-modal centered v-model:visible="showSoundModal" title="配置报警音频1" @ok="handleOk" @cancel="handleCancel"
    :confirmLoading="loading" width="640px">
    <a-form :model="formState" ref="formRef" :label-col="{span: 4, offset: 0}">
      <a-form-item label="报警级别">
        {{ alarmLevel.name }}
      </a-form-item>
      <a-form-item label="是否循环播放" name="looped">
        <a-switch v-model:checked="formState.looped" checked-children="是" un-checked-children="否" />
      </a-form-item>
      <a-form-item label="播放次数" name="playNum" v-if="!formState.looped">
        <a-input-number min="0" max="999" placeholder="请输入播放次数" v-model:value="formState.playNum"
          style="width: 180px; margin-right: 10px;" />次
      </a-form-item>
      <a-form-item label="音频附件" name="file">
        <!-- <a-upload
          v-model:fileList="fileList"
          name="file"
          :multiple="false"
          :customRequest="customRequest"
          accept=".mp3,.mp4"
          :remove="removeFile"
        >
          <a-button><UploadOutlined /> 上传 </a-button>
        </a-upload> -->
        <g-upload v-model:fileList="fileList" sceneCode="ALARM:LEVEL_PLAY_CONFIG" accept=".mp3,.mp4"></g-upload>
        <span class="placeholder">支持上传（.mp3/.mp4）</span>
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button key="back" @click="handleCancel">取消</a-button>
      <a-button type="primary" :loading="loading" @click="handleOk">确定</a-button>
    </template>
  </a-modal>
</template>

<script lang="jsx">
import { UploadOutlined } from "@ant-design/icons-vue";
import { cubeAlarmCenterService, cubeFileService } from "@/api/service";
import { defineComponent, getCurrentInstance, onMounted, reactive, ref, } from "vue";

export default defineComponent({
  components: {
    UploadOutlined
  },
  setup(props, { emit, expose }) {
    const { proxy } = getCurrentInstance();
    const showSoundModal = ref(false)
    const loading = ref(false)
    const soundFile = ref()
    const alarmLevel = ref()
    const fileList = ref([])
    const formState = reactive({
      alarmLevelCode: alarmLevel.code,
      looped: null,
      playNum: null,
      file: null,
    })
    const formRef = ref()
    const openImportModal = (record) => {
      showSoundModal.value = true
      soundFile.value = null
      alarmLevel.value = record
      reset()
      initData()
    }
    const initData = async () => {
      const res = await cubeAlarmCenterService.getAlarmLevelPlayConfig({ alarmLevelCode: alarmLevel.value.code })
      formState.looped = res?.looped
      formState.playNum = res?.playNum
      if (res?.file) {
        soundFile.value = res.file
        fileList.value = [{
          uid: res.file.id,
          name: res.file.name,
          status: 'success',
          url: res.file.path
        }]
      }
    }
    const customRequest = async (data) => {
      if (data.file.size / 1024 > 1024 * 300) {
        proxy.$message.warn('附件上传大小不能超过300MB')
        return
      }
      const res = await cubeFileService.uploadFile({
        businessKey: 'alarm',
        file: data.file
      })
      fileList.value = [{
        uid: res.id,
        name: res.name,
        status: 'success',
        path: res.path
      }]
      soundFile.value = res
    }
    const removeFile = async (file) => {
      soundFile.value = null
      await cubeFileService.deleteFile(file.uid)
    }
    const handleOk = async () => {
      try {
        loading.value = true
        const params = {
          alarmLevelCode: alarmLevel.value.code,
          file: soundFile.value?.id ?? null,
          looped: !!formState.looped,
          playNum: formState.playNum
        }
        await cubeAlarmCenterService.saveAlarmLevelPlayConfig(params)
        proxy.$message.success('操作成功')
      } catch (error) {
        proxy.$message.error(error?.errorMessage ?? '操作失败')
      } finally {
        loading.value = false
        showSoundModal.value = false
        emit('enter')
      }
    }
    const handleCancel = () => {
      showSoundModal.value = false
      reset()
    }
    const reset = () => {
      fileList.value = []
      for (const key in formState) {
        formState[key] = null
      }
    }
    expose({
      openImportModal
    })
    return {
      showSoundModal,
      formState,
      loading,
      soundFile,
      fileList,
      openImportModal,
      customRequest,
      formRef,
      handleCancel,
      handleOk,
      alarmLevel,
      reset,
      removeFile
    };
  },
});
</script>
<style scoped lang="less">
.step-form-title {
  width: 90%;
  margin: 0 auto;
  margin-bottom: 20px;
  font-size: 12px;
}

.step-form {
  width: 90%;
  margin: 0 auto;
  margin-bottom: 20px;
  min-height: 300px;
}

.step-form-table {
  width: 94%;
  margin: 0 auto;
  margin-bottom: 20px;
  min-height: 300px;
}

.placeholder {
  margin-top: 10px;
  color: rgb(202, 202, 202);
  display: block;
}

:deep(.ant-upload-list-item-info>span) {
  display: flex;
  align-items: center;
}

:deep(.ant-upload-list-text .ant-upload-list-item-name) {
  padding-left: 20px;
}
</style>
