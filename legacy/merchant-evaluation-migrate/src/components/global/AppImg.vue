<template lang="pug">
.imgs-display
  .img-box
    img(:src='filehost + files.path', :alt='files.name', :title='files.name')
    .img-hit-cover(:title='files.name', @click='handlePreview(files)')
      a-icon(type='eye')
  a-modal(
    :visible='previewVisible',
    :footer='null',
    @cancel='handleCancel',
    :zIndex='99999'
    :width="800"
  )
    img(alt='example', style='width: 100%;eight: 600px;object-fit: contain;', :src='previewImage')
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
    files: Object,
  },
  data() {
    return {
      previewVisible: false,
      previewImage: '',
    };
  },
  computed: {
    filehost() {
      return this.$filehost;
    },
  },
  methods: {
    handleCancel() {
      this.previewVisible = false;
    },
    async handlePreview(file) {
      console;
      if (!file.path) {
        file.preview = await getBase64(file.originFileObj);
      }
      this.previewImage = this.filehost + file.path;
      this.previewVisible = true;
    },
  },
};
</script>

<style lang="less" scoped>
.imgs-display {
  display: flex;
  flex-wrap: wrap;
  .img-box {
    width: 104px;
    height: 104px;
    padding: 8px;
    border: 1px solid #d9d9d9;
    margin: 0 8px 8px 0;
    position: relative;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .img-hit-cover {
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      i {
        color: #fff;
        font-size: 18px;
        visibility: hidden;
      }
      &:hover {
        background-color: rgba(0, 0, 0, 0.5);
        i {
          visibility: visible;
        }
      }
    }
  }
}
</style>
