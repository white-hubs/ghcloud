<template>
  <a-upload :multiple="true" :customRequest="customRequest" :file-list="fileList" :disabled="props.readonly"
    :accept="accept" :beforeUpload="beforeUpload" :showUploadList="false">
    <a-button type="primary" shape="round" v-if="!props.readonly">选择附件</a-button>
  </a-upload>
  <span class="placeholder" v-if="!props.readonly"> {{ placeholder }}|单个附件最大支持100MB</span>
  <a-empty v-if="props.readonly && fileList.length === 0" description="暂无附件" />
  <div class="template-upload-list template-upload-list-text" v-if="fileList.length > 0">
    <div class="template-upload-list-item" v-for="(item, index) in fileList" :key="index">
      <img :src="item.url" class="van-image__img" v-if="type(item.type) === 'img'">
      <img :src="getFileIcon(item.type)" class="van-image__img" v-else>
      <div class="action-icons">
        <EyeOutlined style="color:var(--template-primary-color);font-size: 18px;" v-if="item.status === 'success'"
          @click="handlePreviewItem(item)" />
        <DownloadOutlined style="color:var(--template-primary-color);font-size: 18px;" v-if="item.status === 'success'"
          @click="downLoad(item)" />
        <DeleteOutlined style="color:var(--template-error-color);font-size: 18px;" v-if="!props.readonly"
          @click="remove(item)" />
      </div>
    </div>
  </div>

  <a-modal v-model:visible="showPreviewModal" :title="'文件预览——' + previewItem?.name">
    <div style="width: 100%;display: flex;justify-content: center;">
      <img :src="previewItem.url" v-if="previewItem && privewItemType === 'image'"
        style="max-width: 100%;max-height: 100%;" />
      <video :src="previewItem.url" v-if="previewItem && privewItemType === 'video'"
        style="max-width: 100%;max-height: 100%;" controls></video>
      <audio :src="previewItem.url" v-if="previewItem && privewItemType === 'audio'"
        style="max-width: 100%;max-height: 100%;" controls></audio>
    </div>
    <template #footer>
      <a-button @click="previewItem=undefined;showPreviewModal = false">关闭</a-button>
    </template>
  </a-modal>
</template>
<script setup lang="ts">
import { uploadFile } from "@/api/file"
import { getNowEnterprise } from "@/utils/auth"
import { message } from "ant-design-vue"
import { computed, inject, onMounted, Ref, ref } from "vue"
import { BUSINESS_KEY_TO_SCENE_CODE, GLOBAL_SCENE_CODE } from'@ghcloud/cube-file-service'
import { LinkOutlined, LoadingOutlined, EyeOutlined, DownloadOutlined, DeleteOutlined, FileUnknownFilled } from '@ant-design/icons-vue';
import { Base64 } from 'js-base64';
import { useRoute } from "vue-router";
import { cubeFileService } from "@/api/service"

const props = withDefaults(
  defineProps<{
    modelValue?: any;
    placeholder?: string;
    readonly?: boolean;
    accept?: string;
  }>(),
  {
    modelValue: null,
    placeholder: "请选择附件",
    readonly: false,
  }
);

const emits = defineEmits(["update:modelValue"]);
type UploadStatus = "error" | "success" | "done" | "uploading" | "removed";
type FileListItem = {
  uid: string;
  name: string;
  status: UploadStatus;
  url: string;
  type:string;
};
const route=useRoute()
const sceneCode = BUSINESS_KEY_TO_SCENE_CODE.get(route.query.businessType as string??'') ?? GLOBAL_SCENE_CODE.approvalCenter
const fileList = ref<any[]>([]);
const files = ref<any[]>([]);
// 支持上传图片（.png/.jpeg/.jpg）、视频（MP4、AVI、MKV）、文档（.doc/.docx/.xls/.xlsx/.ppt/.pptx/.pdf）
const type = computed(() => {
  return (fileType: string) => {
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
const iconDOC = '/resource/v1/streamengine-pc-migrate/icon-doc.png'
const iconPPT = '/resource/v1/streamengine-pc-migrate/icon-ppt.png'
const iconPDF = '/resource/v1/streamengine-pc-migrate/icon-pdf.png'
const iconTXT = '/resource/v1/streamengine-pc-migrate/icon-txt.png'
const getFileIcon = computed(() => {
  return (fileType: string) => {
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
const beforeUpload = (_file: any, _fileList: any) => {
  if (_fileList.length > 5 - fileList.value.length) {
    message.error({ key: '1', content: '最多上传5个文件' })
    return false
  }
}
const customRequest = async (data: any) => {
  if (data.file.size / 1024 > 1024 * 100) {
    message.warning("附件上传大小不能超过100MB");
    return;
  }
  let fileInfo: FileListItem = {
    uid: data.file.uid,
    name: data.file.name,
    status: "uploading",
    type:'',
    url: "",
  };
  fileList.value = [...fileList.value, fileInfo];
  const lastIndex = fileList.value.length - 1
  const res = await cubeFileService.uploadFile({ 
    file: data.file, 
    businessKey: 'maintain', 
    sceneCode: sceneCode
  })
  try {
    sceneCode && await cubeFileService.persistFile(sceneCode,[res.id])
  } catch {
    
  }
  fileList.value[lastIndex].url = res.path;
  fileList.value[lastIndex].status = "success";
  fileList.value[lastIndex].type = res.type;
  files.value.push(res)
  emits("update:modelValue", files.value);
};

const remove = (obj: FileListItem) => {
  const index = fileList.value.findIndex(e => e.uid === obj.uid)
  if (index !== -1) {
    fileList.value.splice(index, 1)
    files.value.splice(index, 1)
    emits("update:modelValue", files.value);
  }
}

const downLoad = async (obj: FileListItem) => {
  message.loading('下载中')
  await fetch(obj.url).then((res) =>
    res.blob().then((blob) => {
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = obj.name
      a.click();
      window.URL.revokeObjectURL(url);
    })
  );
  message.destroy()
}

const previewItem = ref<FileListItem>()
const showPreviewModal = ref(false)
const privewItemType = ref('')
const handlePreviewItem = (obj: FileListItem) => {
  const index = obj.name.lastIndexOf("."); //（考虑严谨用lastIndexOf(".")得到）得到"."在第几位
  const fileValueSuffix = obj.name.substring(index); //截断"."之前的，得到后缀
  let fileType = ''
  if (/(.*)\.(mp4|avi|wmv|MP4|AVI|WMV|flv)$/.test(fileValueSuffix)) {
    fileType = 'video';
  } else if (/(.*)\.(jpg|JPG|bmp|BMP|mpg|MPG|mpeg|MPEG|tis|TIS|png|gif|jpge|svg|webp|jpeg)$/.test(fileValueSuffix)) { //根据后缀，判断是否符合图片格式
    fileType = 'image';
  } else if (/(.*)\.(xls|XLS|xlsx|XLSX)$/.test(fileValueSuffix)) {
    fileType = 'excel';
  } else if (/(.*)\.(doc|DOC)$/.test(fileValueSuffix)) {
    fileType = 'doc';
  } else if (/(.*)\.(docx|DOCX)$/.test(fileValueSuffix)) {
    fileType = 'docx';
  } else if (/(.*)\.(PPT|PPTX|ppt|pptx)$/.test(fileValueSuffix)) {
    fileType = 'ppt';
  } else if (/(.*)\.(pdf|PDF)$/.test(fileValueSuffix)) {
    fileType = 'pdf';
  } else if (/(.*)\.(mp3|wav|m4a)$/.test(fileValueSuffix)) {
    fileType = 'audio';
  } else{
    fileType = 'unknown';
  }
  privewItemType.value = fileType
  previewItem.value = obj
  
  if (['doc', 'docx', 'excel', 'pdf', 'ppt'].includes(fileType)) {
    if (!obj.url.includes('http')) {
      obj.url = window.location.origin + obj.url 
    }
    window.open(`${window.location.origin}/tools/kkfileview/onlinePreview?url=${encodeURIComponent(Base64.encodeURL(obj.url))}&fileName=${obj.name}`)
    return
  }
  showPreviewModal.value = true
}

onMounted(async () => {
  if (props.modelValue && props.modelValue.length > 0) {
    props.modelValue.forEach((element: { uid: any; name: any; path: any,type:string }) => {
      let fileInfo: FileListItem = {
        uid: element.uid,
        name: element.name,
        status: "success",
        url: element.path,
        type:element.type
      };
      fileList.value = [...fileList.value, fileInfo];
    });
  }
});
</script>
<style scoped lang="less">
.placeholder {
  display: block;
  margin-top: 10px;
  color: #adabab;
  font-size: smaller;
}

.template-empty {
  width: 180px;
  max-width: 100%;
}

.template-upload-list {
  display: flex;
  flex-wrap: wrap;
}

.template-upload-list-item {
  width: 100px;
  height: 100px;
  margin: 10px;

  img {
    width: 100px;
    height: 100px;
  }

  .file-status-icon {
    display: inline-block;
    margin-right: 10px;
  }

  .action-icons {
    position: absolute;
    top: 0;
    text-align: center;
    width: 100px;
    height: 100px;
    line-height: 100px;
    display: none;

    .anticon {
      margin: 5px;
    }
  }
}

.template-upload-list-item:hover {
  .action-icons {
    background-color: rgba(0, 0, 0, .7);
    display: block;
  }
}
</style>
<style lang="less">
.file-viewer-modal {
  .template-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }

  .template-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }

  .template-modal-body {
    flex: 1;
    overflow-y: scroll;
  }
}
</style>