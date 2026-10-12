<template>
<a-upload
    :accept="accept"
    :before-upload="beforeUpload"
    :list-type="listType"
    :customRequest="customRequest"
    :headers="headers"
    :file-list="fileList"
    @change="handleChange"
    @preview="previewFile"
    :remove="removeFile"
>
  <a-button type="link" v-if="listType==='text'&& fileList.length<max">上传</a-button>
  <template v-if="listType==='picture-card'&&fileList.length<max">
    <PlusOutlined></PlusOutlined>
    <div class="ant-upload-text">上传</div>
  </template>
</a-upload>
</template>

<script>
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
import {getToken, getNowEnterprise } from '@/utils/auth'

export default defineComponent({
  name:'gUpload',
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
          "Bearer " + getToken().access_token,
        tenant: getNowEnterprise().code,
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
      return true;
    };

    const customRequest = async (file) => {
      const formData = new FormData();
      formData.append("file", file.file);
      formData.append(
        "tenant",
        JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code
      );
      formData.append("businessKey", props.businessKey);
      file.onProgress();
      const data = await proxy.$api.uploadFile(formData,"post");
      state.fileReturnIds.push(data.id);
      file.onSuccess({ data: data }, file);
    };

    //预览
    const previewFile =async (file) => {
      try {
        message.loading('开始下载')
        let downloadURL = ''
        if (file.response) {
          downloadURL = file.response.data.path
        } else if (file.url) {
          downloadURL = file.url
        }
        await fetch(downloadURL).then(async (res) =>
          res.blob().then((blob) => {
            const a = document.createElement('a')
            const url = window.URL.createObjectURL(blob)
            a.href = url
            a.download = file.name
            a.click()
            window.URL.revokeObjectURL(url)
          })
        )
        message.destroy()
        message.success('下载成功')
      } catch (error) {
        message.destroy()
      }
    };
    onMounted(() => {
      fileList.value = props.file;
    });
    watch(
      () => props.file,
      () => {
        fileList.value = props.file
          ? props.file.filter((item) => item !== null)
          : [];
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
