<template>
  <el-upload :class="`avatar-uploader ${fileList.length?'has-upload':''}`" :headers="headers"
    :http-request="customRequest" acceept=".jpg,.jpeg,.png,.svg" :on-change="onChange" :on-remove="onRemove"
    v-model:file-list="fileList" list-type="picture-card" :limit="1">
    <el-icon>
      <Plus />
    </el-icon>
  </el-upload>
</template>

<script>
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs,watch } from "vue";
import { Plus } from '@element-plus/icons-vue'
import { cubeFileService } from "../../../../api/service"

export default defineComponent({
  components: { Plus },
  props: {
    //文件服务地址
    businessKey: {
      type: String,
      default: "mdata",
    },
    file: {
      type: Array,
      default: () => {
        return []
      }
    },
    sceneCode:{
      type: String,
      default: "",
    }
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      fileList: [],
      headers: {
        Authorization:
          "Bearer " + JSON.parse(sessionStorage.getItem("GH-Token")).access_token,
        tenant: JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code,
        terminal: window.config.terminal,
      },
    })
    onMounted(() => {
      state.fileList = props.file
    })
    watch(() => props.file,() =>{
      try {
        state.fileList = props.file
      } catch (error) {
        
      }
    })
    const customRequest = async (file) => {
      const data = await cubeFileService.uploadFile({
        file: file.file,
        businessKey: props.businessKey,
        sceneCode: props.sceneCode ?? ''
      })
      if (data) {
        try {
          props.sceneCode && await cubeFileService.persistFile(sceneCode,[res.id])
        } catch {
          
        }
        const url = !data.path?.startsWith('http') ? `${location.origin}${data.path}` : `${data.path}}`
        state.fileList = [{ name: data.name, url: url, id: data.id }];
        file.onSuccess({ data: data }, file);
      }
    };
    const onChange = (uploadFile) => {
      if (uploadFile.status === "success") {
        emit("onChangeFile", state.fileList)
      }
    }
    const onRemove = (uploadFile) => {
      state.fileList = []
      emit("onChangeFile", state.fileList)
    }
    return {
      ...toRefs(state),
      customRequest,
      onChange,
      onRemove
    }
  }
})
</script>

<style lang="less" scoped>
:deep(.el-upload__input) {
  display: none !important;
}

.has-upload {
  :deep(.el-upload) {
    display: none !important;
  }
}
</style>