<template lang="pug">
  div.imgs-display
    div.img-box(v-for="(img, index) in computedFiles" :key="index" :class="{small: small}")
      img(:src="img.url" :alt="img.name" :title="img.name")
      div(:title="img.name" @click="handlePreview(img)").img-hit-cover
        a-icon(type="eye")
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
// import addWaterMarker from '@/utils/addWaterMarker';
export default {
  props: {
    files: Array,
    useCenterApi: Boolean,
    small: Boolean,
    // waterMarkers: Array,
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
          url: item.path,
          status: 'done',
          ...item,
        };
      });
      return files || [];
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

      this.previewUrl = file.url || file.preview;
      this.previewFileName = file.name;
      if (!/(jpg|jpeg|png|mp4)/gi.test(file.type)) {
        this.previewUrl = '/office-preview/index.html?file=' + file.url;
      }
      // 加水印
      // if (this.waterMarkers && this.waterMarkers.length) {
      //   this.previewUrl = await addWaterMarker(
      //     this.previewUrl,
      //     this.waterMarkers,
      //   );
      // }
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

    &.small {
      width: 46px;
      height: 46px;
      padding: 1px;
      margin: 0 4px 4px 0;
    }

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
