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
    a-button(type="link" v-if="listType==='text'&& fileList.length<max") 上传 
    template(v-if="listType==='picture-card'&&fileList.length<max")
      PlusOutlined
      div(class="ant-upload-text") 上传
</template>

<script lang='jsx'>
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
} from "vue";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons-vue";
import { useStore } from "vuex";
import { CubeFileService, GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
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
  },
  setup(props, { emit }) {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const fileList = ref(props.file || []);
    const state = reactive({
      headers: {
        Authorization:
          "Bearer " + JSON.parse(sessionStorage.getItem("token")).access_token,
        tenant: 0,
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
      if (!isJpgOrPng) {
        proxy.$message.error("只能上传" + props.accept + "文件!");
      }

      const isLt2M = file.size / 1024 / 1024 < props.size;

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
        const res = await proxy.$api.deleteFileRemove(
          file.id ? file.id : file.response.data.id
        );
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
      // const formData = new FormData();
      // formData.append("file", file.file);
      // formData.append("tenant", 0);
      // formData.append("businessKey", props.businessKey);
      const params = {
        file: file.file,
        tenant: 0,
        businessKey: props.businessKey,
        sceneCode: GLOBAL_SCENE_CODE.ouaaAppVersion
      }
      file.onProgress();
      const authInfo = {
        token: JSON.parse(sessionStorage.getItem("token")).access_token,
        tenant: JSON.parse(sessionStorage.getItem("tenant")).code,
        terminal: 'kh-admin-web',
      }
      const cubeFileService = new CubeFileService(authInfo);
      const data = await cubeFileService.uploadFile(params);
      state.fileReturnIds.push(data.id);
      file.onSuccess({ data: data }, file);
    };

    //预览
    const previewFile = (file) => {
      if (file.response) {
        window.open(file.response.data.path);
      }
    };
    onMounted(() => {
      fileList.value = props.file;
    });
    watch(
      () => props.file,
      () => {
        fileList.value = props.file;
      }
    );
    return {
      ...toRefs(state),
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
