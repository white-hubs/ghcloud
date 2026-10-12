<template lang="pug">
//- @change="handleChange"
a-upload(
    :accept="accept"
    :before-upload="beforeUpload"
    :list-type="listType"
    :customRequest="customRequest"
    :headers="headers"
    :file-list="fileList"
    
    :remove="removeFile"
)   
    a-button(type="link" v-if="listType==='text'&& fileList.length<max") 上传 
    template(v-if="listType==='picture-card'&&fileList.length<max")
      PlusOutlined
      div(class="ant-upload-text") 上传
</template>

<script lang="jsx">
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
import { file } from "jszip";
import { replaceObjectKeys } from "@pansy/utils";
import {getToken, getNowEnterprise } from '@/utils/auth'

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
    // //选择文件
    // const handleChange = (info) => {
    //   if (info.file.status) {
    //     let resFileList = [...info.fileList];
    //     resFileList = resFileList.map((file) => {
    //       if (file.response) {
    //         file.url = file.response.data.path;
    //       }
    //       return file;
    //     });
    //     fileList.value = resFileList;
    //     let fileId = [];
    //     fileList.value.forEach((item) => {
    //       if (item.response && item.response.data && item.status === "done") {
    //         fileId.push(item.response.data.id);
    //       } else if (state.fileReturnIds.length) {
    //         fileId = state.fileReturnIds;
    //       }
    //     });
    //     if (info.file.status === "done" || info.file.status === "removed") {
    //       if (Array.isArray(fileId)) {
    //         emit("update:value", fileId.join(","));
    //         emit("changeFile", fileId, "");
    //       }
    //     }
    //   }
    // };
    //删除文件
    const removeFile = async (file) => {
      if ((file.response && file.response.data.id) || file.id) {
        const res = await proxy.$api.deleteFileRemove(
          file.id ? file.id : file.response.data.id
        );
        // 删除id
        state.fileReturnIds = await state.fileReturnIds.filter(
          (item) => item !== file.id
        );
        // 重新获取当前文件
        getFileList(state.fileReturnIds);
        // 更新值
        // emit("update:value", state.fileReturnIds.join(","));
        // emit("changeFile", state.fileReturnIds, "");
        if (res === "OK") {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    };
    // 自定义上传
    const customRequest = async (file) => {
      const formData = new FormData();
      formData.append("file", file.file);
      formData.append(
        "tenant",
        JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code
      );
      formData.append("businessKey", props.businessKey);
      file.onProgress();
      const data = await proxy.$api.uploadFile(formData, "post");
      state.fileReturnIds.push(data.id);
      // 上传成功--更新value或fileId
      await emit("update:value", state.fileReturnIds.join(","));
      await emit("changeFile", state.fileReturnIds, "");
      // 更新fileList.value
      // 没有绑定文件id--更新fileList
      if (!props.value) {
        getFileList(state.fileReturnIds);
      }
      file.onSuccess();
    };
    // 查询文件
    const getFileList = async (params) => {
      let ids;
      if (typeof ids === "string") {
        ids = params.split(",");
      } else {
        ids = params;
      }
      const data = ids?.length
        ? await proxy.$api.FileIds({ ids: ids }, "get")
        : [];
      fileList.value = data?.length
        ? replaceObjectKeys(data, {
            path: "url",
            id: "id",
            businessKey: "businessKey",
            name: "name",
            refCount: "refCount",
            size: "size",
            suffix: "suffix",
            type: "type",
          })
        : [];
      state.fileReturnIds = data?.length ? data.map((item) => item.id) : [];
    };

    onMounted(() => {
      // fileList.value = props.file;
    });

    watch(
      () => props.file,
      () => {
        fileList.value = replaceObjectKeys(props.file, {
          path: "url",
          id: "id",
          businessKey: "businessKey",
          name: "name",
          refCount: "refCount",
          size: "size",
          suffix: "suffix",
          type: "type",
        });
        state.fileReturnIds = fileList.value.length
          ? fileList.value.map((item) => item.id)
          : [];
      }
    );

    watch(
      () => props.value,
      (n) => {
        getFileList(n);
      }
    );

    // watch(
    //   () => state.fileReturnIds,
    //   (n) => {
    //     emit("update:value", n.join(","));
    //     emit("changeFile", n, "");
    //   }
    // );

    return {
      ...toRefs(state),
      customRequest,
      beforeUpload,
      // handleChange,
      removeFile,
      fileList,
    };
  },
});
</script>
