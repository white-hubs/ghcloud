<template>
  <div class="van-uploader__preview">
    <div class="van-image van-uploader__preview-image" @click="preView(item)">
      <img :src="item.path" class="van-image__img" v-if="type(item.type) === 'img'">
      <img :src="getFileIcon(item.type)" class="van-image__img" v-else>
    </div>
  </div>
  <van-popup
  v-model:show="showIframe"
  closeable
  position="bottom"
  :style="{ height: '90%',background: '#fff' }"
  teleport="body" 

  >
    <video v-if="type(item.type) === 'video'" :src="item.path" controls style="width: 100%;"></video>
    <iframe :src="iframeUrl" frameborder="0" width="100%" height="100%" style="width: 100%;height: 100%;" v-else></iframe>
  </van-popup>

</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { showImagePreview } from 'vant'

const iconDOC = new URL(`../../assets/img/icon-doc.png`, import.meta.url).href
const iconPPT = new URL(`../../assets/img/icon-ppt.png`, import.meta.url).href
const iconPDF = new URL(`../../assets/img/icon-pdf.png`, import.meta.url).href
const iconTXT = new URL(`../../assets/img/icon-txt.png`, import.meta.url).href

const props = defineProps({
  item: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

const showIframe = ref(false)
const iframeUrl = ref('')

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

const preView = (item: any) => {
  if(type.value(item.type)==='img'){
    const images = [item.path]
    showImagePreview({
      images,
      startPosition: 0,
    })
    return
  }
  let url = item.path
  if (!url.includes('http')) {
    url = window.location.origin + url 
  }
  showIframe.value = true
  iframeUrl.value = `${window.location.origin}/tools/kkfileview/onlinePreview?url=${encodeURIComponent(btoa(url))}&fileName=${item.name}`
}
</script>

<style lang="less" scoped>
.van-uploader,
.van-uploader__preview {
  width: 16vw;
  height: 16vw;
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
.van-uploader__wrapper{
  width: 100%;
  height: 100%;
  .van-uploader__upload{
    width: 100%;
    height: 100%;
    position: relative;
    margin: 0;
  }
}
</style>