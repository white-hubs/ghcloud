<template lang="pug">
  div.files-display
    div.file-box(v-for="file in computedFiles")
      div.file-name.ellipsis(:title="file.name") {{ file.name }} 
      div.file-prview-hit.ml2(title="预览" @click="handlePreview(file)")
        a-icon(type="eye")
    a-modal(:visible="previewVisible" :footer="null" @cancel="handleCancel")
      video(alt="预览" style="width: 100%;height: 600px;object-fit: contain;" :src="previewImage" autoplay v-if="previewVisible")
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
      previewImage: '',
    };
  },
  computed: {
    filehost() {
      return this.useCenterApi
        ? window.config.centerHost.replace(/\/$/, '') + this.$filehost
        : this.$filehost;
    },
    computedFiles() {
      const files = this.files.map((item) => {
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
    justify-content: space-between;
    .file-name {
      font-size: 12px;
      flex: 1;
      color: @heading-color;
    }
    .file-prview-hit {
      cursor: pointer;
      font-size: 16px;
      &:hover {
        color: @primary-color;
      }
    }
  }
}
</style>
