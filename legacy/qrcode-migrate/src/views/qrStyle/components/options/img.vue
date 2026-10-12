<template>
  <a-form>
    <a-form-item label="宽度">
      <a-input type="number" v-model:value="formData.component.width" @change="changeNumberValue('width')"></a-input>
    </a-form-item>
    <a-form-item label="高度">
      <a-input type="number" v-model:value="formData.component.height" @change="changeNumberValue('height')"></a-input>
    </a-form-item>
    <a-form-item label="x位置">
      <a-input type="number" v-model:value="formData.component.left" @change="changeNumberValue('left')"></a-input>
    </a-form-item>
    <a-form-item label="y位置">
      <a-input type="number" v-model:value="formData.component.top" @change="changeNumberValue('top')"></a-input>
    </a-form-item>
    <a-form-item label="图片">
      <el-g-upload @onChangeFile="changeFile" :file="fileList" :sceneCode="GLOBAL_SCENE_CODE.qrCodeBackground"></el-g-upload>
    </a-form-item>
  </a-form>
</template>

<script>
import { defineComponent, ref, watch } from "vue";
import elGUpload from "./el-g-upload.vue"
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export default defineComponent({
  components: { elGUpload },
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  setup(props, { emit }) {
    const formData = ref(props.value);
    const fileList = ref([]);
    if (formData.value.url) {
      fileList.value = [{ name: "", url: formData.value.url }]
    }
    watch(() => props.value, (val) => {
      formData.value = val
      if (formData.value.url) {
        fileList.value = [{ name: "", url: formData.value.url }]
      } else {
        fileList.value = []
      }
    })
    const changeNumberValue = (key) => {
      formData.value.component[key] = Number(formData.value.component[key]);
    }
    const changeFile = (data) => {
      if (data.length) {
        formData.value.url = data[0].url;
        formData.value.imgId = data[0].id;
      } else {
        formData.value.url = "";
        formData.value.imgId = "";
      }
      emit("update:value", formData.value)
    }
    return {
      formData,
      changeFile,
      changeNumberValue,
      fileList,
      GLOBAL_SCENE_CODE
    }
  }
})
</script>

<style lang="less" scoped></style>