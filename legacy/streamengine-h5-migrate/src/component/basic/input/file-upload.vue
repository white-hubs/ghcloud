<template>
  <VanField :label="props.label" v-model="textValue" type="text" :required="props.required" readonly
    :placeholder="props.placeholder" :disabled="props.readonly" :error-message="errorMessage">
    <template #input>
      <div class="upload-area">
        <template v-for="(item, i) in fileList">
          <div class="van-uploader__preview">
            <div class="van-image van-uploader__preview-image" @click="preView(item)">
              <img :src="item.path" class="van-image__img" v-if="type(item.type) === 'img'">
              <img :src="getFileIcon(item.type)" class="van-image__img" v-else>
            </div>

            <div role="button" class="van-uploader__preview-delete van-uploader__preview-delete--shadow"
              @click="delItem(i)" v-if="!props.readonly">
              <i class="van-badge__wrapper van-icon van-icon-cross van-uploader__preview-delete-icon"></i>
            </div>
          </div>
        </template>
        <div class="van-uploader" @click="chooseFile" v-if="!props.readonly">
          <div class="van-uploader__wrapper">
            <div class="van-uploader__upload">
              <i class="van-badge__wrapper van-icon van-icon-plus van-uploader__upload-icon"></i>
            </div>
          </div>
        </div>
        <span v-if="props.readonly&&fileList.length===0" style="color: #51555e;">暂无附件</span>
      </div>
    </template>
  </VanField>
  <input type="file" ref="cubeUploadFileInput" v-if="!underCubeEnvironment" style="display: none;"
    @change="inputFileChange">
</template>

<script setup lang="ts">
import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import {cubeFileService} from '../../../service/service'
import { cubeAppService, getAuthHeaders } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import { closeToast, showImagePreview, showLoadingToast, showNotify } from 'vant'
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { BUSINESS_KEY_TO_SCENE_CODE, GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

const iconDOC = new URL(`../../../assets/img/icon-doc.png`, import.meta.url).href
const iconPPT = new URL(`../../../assets/img/icon-ppt.png`, import.meta.url).href
const iconPDF = new URL(`../../../assets/img/icon-pdf.png`, import.meta.url).href
const iconTXT = new URL(`../../../assets/img/icon-txt.png`, import.meta.url).href
const MAX_LIMIT = 999
const props = defineProps<{
  label?: string;
  placeholder?: string;
  required?: boolean;
  modelValue?: any;
  readonly?: boolean;
  defaultValue?: string;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: any[]): void;
}>();
const underCubeEnvironment = getEnvironment()==='cubeApp'
const route = useRoute()
const sceneCode = BUSINESS_KEY_TO_SCENE_CODE.get(route.query.businessType as string??'') ?? GLOBAL_SCENE_CODE.approvalCenter
const cubeUploadFileInput = ref()
defineExpose<FormItemExpose>({
  validate: () => {
    if(props.readonly){
      return true
    }
    validInput.value = fileList.value.length > 0
    return validInput.value
  },
});
const validInput = ref(true)
const errorMessage = computed(() => {
  return (!validInput.value && props.required && !props.readonly) ? `请上传${props.label}` : ''
})

const textValue = ref(props.modelValue?.name ?? "无附件");
const fileList = ref<any[]>(props.modelValue ?? []);

watch(()=>props.modelValue,()=>{
  fileList.value = props.modelValue ?? []
})

const chooseFile = async () => {
  const remainNum = MAX_LIMIT - fileList.value.length
  if (remainNum < 1) {
    return
  }
  if(!underCubeEnvironment){
    chooseFileByInput()
    return
  }
  const res = await cubeAppService.uploadFile(remainNum + '',{sceneCode})
  fileList.value = [...fileList.value, ...res]
  if (fileList.value.length > MAX_LIMIT) {
    fileList.value = fileList.value.splice(MAX_LIMIT, fileList.value.length - MAX_LIMIT)
  }
  emit('update:modelValue', fileList.value)
  try {
    sceneCode && await cubeFileService.persistFile(sceneCode,fileList.value.map(e=>e.id))
  } catch {
    
  }
}

const chooseFileByInput=async ()=>{
  cubeUploadFileInput.value.click()
}

const inputFileChange=async ()=>{
  const inputDom=cubeUploadFileInput.value as HTMLInputElement
  let file = (inputDom.files as FileList)[0];
  if (file.size / 1024 > 1024 * 100) {
    showNotify('附件上传大小不能超过100MB')
    return;
  }
  showLoadingToast({
    message:"上传中",
    duration:0
  })
  inputDom.value = ''
  const res =await cubeFileService.uploadFile({ file: file,tenant:getAuthHeaders().tenant, businessKey: 'maintain', 
  sceneCode: sceneCode
 })
  fileList.value.push(res)
  emit('update:modelValue', fileList.value);
  closeToast()
}

const delItem = (i: number) => {
  fileList.value.splice(i, 1)
  emit('update:modelValue', fileList.value)
}

// 支持上传图片（.png/.jpeg/.jpg）、视频（MP4、AVI、MKV）、文档（.doc/.docx/.xls/.xlsx/.ppt/.pptx/.pdf）
const type = computed(() => {
  return (fileType: string) => {
    fileType = fileType.toLowerCase()
    if ('.png/.jpeg/.jpg/.gif/.webp'.includes(fileType)) {
      return 'img'
    }
    if ('mp4、avi、mkv'.includes(fileType)) {
      return 'video'
    }
    if ('.doc/.docx'.includes(fileType)) {
      return 'doc'
    }
    if ('.xls/.xlsx'.includes(fileType)) {
      return 'xls'
    }
    if ('.pptx/.ppt'.includes(fileType)) {
      return 'ppt'
    }
    if ('.pdf'.includes(fileType)) {
      return 'pdf'
    }
    if ('.txt'.includes(fileType)) {
      return 'txt'
    }
    return 'doc'
  }
})

const getFileIcon = computed(() => {
  return (fileType: string) => {
    fileType = fileType.toLowerCase()
    if ('.doc/.docx'.includes(fileType)) {
      return iconDOC
    } else if ('.pdf'.includes(fileType)) {
      return iconPDF
    } else if ('.pptx/.ppt'.includes(fileType)) {
      return iconPPT
    } else if ('.txt'.includes(fileType)) {
      return iconTXT
    } else {
      return iconDOC
    }
  }
})
const iframe=document.createElement('iframe')
const preView = (item: any) => {
  if(type.value(item.type)==='img'){
    const images = fileList.value.filter(e=>type.value(e.type)==='img').map(e=>e.path)
    showImagePreview({
      images,
      startPosition: images.findIndex(e=>e===item.path),
    })
    return
  }
  let url = item.path
  if (!url.includes('http')) {
    url = window.location.origin + url 
  }
  const box=document.getElementById('tab-form')
  const brother=document.getElementById('init-tab')
  iframe.src=`${window.location.origin}/tools/kkfileview/onlinePreview?url=${encodeURIComponent(btoa(url))}&fileName=${item.name}`
  iframe.id='review'
  iframe.style.height='100%'
  iframe.style.width='100%'
  box?.insertBefore(iframe,brother)
  history.pushState({ current: location.pathname + location.search }, "", '/review')
}
window.addEventListener('popstate', (event) => {
  if(document.getElementById('review')){
    iframe.remove()
  }
});
</script>

<style scoped lang="less">
.van-uploader,
.van-uploader__preview {
  width: 14vw;
  height: 14vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #FAFAFA;
  margin-right: 5px;
  margin-bottom: 5px;
  position: relative;
  overflow: hidden;

  :deep(.van-uploader__input-wrapper) {
    width: 100%;
  }

  .van-uploader__preview-delete {
    position: absolute;
    top: 0;
    right: 0;
    width: 14px;
    height: 14px;
    background: rgba(0, 0, 0, .7);
    border-radius: 0 0 0 6px;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
  }

  .van-image {
    width: 100%;
    height: 100%;

    img {
      width: 100%;
      height: 100%;
    }
  }
}

.van-uploader__wrapper {
  width: 100%;
  height: 100%;

  .van-uploader__upload {
    width: 100%;
    height: 100%;
    position: relative;
    margin: 0;
  }
}

.upload-area {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.van-uploader__preview {
  .van-uploader__upload {
    i {
      font-size: 24px;
    }
  }
}
</style>
<style lang="less">
.un-support-dialog {
  .van-dialog__message {
    display: flex;
    flex-flow: column;
  }

  .van-hairline--top:after {
    border-top-width: 1px;
  }
}

.preview-item {
  max-width: 100%;
  max-height: 80vh;
}

.van-image__img {
  object-fit: cover;
  max-height: 100%;
  max-width: 100%;
}
</style>
