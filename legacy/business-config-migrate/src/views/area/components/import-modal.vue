<template>
  <a-modal centered v-model:visible="showImportModal" title="导入区域" @ok="handleOk" :importLoading="importLoading" width="800px">
    <div class="step-form-title">
      <a-steps size="small" :current="currentStep">
        <a-step title="上次数据"></a-step>
        <a-step title="导入结果"></a-step>
      </a-steps>
    </div>
    <div class="step-form" v-if="currentStep === 0">
      <p style="margin: 20px 0 10px 0">
        下载
        <a-button type="link" style="padding: 0; margin: 0" @click="exportTemplate">区域模版</a-button
        >，按格式完善模版中的信息后，点击下方选择进行上传。
      </p>
      <div>
        <a-upload-dragger
          v-model:fileList="areaExcelFiles"
          name="file"
          :multiple="false"
          :customRequest="customRequest"
          accept=".xls,.xlsx"
          list-type="picture"
        >
          <a-button type="link"><InboxOutlined style="font-size: 36px" /></a-button>
          <p style="margin: 10px 0">单击或拖动文件到此区域进行上传，支持扩展名：.xls .xlsx</p>
        </a-upload-dragger>
      </div>
      <span class="placeholder">支持上传（.xls/.xlsx）文件</span>
    </div>
    <div class="step-form importFeedback" v-else>
      <div class="importFeedback_title" style="margin-bottom: 15px; text-align: center">
        <span>导入结果如下：</span>
        <span
          >导入成功共计<span style="color: #389e0d; margin: 0 3px; font-size: 14px">{{ importData.success || 0 }}</span
          >条，失败<span style="color: #cf1322; margin: 0 3px; font-size: 14px">{{ importData.fail || 0 }}</span
          >条</span
        >
      </div>
      <a-table
        :columns="tableInfo.failColumns"
        :dataSource="tableInfo.failTableData"
        :pagination="false"
        size="small"
        :scroll="{ y: 500 }"
      />
    </div>
    <template #footer>
      <a-button key="back" @click="showImportModal = false">取消</a-button>
      <a-button key="submit" type="primary" v-if="currentStep === 0" :loading="importLoading" @click="handelImport">下一步</a-button>
      <a-button type="primary" v-else :loading="importLoading" @click="showImportModal = false">确定</a-button>
    </template>
  </a-modal>
</template>

<script lang="jsx">
import { DownOutlined, InboxOutlined } from "@ant-design/icons-vue";
import { tableColumns, flattenTree } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/utils/common.js";
import { defineComponent, getCurrentInstance, onMounted, reactive, ref } from "vue";

import { cubeOuaaService } from "@/api/service";
import { cubeMdataService } from "@/api/service";
export default defineComponent({
  components: {
    DownOutlined,
    InboxOutlined,
  },
  setup(props, { emit, expose }) {
    const { proxy } = getCurrentInstance();
    const currentStep = ref(0);
    const showImportModal = ref(false);
    const importLoading = ref(false);
    const areaExcel = ref(null);
    const areaExcelFiles = ref([]);
    const importData = reactive({
      success: "",
      fail: "",
    });
    const tableInfo = reactive({
      failColumns: [
        {
          title: "导入详情",
          dataIndex: "details",
          align: "center",
          width: 200,
          customRender: ({ text }) => {
            return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
          },
        },
        {
          title: "状态",
          dataIndex: "state",
          align: "center",
          width: 50,
          customRender: () => {
            return <PopOver content="失败">失败</PopOver>;
          },
        },
      ],
      failTableData: [],
    });
    const openImportModal = () => {
      showImportModal.value = true;
      currentStep.value = 0;
      areaExcelFiles.value = [];
      areaExcel.value = null;
    };
    const exportTemplate = async () => {
      const res = await cubeMdataService.exportAreaTemplate();
      if (res) {
        const link = document.createElement("a");
        const blob = new Blob([res], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "区域模版.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
    const customRequest = async (data) => {
      if (data.file.size / 1024 > 1024 * 300) {
        proxy.$message.warn("附件上传大小不能超过300MB");
        return;
      }
      data.file.status = "done";
      areaExcel.value = data.file;
      areaExcelFiles.value = [data.file];
    };
    const handelImport = async () => {
      if (!areaExcel.value || areaExcelFiles.value.length === 0) {
        proxy.$message.warn("请先上传文件");
        return;
      }
      importLoading.value = true;
      try {
        const params = {
          file: areaExcel.value,
        };
        const res = await cubeMdataService.importArea(params);
        if (res) {
          currentStep.value++;
          Object.assign(importData, res);
          tableInfo.failTableData = [];
          tableInfo.failTableData = res.errorMsg.map((item) => {
            return {
              details: item,
            };
          });
        }
      } catch (error) {
        proxy.$message.error(error?.errorMessage ?? "操作失败");
      } finally {
        importLoading.value = false;
        emit("enter");
      }
    };
    expose({
      openImportModal,
    });
    return {
      showImportModal,
      currentStep,
      importLoading,
      areaExcel,
      areaExcelFiles,
      importData,
      tableInfo,
      openImportModal,
      handelImport,
      exportTemplate,
      customRequest,
    };
  },
});
</script>
<style scoped lang="less">
.step-form-title {
  width: 90%;
  margin: 0 auto;
  margin-bottom: 20px;
  font-size: 12px;
}
.step-form {
  width: 90%;
  margin: 0 auto;
  margin-bottom: 20px;
  min-height: 300px;
}
.step-form-table {
  width: 94%;
  margin: 0 auto;
  margin-bottom: 20px;
  min-height: 300px;
}
.placeholder {
  margin-top: 10px;
  color: rgb(202, 202, 202);
  display: block;
}
.ant-upload-list-picture .ant-upload-list-item-progress,
:deep(.ant-upload-list-item-progress) {
  display: none;
}
.ant-upload-list-picture .ant-upload-list-item-uploading .ant-upload-list-item-name,
:deep(.ant-upload-list-picture .ant-upload-list-item-uploading .ant-upload-list-item-name) {
  line-height: 44px;
}
</style>
