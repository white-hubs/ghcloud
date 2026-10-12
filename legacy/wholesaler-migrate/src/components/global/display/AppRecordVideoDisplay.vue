<template lang="pug">
  div.files-display(v-if="file")
    div.file-box()
      div.file-name.ellipsis(:title="file.name") {{ file.name }} 
      div.file-prview-hit.ml2(title="预览" @click="handlePreview(file)")
        a-icon(type="eye")
    a-modal(:visible="previewVisible" :footer="null" @cancel="handleCancel")
      H5sRecord(:ip="ip" :token="token" :fileName="fileName" autoplay v-if="previewVisible && ip")
      //- playBack(:ip="ip" :token="token" :fileName="fileName" autoplay v-if="previewVisible && ip")
</template>

<script>
import H5sRecord from '@/components/Monitor/H5sRecord.vue';
// import playBack from '@/components/PlayBack/playBack.vue';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: {
    H5sRecord,
    // playBack
  },
  props: {
    file: Object,
    token: String,
  },
  data() {
    return {
      previewVisible: false,
      ip: null,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    fileName() {
      const fileUrl = this.file.url;
      const slices = fileUrl.split('/').reverse();
      return slices[0];
    },
  },
  created() {
    this.getStreamconfig();
  },
  methods: {
    handleCancel() {
      this.previewVisible = false;
    },
    // 获取流媒体视频地址
    async getStreamconfig() {
      const data = await this.$restful('GET:/project-merchant/streamconfig', {
        projectId: this.project.id,
      });
      this.ip = data.host + ':' + data.port;
    },
    async handlePreview() {
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
