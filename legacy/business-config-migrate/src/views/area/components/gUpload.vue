<template lang="pug">
a-upload(
  :accept="accept"
  :before-upload="beforeUpload"
  :list-type="listType"
  :customRequest="customRequest"
  :headers="headers"
  :file-list="fileList"
  @change="handleChange"
  @preview="previewFile"
  :remove="removeFile"
)   
  a-button(type="link" v-if="listType==='text'&& fileList.length<max && !disabled") 上传 
  template(v-if="listType==='picture-card'&&fileList.length<max && !disabled")
    PlusOutlined
    div(class="ant-upload-text") 上传
  template(v-if="fileList.length===0 && disabled")
    a-empty
a-image(
  v-if="previewImage"
  :src="previewImage"
  :alt="previewTitle"
  :wrapper-style="{ display: 'none' }"
  :preview="{ visible: previewVisible, onVisibleChange: handlePreviewVisibleChange }"
)
</template>

<script>
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons-vue";
import { Image as AImage, message } from "ant-design-vue";
import { defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref, shallowRef, toRefs, watch } from "vue";

import { CubeFileService } from "@ghcloud/cube-file-service";

export default defineComponent({
  components: {
    AImage,
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
    disabled: {
      type: Boolean,
      default: false,
    },
    sceneCode: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const getFileUrl = (file) => file.response?.data?.path || file.url || file.path || "";
    const normalizeFile = (file) => ({
      ...file,
      uid: String(file.uid ?? file.id ?? file.response?.data?.id ?? ""),
      status: file.status || "done",
      url: getFileUrl(file),
    });
    const fileList = ref((props.file || []).filter(Boolean).map(normalizeFile));
    const previewVisible = shallowRef(false);
    const previewImage = shallowRef("");
    const previewTitle = shallowRef("");
    let previewObjectUrl = "";
    let disposed = false;
    const releasePreviewUrl = () => {
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
        previewObjectUrl = "";
      }
    };
    const handlePreviewVisibleChange = (visible) => {
      previewVisible.value = visible;
      if (!visible) {
        previewImage.value = "";
        releasePreviewUrl();
      }
    };
    const state = reactive({
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
        fileList.value = info.fileList.map(normalizeFile);
        if (info.file.status === "done" || info.file.status === "removed") {
          let fileId = [];
          fileList.value.forEach((item) => {
            if (item.status === "done") {
              let id = "";
              if (item.response && item.response.data) {
                id = item.response.data.id;
              } else {
                id = item.uid;
              }
              fileId.push(id);
            } else if (state.fileReturnIds.length) {
              fileId = state.fileReturnIds;
            }
          });
          if (Array.isArray(fileId)) {
            emit("update:value", fileId.join(","));
            emit("changeFile", fileId, "");
          }
        }
      }
    };
    //删除文件
    const removeFile = async (file) => {
      return true;
    };

    const customRequest = async (file) => {
      const formData = new FormData();
      formData.append("file", file.file);
      formData.append("tenant", JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code);
      formData.append("businessKey", props.businessKey);
      file.onProgress();
      const authInfo = {
        token: JSON.parse(sessionStorage.getItem("GH-Token")).access_token,
        tenant: JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code,
        terminal: "bimops-manage-web",
      };
      const cubeFileService = new CubeFileService(authInfo);
      try {
        const data = await cubeFileService.uploadFile({
          file: file.file,
          businessKey: props.businessKey,
          sceneCode: props.sceneCode ?? "",
        });
        state.fileReturnIds.push(data.id);
        file.onSuccess({ data: data }, file);
      } catch (error) {
        message.error("上传失败");
      }
    };

    //预览
    const previewFile = async (file) => {
      const fileUrl = getFileUrl(file);
      if (props.listType === "picture-card") {
        releasePreviewUrl();
        let imageUrl = fileUrl;
        if (!imageUrl && file.originFileObj instanceof Blob) {
          previewObjectUrl = URL.createObjectURL(file.originFileObj);
          imageUrl = previewObjectUrl;
        }
        if (!imageUrl) {
          message.error("图片地址不存在，无法预览");
          return;
        }
        previewImage.value = imageUrl;
        previewTitle.value = file.name || "区域图片";
        previewVisible.value = true;
        return;
      }
      if (!fileUrl) {
        message.error("附件地址不存在，无法下载");
        return;
      }
      const closeLoading = message.loading("开始下载", 0);
      let downloadObjectUrl = "";
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("下载失败");
        downloadObjectUrl = URL.createObjectURL(await response.blob());
        const link = document.createElement("a");
        link.href = downloadObjectUrl;
        link.download = file.name;
        link.click();
        message.success("下载成功");
      } catch (error) {
        message.error("下载失败");
      } finally {
        closeLoading();
        if (downloadObjectUrl) URL.revokeObjectURL(downloadObjectUrl);
      }
    };
    // id回显
    const getFileById = async () => {
      const id = props.value;
      if (!id || (fileList.value.length && fileList.value.every((file) => file.url))) return;
      const initialFiles = fileList.value;
      const ids = id?.split(",");
      if (".jpg,.jpeg,.png,.svg".includes(props.accept)) {
        const authInfo = {
          token: JSON.parse(sessionStorage.getItem("GH-Token")).access_token,
          tenant: JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code,
          terminal: "bimops-manage-web",
        };
        const cubeFileService = new CubeFileService(authInfo);
        try {
          if (ids && ids.length > 0) {
            const fileListData = await Promise.all(
              ids.filter(Boolean).map(async (fileId) => normalizeFile(await cubeFileService.getFileInfo(fileId))),
            );
            if (!disposed && props.value === id && fileList.value === initialFiles) {
              fileList.value = fileListData;
            }
          }
        } catch (error) {
          if (!disposed && props.value === id && fileList.value === initialFiles) {
            message.error(error.toJSON?.()?.errorMessage || "附件加载失败");
          }
        }
      }
    };
    onMounted(() => {
      getFileById();
    });
    watch(
      () => props.file,
      () => {
        fileList.value = (props.file || []).filter(Boolean).map(normalizeFile);
      },
    );
    onBeforeUnmount(() => {
      disposed = true;
      releasePreviewUrl();
    });
    return {
      ...toRefs(state),
      customRequest,
      beforeUpload,
      handleChange,
      removeFile,
      previewFile,
      previewVisible,
      previewImage,
      previewTitle,
      handlePreviewVisibleChange,
      fileList,
    };
  },
});
</script>
