<template>
  <Modal 
    v-model:visible="importVisible" 
    title="批量导入" 
    width="30vw" 
    ok-text="导入" 
    @cancel="cancelImport" 
    :afterClose="cancelImport">
    <div class="import">
      <p class="describe">注意：导入仅支持数据采集方式是人工录入的能源分类。</p>
      <div class="item">
        <div>1、导入前请先下载模板</div>
        <a class="operate" @click="downTemp">分类报表模板.xlsx</a>
      </div>
      <div class="item">
        <div>2、按模板填写再上传</div>
        <div class="operate">
          <Upload :file-list="fileList" :remove="handleRemove" :before-upload="beforeUpload" accept=".xlsx,.xls">
            <Button type="primary">
              点击上传
            </Button>
          </Upload>
        </div>
      </div>
    </div>
    <template #footer>
      <Button key="back" @click="()=>{importVisible=false;emit('close',false)}">取消</Button>
      <Button key="submit" type="primary" @click="handleImport()" :disabled="fileList.length===0">导入</Button>
    </template>
  </Modal>
</template>
<script setup lang="ts">
import { Modal } from 'ant-design-vue';
import { ref,watch } from 'vue'
import type { UploadFile } from 'ant-design-vue/es'
import { classifyimport, templateExport } from '@/api/energyOverview';
interface Props {
  visible: boolean;
  activeKey:string;
}
const props = withDefaults(defineProps<Props>(), {
  visible: false,
  activeKey:'classify'
})
const emit = defineEmits(['close'])
const importVisible=ref(false)
//下载模板
const downTemp=async()=>{
  await templateExport().then(res => {
      const { data } = res
      const link = document.createElement('a')
      const blob = new Blob([data as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      link.style.display = 'none'
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', '分类报表模板.xlsx')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
  })
}
const fileList = ref<UploadFile[]>([]);
const handleRemove=(file: UploadFile) => {
  const index = fileList.value.indexOf(file);
  const newFileList = fileList.value.slice();
  newFileList.splice(index, 1);
  fileList.value = newFileList;
};
const beforeUpload= (file: UploadFile) => {
  fileList.value = [...fileList.value, file];
  return false;
};
//导入
const handleImport=async()=>{
  if(fileList.value.length>0){
  const formData = new FormData();
  formData.append("file",fileList.value[0])
    await classifyimport(formData)
  }
  emit('close',false)
  
  importVisible.value=false
  fileList.value=[]
}
const cancelImport=()=>{
  fileList.value =[]
  importVisible.value=false;
  emit('close',false)
}
watch(()=>props.visible,()=>{
  importVisible.value=props.visible
  },{immediate:true,deep:true}
)
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
.table{
  margin-top: 20px;
}
.pagination{
  margin-top: 10px;
  float: right;
}
</style>