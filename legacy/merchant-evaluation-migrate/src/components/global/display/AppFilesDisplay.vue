<template lang="pug">
  div.files-display
    div.file-box(v-for="file in computedFiles")
      div.file-name.ellipsis(:title="file.name" @click="handlePreview(file)")
        span
          a-icon(type="paper-clip")
        span.pl1 {{ file.name }}
      app-link-btn.ml2(title="预览" @click="handlePreview(file)")
        span 预览
      app-link-btn.ml2(title="预览" )
        a(:href="file.url" :download='file.name') 下载
    a-modal( :visible="previewVisible" :width="1200" :footer="null" @cancel="handleCancel" :zIndex="99999")
      template(slot="title")
        div {{ previewFileName || '预览' }}
      iframe(v-if="previewVisible" style="width: 100%; height: 700px; border: none;" :src="previewUrl" )
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
  props: {
    files: Array,
    useCenterApi: Boolean,
  },
  data() {
    return {
      previewVisible: false,
      previewUrl: '',
      previewFileName: '',
    };
  },
  computed: {
    filehost() {
      return this.useCenterApi
        ? window.config.centerHost.replace(/\/$/, '') + this.$filehost
        : this.$filehost;
    },
    computedFiles() {
      const files = this.files?.map((item) => {
        return {
          uid: item.id,
          url: this.filehost + item.path,
          status: 'done',
          ...item,
        };
      });
      return files;
    },
  },
  mounted() {},
  methods: {
    handleCancel() {
      this.previewVisible = false;
    },
    async handlePreview(file) {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj);
      }
      this.previewUrl = file.url || file.preview;
      //  this.previewUrl = '/office-preview/index.html?file=' + file.url;
      this.previewFileName = file.name;
      // 原来的代码
      // if (!/(jpg|jpeg|png|mp4|ppt|docx|xls)/gi.test(file.type)) {
      //   this.previewUrl = '/office-preview/index.html?file=' + file.url;
      // }
      // 更改后代码
      if (/(jpg|jpeg|png|ppt|docx|xls|ppt)/gi.test(file.type)) {
        this.previewUrl = '/office-preview/index.html?file=' + file.url;
      }
      //  this.previewUrl = '/office-preview/index.html?file=' + file.url;
      this.previewVisible = true;
      // let elemIF = document.createElement('iframe');
      // elemIF.src = this.previewUrl;
      // elemIF.style.display = 'none';
      // document.body.appendChild(elemIF);
      // window.open('/office-preview/index.html?file=' + file.url, '_blank');
    },
  },
};
</script>

<style lang="less" scoped>
@import '~@/styles/variables';
.files-display {
  .file-box {
    line-height: 30px;
    display: flex;
    align-items: center;
    // justify-content: space-between;
    .file-name {
      cursor: pointer;
      // font-size: 12px;
      // flex: 1;
      // color: @heading-color;
      color: #1890ff;
      &:hover {
        text-decoration: underline;
      }
    }
    .file-prview-hit {
      cursor: pointer;
      font-size: 16px;
      &:hover {
        color: @primary-color;
      }
    }
  }
  iframe {
    display: none;
  }
}
</style>
