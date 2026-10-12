<template>
  <div class="clearfix manual-upload">
    <a-upload
      list-type="text"
      :file-list="fileList"
      @change="handleChange"
      :remove="handleRemove"
      :before-upload="beforeUpload"
    >
      <div v-if="fileList.length < fileNumberLimit">
        <!-- <a-icon type="plus" /> -->
        <a-button class="ant-upload-text">
          {{ btnLabel || '上传附件' }}
        </a-button>
      </div>
    </a-upload>
  </div>
</template>
<script>
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
      default: 5,
      type: Number,
    },
    btnLabel: String,
  },
  data() {
    return {
      previewVisible: false,
      previewImage: '',
      fileList: [
        // {
        //   uid: '-1',
        //   name: 'xxx.png',
        //   status: 'done',
        //   url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        //   thumbUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        // },
      ],
      uploadedFileList: [],
    };
  },
  // computed: {
  //   imageList(){
  //     return this.value || []
  //   }
  // },
  watch: {
    files() {
      // 接受上层的控制
      this.uploadedFileList = this.files || [];
      this.fileList = this.uploadedFileList?.map((item) => {
        return {
          uid: item.id,
          url: this.$filehost + item.path,
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
        url: this.$filehost + item.path,
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
      this.previewImage = file.url || file.preview;
      this.previewVisible = true;
    },
    handleChange({ fileList }) {
      // this.fileList = fileList;
    },
    async handleRemove(file) {
      const index = this.fileList.indexOf(file);
      const newFileList = this.fileList.slice();
      newFileList.splice(index, 1);
      this.fileList = newFileList;
    },

    beforeUpload(file) {
      // if (/(sheet|excel)/.test(file.type)) {
      this.fileList = [...this.fileList, file];
      this.$emit('change', [...this.fileList]);
      // } else {
      //   this.$message.error('请上传excel格式的文件');
      // }
      const isLegalFileName = /^[^#?]+$/.test(file.name);
      if (!isLegalFileName) {
        this.$message.error('文件名中不能包含#?等特殊符号!');
      }

      return false;
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
.manual-upload .ant-upload-list-item {
  margin-top: 5px;
}
</style>
