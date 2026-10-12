<template>
  <div ref="modal" class="custom-modal">
    <a-upload
      :accept="accept"
      :before-upload="beforeUpload"
      :list-type="listType"
      :custom-request="customRequest"
      :headers="headers"
      :file-list="fileList"
      @change="handleChange"
      @preview="previewFile"
      :remove="removeFile"
    >
      <a-button type="link" v-if="listType === 'text' && fileList.length < max">上传</a-button>
      <template v-if="listType === 'picture-card' && fileList.length < max">
        <PlusOutlined />
        <div class="ant-upload-text">上传</div>
      </template>
    </a-upload>
    <a-modal :getContainer="() => $refs.modal" :visible="previewVisible" title="预览图片" :footer="null" @cancel="previewVisible = false">
      <img alt="preview" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>
<script>
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons-vue";
import { file } from "jszip";
import { defineComponent, getCurrentInstance, onMounted, reactive, ref, toRefs, watch } from "vue";
import { useStore } from "vuex";
export default defineComponent({
  components: {
    LoadingOutlined,
    PlusOutlined,
  },
  props: {
    // 上传个数
    max: {
      type: Number,
      default: 1,
    },
    // 默认列表
    file: {
      type: Array,
      default: () => [],
    },
    sceneCode: {
      type: String,
      default: "",
    },
    // 上传文件类型
    accept: {
      type: String,
      default: ".jpg,.jpeg,.png,.svg",
    },
    // 内建样式
    listType: {
      type: String,
      default: "picture-card",
    },
    value: {
      type: String,
      default: "",
    },
    //文件服务地址
    businessKey: {
      type: String,
      default: "mdata",
    },
    size: {
      type: [Number, String],
      default: 2,
    },
    watermark: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const modal = ref();
    const { proxy } = getCurrentInstance();
    const fileList = ref(props.file || []);
    const state = reactive({
      previewVisible: false,
      previewImage: "",
      headers: {
        Authorization: "Bearer " + JSON.parse(sessionStorage.getItem("GH-Token")).access_token,
        tenant: JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code,
        terminal: window.config.terminal,
      },
      fileReturnIds: [],
    });
    /*上传验证*/
    const beforeUpload = (file) => {
      const accepts = props.accept.split(",");
      let isJpgOrPng = false;
      accepts.forEach((item) => {
        if (file.name.indexOf(item) > -1) {
          const name = file.name.split(item);
          if (name.length === 2 && name[1] === "") {
            isJpgOrPng = true;
          }
        }
      });
      if (!isJpgOrPng && props.accept) {
        proxy.$message.error("只能上传" + props.accept + "文件!");
      } else if (!props.accept) {
        isJpgOrPng = true;
      }

      // const isLt2M = file.size / 1024 / 1024 < props.size;
      const isLt2M = true; //放开大小限制

      if (!isLt2M) {
        proxy.$message.error(`文件必须小于${props.size}MB!`);
      }
      return isLt2M && isJpgOrPng;
    };
    //选择文件
    const handleChange = (info) => {
      if (info.file.status) {
        let resFileList = [...info.fileList];
        resFileList = resFileList.map((file) => {
          if (file.response) {
            file.url = file.response.data.path;
          }
          return file;
        });
        fileList.value = resFileList;
        let fileId = [];
        fileList.value.forEach((item) => {
          if (item.response && item.response.data && item.status === "done") {
            fileId.push(item.response.data.id);
          } else if (state.fileReturnIds.length) {
            fileId = state.fileReturnIds;
          }
        });
        if (info.file.status === "done" || info.file.status === "removed") {
          if (Array.isArray(fileId)) {
            emit("update:value", fileId.join(","));
            emit("changeFile", fileId, "");
          }
        }
      }
    };
    //删除文件
    const removeFile = async (file) => {
      if ((file.response && file.response.data.id) || file.id) {
        const res = await proxy.$api.deleteFileRemove(file.id ? file.id : file.response.data.id);
        if (res === "OK") {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    };

    const customRequest = async (file) => {
      const formData = new FormData();
      formData.append("file", file.file);
      formData.append("tenant", JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code);
      formData.append("businessKey", props.businessKey);
      formData.append("watermark", props.watermark);
      window?.config?.feature?.useUploadTemporary && formData.append("sceneCode", props.sceneCode);
      file.onProgress();
      const data = await proxy.$api.uploadFile(formData, "post");
      state.fileReturnIds.push(data.id);
      file.onSuccess({ data: data }, file);
    };
    //预览
    const previewFile = (file) => {
      if (["image/png", "image/jpeg", "image/jpg", "image/gif", "image/bmp", "image/webp"].includes(file.type)) {
        state.previewImage = file.url;
        state.previewVisible = true;
        return;
      }
      if (file.response) {
        if (file.response.data.path.indexOf(".txt") > -1) {
          window.open(file.response.data.path + "?response-content-type=application/octet-stream");
        } else {
          // file.response.data.path.indexOf('.')

          window.open(file.response.data.path);
        }
      } else if (file.url) {
        if (file.url.indexOf(".txt") > -1) {
          window.open(file.url + "?response-content-type=application/octet-stream");
        } else {
          window.open(file.url);
        }
      }
    };
    onMounted(() => {
      fileList.value = props.file;
    });
    watch(
      () => props.file,
      () => {
        console.log(props.file);
        fileList.value = props.file ? props.file.filter((item) => item !== null) : [];
      },
    );
    return {
      ...toRefs(state),
      modal,
      customRequest,
      beforeUpload,
      handleChange,
      removeFile,
      previewFile,
      fileList,
    };
  },
});
</script>
<style scoped lang="less">
.custom-modal {
  :deep(.ant-modal) {
    background: rgba(4, 14, 38, 0.96);
  }

  :deep(.ant-modal-content) {
    background: rgba(4, 14, 38, 0.96);

    .ant-modal-close {
      color: #fff;
    }
  }

  :deep(.ant-modal-header) {
    background: rgba(4, 14, 38, 0.96);
    border-bottom: 1px solid #1c3d7a;

    .ant-modal-title {
      color: #fff;
    }
  }
}
</style>
