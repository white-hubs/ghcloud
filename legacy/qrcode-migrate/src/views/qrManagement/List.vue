<template>
  <gTable title="二维码管理" :api="api" :btns="btns" :search="search" :columns="columns" editMode="page" :rowSelection="true"
    ref="refTable" :scrollX="1300" tableCode="QR_MANAGEMENT">
    <template #header-btns>
      <a-button type="primary" @click="batchDownLoad" :loading="codeLoading">批量下载</a-button>
    </template>
    <template #btn="{ record }">
      <a-button type="link" @click="previewStyle(record)">预览</a-button>
      <a-button type="link" @click="downLoad(record)">下载</a-button>
    </template>
  </gTable>
  <div v-if="visible" class="preview-modal-mask" @click.self="visible = false">
    <div class="preview-modal" :style="{ width: Number(activeRecord.width) * qrCodeScale + 48 + 'px' }">
      <div class="preview-modal-header">
        <span>二维码样式预览</span>
        <span class="preview-modal-close" @click="visible = false">×</span>
      </div>
      <div class="preview-modal-body">
        <preview ref="previewModal" :designConfig="activeRecord" type='preview'></preview>
      </div>
    </div>
  </div>
</template>
<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
} from "vue";
import preview from "../components/preview.vue";
import gTableRef from "../../components/Common/gTableRef.vue";
export default defineComponent({
  components: { preview, gTableRef },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const previewModal = ref(null);
    const refTable = ref(null);
    const activeRecord = ref(null);
    const codeLoading = ref(false)
    const state = reactive({
      api: {
        list: "getQrcodePage",
        deleteSingle: "deleteQrcode",
        delete: "batchDeleteQrcode",
        path: "/editQr",
      },
      btns: ["add", "edit", "deleteSingle", "delete"],
      search: [
        {
          label: "实体类型",
          value: "entityType",
          component: "gSelect",
          url: "getEntityType",
          field: { entityType: "value", typeName: "label" },
          placeholder: "请选择实体类型",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "二维码名称/绑定实体名称查询",
        },
      ],
      columns: [
        {
          title: "编号",
          dataIndex: "id",
          key: "id",
        },
        {
          title: "名称",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "绑定实体类型",
          dataIndex: "entityTypeName",
          key: "entityTypeName",
        },
        {
          title: "绑定实体名称",
          dataIndex: "entityName",
          key: "entityName",
        },
        {
          title: "二维码code",
          dataIndex: "code",
          key: "code",
        },
        {
          title: "操作",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
        },
      ],
      visible: false,
      qrCodeScale: 1
    });
    const saveBlob = (blob, fileName = "二维码.zip") => {
      const downloadBlob = blob instanceof Blob ? blob : new Blob([blob], { type: "application/zip" });
      const blobUrl = window.URL.createObjectURL(downloadBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    };

    const downloadQrcodeZip = async (qrcodeIds) => {
      const blob = await proxy.$api.downloadQrcodeBatch({ qrcodeIds });
      saveBlob(blob);
    };

    const downLoad = async record => {
      try {
        await downloadQrcodeZip([record.id]);
      } catch (error) {
        proxy.$message.error(error.errorMessage ?? '操作失败')
      }
    };

    const batchDownLoad = async () => {
      const selectedRows = refTable.value.selectedRows ?? [];
      if (selectedRows.length === 0) {
        proxy.$message.warn("请选择要下载的二维码")
        return;
      }
      try {
        codeLoading.value = true
        await downloadQrcodeZip(selectedRows.map(item => item.id));
      } catch (error) {
        proxy.$message.error(error.errorMessage ?? '操作失败')
      } finally {
        codeLoading.value = false
      }
    }
    const previewStyle = async record => {
      const data = await proxy.$api.previewQrcode({
        id: record.id,
        code: record.code,
        styleId: record.styleId,
      });
      const configJson = data?.configJson ?? data;
      activeRecord.value = typeof configJson === "string" ? JSON.parse(configJson) : configJson;
      state.qrCodeScale = activeRecord.value.width > 800 ? 800 / activeRecord.value.width : 1
      state.visible = true;
    };
    return {
      ...toRefs(state),
      previewModal,
      codeLoading,
      refTable,
      activeRecord,
      previewStyle,
      downLoad,
      batchDownLoad,
    };
  },
});
</script>

<style lang="less" scoped>
.preview-modal-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}
.preview-modal {
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  overflow: hidden;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
}
.preview-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  color: rgba(0, 0, 0, 0.85);
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid #f0f0f0;
}
.preview-modal-close {
  color: rgba(0, 0, 0, 0.45);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}
.preview-modal-body {
  max-height: calc(100vh - 105px);
  padding: 24px;
  overflow: auto;
}
:deep(.ant-table-column-title){
  .anticon-setting{
    margin-right: 14px;
  }
}
</style>
