<template>
  <div class="table-layout" ref="table_layout_ref">
    <div class="layout-header">
      <div class="header-name">
        <g-vertical-line title="工作安排"></g-vertical-line>
      </div>
      <Form style="margin-top: 10px" :model="modalForm" :rules="modalFormRules" ref="modalFormRef"
        :label-col="{ style: { width: '80px' } }">
        <FormItem label="名称" name="title">
          <Input v-model:value="modalForm.title" :maxlength="20" v-if="type === 'add'" />
          <div v-else>{{ info.title }}</div>
        </FormItem>
        <FormItem label="类型" name="type">
          <Select v-model:value="modalForm.type" :options="options" v-if="type === 'add'" />
          <div v-else>{{ info.typeName }}</div>
        </FormItem>
        <FormItem label="内容">
          <Textarea v-model:value="modalForm.content" v-if="type === 'add'" />
          <div v-else>{{ info.content }}</div>
        </FormItem>
        <FormItem label="图片">
          <FileUpload  
            v-if="type === 'add'"
            :sceneCode='GLOBAL_SCENE_CODE.workPlan' 
            accept=".jpeg,.jpg,.png"
            type="picture-card"
            v-model:value="fileList"
            buttonText="新增"
            customText=' '
            :multiple="true"
            :maxCount="9"
          />
          <div style="display: flex; margin-left: 10px" v-else>
            <div v-for="item in info.fileList">
              <Image :src="item.path" style="width: 100px; height: 100px"></Image>
            </div>
          </div>
        </FormItem>
      </Form>
    </div>
    <Modal v-model:visible.sync="previewVisible" title="图片" :footer="null">
      <img style="width: 100%" :src="previewImage" />
    </Modal>

    <div class="content-page">
      <Button v-if="type === 'add'" type="primary" @click="save" :loading="loading">保存并公布</Button>
      <Button style="margin-right: 10px" v-if="type !== 'add' && hasPermission(permission.delete)" type="primary" danger @click="deleteHandle">删除</Button>
      <Button style="margin-right: 10px" @click="returnTo">返回</Button>
    </div>
  </div>
</template>
<script setup lang="ts">
import gVerticalLine from "../../components/common/gVerticalLine.vue";
import { Modal, message } from "ant-design-vue";
import { onMounted, reactive, ref } from "vue";
import { addArrange, getArrangeInfo, getArrangeTypeList, deleteArrange } from "../../api/work-report/index";
import { useRoute } from "vue-router";
import { appFunctionCodes } from '../../permission/index'
import { hasPermission } from '@ghcloud/cube-permission-codes'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { FileUpload } from "@ghcloud/cube-app-design"

const permission = appFunctionCodes.workReportArrange
const modalFormRules: Record<string, any[]> = {
  title: [{ required: true, message: "请输入名称", trigger: "blur" }],
  type: [{ required: true, message: "请输入类型", trigger: "blur" }],
};
const { type, id } = useRoute().query;
const previewVisible = ref(false);
const previewImage = ref("");
const options = ref([]);
const modalFormRef = ref();
const fileList = ref();
const modalForm = reactive<any>({
  title: "",
  type: "",
  content: "",
  fileIds: "",
});
const loading = ref(false);
const save = async () => {
  try {
    loading.value = true;
    await modalFormRef.value?.validateFields();
    modalForm.fileIds = fileList.value?.map((item: {id:string} ) => item.id).join(",");
    await addArrange(modalForm);
    returnTo();
  } catch {
    message.error("保存失败");
  } finally {
    loading.value = false;
  }
};
const returnTo = () => {
  history.back();
};
function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

const info = ref<any>({});
onMounted(async () => {
  const data = await getArrangeTypeList({ status: true });
  options.value = data.map((item: { name: string; id: string }) => ({
    label: item.name,
    value: item.id,
  }));

  if (type === "edit") {
    const data = await getArrangeInfo(id as string);
    info.value = data;
  }
});

const deleteHandle = async () => {
  Modal.confirm({
    title: "提示",
    content: "确定要删除该工作安排？",
    onOk: async () => {
      deleteArrange(id as string).then(res => {
        message.success("删除成功")
        history.back();
      }).catch((error) =>{
        message.error('删除失败')
      })
    },
  });
};

</script>
<style lang="less" scoped>
.table-layout {
  padding: 0 10px;

  .layout-header {
    .header-name {
      padding: 14px 0;
      border-bottom: 1px solid #f3f3f3;
      display: flex;
      justify-content: space-between;
    }

    .header-control {
      padding: 10px 0;
      display: flex;
      justify-content: space-between;
    }
  }
}

:deep(.ant-modal-body) {
  padding: 16px 24px 0 !important;
}

.layout-content {
  :deep(.ant-btn) {
    padding: 0 15px;
    line-height: 20px;
    height: 20px;
  }
}

.content-page {
  margin-top: 10px;
  display: flex;

  flex-direction: row-reverse;
}

//</style>
