<template>
  <div>
    <a-upload :accept="accept" :before-upload="beforeUpload" :list-type="listType" :customRequest="customRequest"
      :headers="headers" :file-list="fileList" :disabled="disabled||isLoading" @preview="handlePreview"
      :remove="removeFile">
      <a-button type="link" v-if="listType==='text'&& fileList.length<max && !disabled">上传</a-button>
      <template v-if="listType==='picture-card'&&fileList.length<max && !disabled">
        <LoadingOutlined v-if="LoadingOutlined"></LoadingOutlined>
        <PlusOutlined v-else></PlusOutlined>
        <div class="ant-upload-text">上传</div>
      </template>
    </a-upload>
    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>

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
import { getToken, getNowEnterprise } from '@/utils/auth'


export default defineComponent({
  name: 'gUpload',
  components: {
    LoadingOutlined,
    PlusOutlined,
  },
  props: {
    // 上传个数
    max: {
      type: Number,
      default: 3,
    },
    // 默认列表
    file: {
      type: Array,
      default: () => [],
    },
    // 上传文件类型
    accept: {
      type: String,
      default: ".jpg,.jpeg,.png,.svg,.pdf",
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
    disabled: {
      type: Boolean,
      default: false
    },
    //文件服务地址
    businessKey: {
      type: String,
      default: "mdata",
    },
    size: {
      type: [Number, String],
      default: 20,
    },
    sceneCode:{
      type: String,
      default: "",
    }
  },
  setup(props, { emit }) {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const fileList = ref([]);
    const state = reactive({
      headers: {
        Authorization:
          "Bearer " + getToken().access_token,
        tenant: getNowEnterprise().code,
        terminal: window.config.terminal,
      },
      fileReturnIds: [],
      previewVisible: false,
      isLoading: false,
      previewImage: ""
    });
    const handleCancel = () => {
      state.previewVisible = false;
    };
    const handlePreview = async (file) => {
      if (file.suffix === 'pdf') {
        window.open(file.url)
        return;
      }
      state.previewImage = file.url
      state.previewVisible = true;
    }
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
      if (state.isLoading) {
        return false
      }
      return isLt2M && isJpgOrPng;
    };
    //删除文件
    const removeFile = async (file) => {
      const fileListIndex = fileList.value.findIndex((item) => item.uuid === file.uuid);
      if (fileListIndex > -1) {
        fileList.value.splice(fileListIndex, 1);
        emit('update:value', fileList.value)
      }
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
      state.isLoading = true
      const data =props.sceneCode
      ? await proxy.$api.uploadFile({
          file: file.file,
          tenant: JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code,
          businessKey: props.businessKey,
          sceneCode: props.sceneCode ?? ''
        })
      :await proxy.$api.uploadFile(formData, "post")
      fileList.value.push({
        name: data.name,
        url: data.path,
        uuid: data.id,
        suffix: data.suffix,
        response: {
          data: data
        }
      })
      state.isLoading = false
      state.fileReturnIds.push(data.id);
      file.onSuccess({ data: data }, file);
    };

    //预览
    // const previewFile = async (file) => {
    //   try {
    //     message.loading('开始下载')
    //     let downloadURL = ''
    //     if (file.response) {
    //       downloadURL = file.response.data.path
    //     } else if (file.url) {
    //       downloadURL = file.url
    //     }
    //     await fetch(downloadURL).then(async (res) =>
    //       res.blob().then((blob) => {
    //         const a = document.createElement('a')
    //         const url = window.URL.createObjectURL(blob)
    //         a.href = url
    //         a.download = file.name
    //         a.click()
    //         window.URL.revokeObjectURL(url)
    //       })
    //     )
    //     message.destroy()
    //     message.success('下载成功')
    //   } catch (error) {
    //     message.destroy()
    //   }
    // };
    const handlePropsFile = async () => {
      if (!props.file) {
        fileList.value = []
        return
      }
      const ids = []
      if (Array.isArray(props.file)) {
        for (const item of props.file) {
          if (typeof item === 'string') {
            const result = await getFile(item)
            fileList.value.push({
              name: result.name,
              url: result.path,
              uuid: result.id,
              suffix: result.suffix,
              response: {
                data: result
              }
            })
          } else {
            fileList.value.push({
              name: item.name,
              url: item.path,
              uuid: item.id,
              suffix: item.suffix,
              response: {
                data: item
              }
            })
            ids.push(item.id)
          }
        }
        state.fileReturnIds = ids
      } else {
        const files = props.file.split(',').filter(item => item)
        for (const item of files) {
          fileList.value.push(item)
        }
      }
    }
    const getFile = async (id) => {
      const file = await proxy.$api.fileId(id, "get");
      return file
    }
    onMounted(() => {
      handlePropsFile()
    });
    watch(
      () => props.file,
      () => {
        handlePropsFile()
      }
    );
    return {
      ...toRefs(state),
      customRequest,
      beforeUpload,
      removeFile,
      handleCancel,
      handlePreview,
      fileList,
    };
  },
});
</script>