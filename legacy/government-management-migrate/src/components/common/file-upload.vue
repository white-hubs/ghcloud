<template>
  <a-upload :multiple="true" :custom-request="customRequest" :file-list="fileList" :disabled="props.readonly"
    :before-upload="beforeUpload" :accept="props.accept" @remove="remove">
    <a-button v-if="!props.readonly" type="primary" shape="round">{{ props.buttonText }}</a-button>
  </a-upload>
  <span v-if="!props.readonly&&props.showPlaceholder" class="placeholder"> {{ placeholder }}|单个附件最大支持100MB</span>
</template>
<script setup lang="ts">
import type { OSSFile } from '@/api/file'
import { uploadFile } from '@/api/file'
import { getNowEnterprise } from '@/utils/auth'
import { message, type UploadFile } from 'ant-design-vue'
import type { FileType } from 'ant-design-vue/lib/upload/interface'
import type { UploadRequestOption } from 'ant-design-vue/lib/vc-upload/interface'
import { onMounted, ref, watch } from 'vue'
import { cubeFileService } from '@/api/service'
const props = withDefaults(
  defineProps<{
    value: OSSFile[]|string[];
    placeholder?: string;
    readonly?: boolean;
    valueFormat?: 'stringArr'|'ossFileArr';
    showPlaceholder?:boolean;
    buttonText?:string;
    accept?:string;
    sceneCode?:string;
  }>(),
  {
    placeholder: '请选择附件',
    readonly: false,
    valueFormat: 'ossFileArr',
    showPlaceholder: true,
    buttonText: '选择附件',
    accept: '',
    sceneCode:''
  }
);

const emits = defineEmits(['update:value']);
type UploadStatus = 'error' | 'success' | 'done' | 'uploading' | 'removed';
interface FileListItem {
  uid: string;
  name: string;
  status: UploadStatus;
  url: string;
}
const fileList = ref<UploadFile[]>([]);
const files = ref<OSSFile[]>(props.value as OSSFile[] ?? []);
const emitsValue = () => {
  if (props.valueFormat === 'ossFileArr') {
    emits('update:value', files.value);
  } else {
    emits('update:value', files.value.map(e => {
      return e.id
    }));
  }
}

const beforeUpload = (file: FileType, filelist: FileType[]) => {
  if (filelist.length > 5 - fileList.value.length) {
    message.error({ key: '1', content: '最多上传5个文件' })
    return false
  }
  return true
}
const customRequest = async (data: UploadRequestOption) => {
  const file = data.file as File & {uid:string;}
  if (file.size / 1024 > 1024 * 100) {
    message.warning('附件上传大小不能超过100MB');
    return;
  }
  const fileInfo: FileListItem = {
    uid: file.uid,
    name: file.name,
    status: 'uploading',
    url: ''
  };
  fileList.value = [...fileList.value, fileInfo];
  const lastIndex = fileList.value.length - 1
  const res =await cubeFileService.uploadFile({ 
     file: file,
     tenant:getNowEnterprise().code,
     businessKey: 'maintain' ,
     sceneCode:props.sceneCode
    })
  if (res) {
    fileList.value[lastIndex].url = res.path??'';
    fileList.value[lastIndex].status = 'success';
    files.value.push(res as unknown as OSSFile)
    emitsValue()
  }
};

const remove = (obj: UploadFile) => {
  const index = fileList.value.findIndex(e => e.uid === obj.uid)
  if (index !== -1) {
    fileList.value.splice(index, 1)
    files.value.splice(index, 1)
    emitsValue()
  }
}

watch(() => props.value, () => {
  if (props.value.length === 0) {
    fileList.value.length = 0
  }else{
    fileList.value = (props.value as OSSFile[]).map(e => {
      return {
        uid: e.id,
        size: e.size,
        name: e.name,
        fileName: e.name,
        url: e.path
      } as unknown as UploadFile
    });
  }
})

onMounted(async () => {
  if (props.value) {
    fileList.value = (props.value as OSSFile[]).map(e => {
      return {
        uid: e.id,
        size: e.size,
        name: e.name,
        fileName: e.name,
        url: e.path
      } as unknown as UploadFile
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

.ant-empty {
  width: 180px;
  max-width: 100%;
}
</style>
