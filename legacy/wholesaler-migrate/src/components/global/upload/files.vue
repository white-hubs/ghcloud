<template>
  <div class="clearfix">
    <a-upload v-bind="$attrs" list-type="text" :file-list="fileList" @preview="handlePreview" @change="handleChange"
      :remove="handleRemove" :customRequest="customRequest" :accept="accept">
      <!-- 新增加了一个属性accept 控制文件上传的格式 -->
      <div v-if="fileList.length < fileNumberLimit">
        <!-- <a-icon type="plus" /> -->
        <a-button class="ant-upload-text"> 上传附件 </a-button>
      </div>
    </a-upload>
    <a-modal :visible="previewVisible" :width="1200" :footer="null" @cancel="handleCancel" :zIndex="99999">
      <template slot="title">{{ previewFileName || '预览' }}</template>
      <iframe v-if="previewVisible" style="width: 100%; height: 700px; border: none;" :src="previewUrl"></iframe>
    </a-modal>
  </div>
</template>
<script>
import { getNowEnterprise } from '@/utils/auth';
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: Array,
    files: Array,
    fileNumberLimit: {
      default: 4,
      type: Number,
    },
    fileSizeLimit: {
      default: 10,
      type: Number,
    },
    accept: {
      type: String,
      default: '',
    },
    useCenterApi: Boolean,
    type: String,
  },
  data() {
    return {
      previewVisible: false,
      previewUrl: '',
      previewFileName: '',
      fileList: [],
      uploadedFileList: [],
    };
  },
  computed: {
    filehost() {
      return this.useCenterApi
        ? // ? window.config.centerHost.replace(/\/$/, '') + this.$filehost
        this.$filehost
        : this.$filehost;
    },
  },
  watch: {
    files() {
      // 接受上层的控制
      this.uploadedFileList = this.files || [];
      this.fileList = this.uploadedFileList?.map((item) => {
        return {
          uid: item.id,
          url: item.path,
          status: 'done',
          ...item,
        };
      });
    },
  },
  mounted() {
    this.uploadedFileList = this.files || [];
    this.fileList = this.uploadedFileList?.map((item) => {
      return {
        uid: item.id,
        url: item.path,
        status: 'done',
        ...item,
      };
    });
  },
  methods: {
    handleCancel() {
      this.previewVisible = false;
    },
    async handlePreview(file) {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj);
      }
      this.previewUrl = file.url || file.preview;
      this.previewFileName = file.name;
    
      // 使用kkfile预览
      const kkFileBaseUrl = 'http://192.168.10.99:29090'
      const originUrl = window.location.origin
      const fileType = ['doc', 'docx', 'excel', 'xlsx', 'xls', 'pdf', 'ppt', 'pptx', 'txt']
      if (fileType.includes(file.type)) {
        const fileUrl =  `${kkFileBaseUrl + file.path}`.replace('/minio', '')
        this.previewUrl = `${originUrl}/tools/kkfileview/onlinePreview?url=${encodeURIComponent(btoa(fileUrl))}&fileName=${file.name}`
      } else {
        this.previewUrl = file.path;
      }
      this.previewVisible = true;
    },
    handleChange({ fileList }) {
      this.fileList = fileList;
    },
    async handleRemove(file) {
      // const { id } = file;
      // if (id) {
      //   await this.$restful('DELETE:/sys/files/', {
      //     fileIds: [file.id].join(','),
      //   });
      // }
      // this.$message.success('删除成功!');
      const index = this.fileList.indexOf(file);
      const newFileList = this.fileList.slice();
      newFileList.splice(index, 1);
      this.fileList = this.uploadedFileList = newFileList;
      this.$emit(
        'change',
        this.uploadedFileList.map((item) => item.id),
      );
      this.$emit('update:files', this.uploadedFileList); // 同步上层组件的files, 如果有的话
    },
    async customRequest({ file, onProgress, onSuccess, onError }) {
      const valite = await this.beforeUpload(file);
      if (valite) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('businessKey', 'xdata')
        formData.append('tenant', getNowEnterprise().code)
        // this.uploading = true;
        this.$restful(
          'POST:/file/file',
          formData,
          {
            processData: false,
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => {
              const percentNum = Math.round((e.loaded * 100) / e.total);
              onProgress({ percent: percentNum }, file);
            },
          },
        )
          .then((res) => {
            onSuccess(res);
            this.uploadedFileList = [...this.uploadedFileList, res];
            this.fileList = this.uploadedFileList.map((item) => {
              return {
                uid: item.id,
                url: item.path,
                thumbUrl: file.thumbUrl,
                status: 'done',
                ...item,
              };
            });
            this.$emit(
              'change',
              this.uploadedFileList.map((item) => item.id),
            );
            this.$emit('update:files', this.uploadedFileList); // 同步上层组件的files, 如果有的话
            this.$message.success('上传成功!');
          })
          .catch((e) => {
            onError(e);
            // this.uploading = false;
            this.$message.error('上传失败!');
          });
      } else {
        this.fileList.splice(-1);
      }
    },
    async beforeUpload(file) {
      // const isJpgOrPng = /(pdf|word|text|zip|application|image)/gi.test(
      //   file.type,
      // );
      // if (!isJpgOrPng) {
      //   this.$message.error(
      //     '目前只支持pdf|word|xls|text|zip等格式的图片/文件!',
      //   );
      // }
      const isLegalFileName = /^[^#?]+$/.test(file.name);
      if (!isLegalFileName) {
        this.$message.error('文件名中不能包含#?等特殊符号');
      }
      const isLt2M = file.size / 1024 / 1024 < this.fileSizeLimit;
      if (!isLt2M) {
        this.$message.error('图片文件大小不能超过' + this.fileSizeLimit + 'M!');
      }
      // return isJpgOrPng && isLt2M && isLegalFileName;
      return isLt2M && isLegalFileName;
    },
  },
};
</script>
<style>
/* you can make up upload button and sample style by using stylesheets */
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
