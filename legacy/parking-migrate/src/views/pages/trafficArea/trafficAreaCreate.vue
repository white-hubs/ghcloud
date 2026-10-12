<template>
  <g-layout-no-footer title="客流量区域">
    <template v-slot:content-table>
      <div class="page-container">
        <div class="section">
          <h3 class="section-title">基本信息</h3>
          <a-form :model="form" ref="formRef" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入名称' }]">
                  <a-input v-model:value="form.name" :disabled="detailMode" placeholder="请输入名称" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="模型区域编码" name="modelArea" :rules="[{ required: true, message: '请输入模型区域' }]">
                  <a-input v-model:value="form.modelArea" :disabled="detailMode" placeholder="请输入模型区域" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="备注" name="remark">
                  <a-textarea v-model:value="form.remark" :disabled="detailMode" :maxlength="200" show-count placeholder="请输入备注" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="车场图片" name="imageUrl">
                  <g-upload
                    :file="upload.fileList"
                    list-type="picture-card"
                    :max="4"
                    businessKey="parking"
                    @changeFile="onUploadChange"
                    sceneCode="PARKING::INFO"
                    :disabled="detailMode"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>

        <div class="section">
          <h3 class="section-title">区域视角</h3>
          <a-button v-if="!detailMode && viewAngles.length < 1" type="primary" style="margin-bottom: 8px" @click="openViewAngleDrawer"
            >添加</a-button
          >
          <a-table
            style="height: 200px"
            :columns="viewAngleColumns"
            :data-source="viewAngles"
            row-key="id"
            :pagination="false"
            size="small"
          />
        </div>

        <div class="footer-actions">
          <a-space>
            <a-button v-if="!detailMode" type="primary" v-model:loading="loading" @click="handleSubmit">保存</a-button>
            <a-button @click="goBack">返回</a-button>
          </a-space>
        </div>

        <!-- View Angle Modal -->
        <a-modal
          v-model:visible="drawer.visible"
          :title="drawer.form.name ? '编辑视角' : '新增视角'"
          @ok="confirmViewAngle"
          @cancel="drawer.visible = false"
        >
          <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
            <a-form-item label="所在区域">
              <a-cascader
                v-model:value="drawer.form.hideLayers"
                :options="areaTreeData"
                :field-names="{ label: 'name', value: 'id', children: 'children' }"
                placeholder="室外区域不需要填写"
                allow-clear
                show-search
                style="width: 100%"
                changeOnSelect
                @change="
                  (value) => {
                    drawer.form.hideLayers = value;
                  }
                "
              />
            </a-form-item>
            <a-form-item label="视角参数" required>
              <a-textarea v-model:value="drawer.form.params" placeholder="请输入视角参数" :auto-size="{ minRows: 2, maxRows: 4 }" />
            </a-form-item>
          </a-form>
        </a-modal>
      </div>
    </template>
  </g-layout-no-footer>
</template>

<script lang="jsx">
import { message } from "ant-design-vue";
import { defineComponent, reactive, ref, onMounted, getCurrentInstance } from "vue";

import { getTrafficAreasDevices, getDeviceList, getInstanceList } from "../../../api";
import { cubeOuaaService } from "../../../api/service";
import gUpload from "../components/gUpload.vue";

export default defineComponent({
  name: "ParkingCreate",
  components: {
    gUpload,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    const formRef = ref();
    const detailMode = ref(!!(proxy?.$route?.query?.mode === "detail"));
    const form = reactive({ id: undefined, name: "", imageUrl: "", remark: "", modelArea: "", fileIds: [] });
    const upload = reactive({ fileList: [] });
    const loading = ref(false);
    const regionOptions = ref([]);

    const viewAngles = ref([]);
    const drawer = reactive({ visible: false, form: { name: "", center: "", params: "", hideLayers: "" } });

    const viewAngleColumns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
        customRender: ({ text }) => (
          <a-popover placement="topLeft" content={text || "--"}>
            {text || "--"}
          </a-popover>
        ),
      },
      {
        title: "视角参数",
        dataIndex: "params",
        key: "params",
        customRender: ({ text }) => (
          <a-popover placement="topLeft" content={text || "--"}>
            {text || "--"}
          </a-popover>
        ),
      },
      ...(detailMode.value
        ? []
        : [
            {
              title: "操作",
              key: "action",
              customRender: ({ record }) => [
                <a-button type="link" onClick={() => editViewAngle(record)}>
                  编辑
                </a-button>,
                <a-button type="link" danger onClick={() => removeViewAngle(record)}>
                  删除
                </a-button>,
              ],
            },
          ]),
    ];

    // functions: 上传图片变更，写入表单
    function onUploadChange(ids, files) {
      upload.fileList = files;
      form.fileIds = ids;
      if (files.length > 0 && files[0].response && files[0].response.data) {
        form.imageUrl = files[0].response.data.path;
      } else if (files.length === 0) {
        form.imageUrl = "";
      }
    }

    const areaTreeData = ref([]);
    const fieldNames = { children: "children", label: "name", key: "id", value: "sequence" };
    function getRegionName(id) {
      if (!id) return "";
      const find = (nodes) => {
        for (const node of nodes) {
          if (node.sequence === id) return node.name;
          if (node.children) {
            const found = find(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      return find(areaTreeData.value) || id;
    }

    async function fetchAreaTree() {
      try {
        const res = await cubeOuaaService.getAreaTree();
        areaTreeData.value = res;
      } catch (error) {}
    }

    /** 打开新增视角弹窗，区域绑定基本信息 */
    function openViewAngleDrawer() {
      if (detailMode.value) return;
      drawer.visible = true;
      drawer.form = { id: undefined, name: "", center: "", params: "", hideLayers: [], region: form.region };
    }

    /** 确认新增或更新视角，区域采用基本信息 */
    function confirmViewAngle() {
      if (!drawer.form.params) {
        message.warning("请输入视角参数");
        return;
      }
      const item = {
        id: drawer.form.id || Date.now(),
        name: drawer.form.name || "默认",
        params: drawer.form.params,
        center: drawer.form.center,
        hideLayers: drawer.form.hideLayers,
        region: form.region,
      };
      // if (drawer.form.id) {
      //   const index = viewAngles.value.findIndex(v => v.id === drawer.form.id)
      //   if (index > -1) {
      //     viewAngles.value.splice(index, 1, item)
      //   } else {
      //     viewAngles.value.push(item)
      //   }
      // } else {
      //   viewAngles.value.push(item);
      // }
      viewAngles.value.splice(0, 1, item);
      drawer.visible = false;
    }

    /** 编辑视角并回显，区域展示基本信息 */
    function editViewAngle(record) {
      if (detailMode.value) return;
      drawer.visible = true;
      let hideLayers = record.hideLayers;
      if (typeof hideLayers === "string" && hideLayers) {
        hideLayers = hideLayers.split(","); // Assume comma separated if string
      } else if (!Array.isArray(hideLayers)) {
        hideLayers = [];
      }
      drawer.form = {
        id: record.id,
        name: record.name,
        center: record.center,
        params: record.params,
        hideLayers: hideLayers,
        region: record.region || form.region,
      };
    }

    // functions: 删除视角（编辑模式）
    function removeViewAngle(record) {
      if (detailMode.value) return;
      viewAngles.value = viewAngles.value.filter((v) => v.id !== record.id);
    }

    // functions: 保存表单（编辑模式）
    async function handleSubmit() {
      const valid = await formRef.value?.validate().catch(() => false);
      if (!valid) return;
      const payload = { ...form, viewAngles: viewAngles.value };
      const visual = payload.viewAngles.map((item) => {
        return {
          centerAddress: item.center,
          visualConfig: item.params,
          hiddenBuilding: item.hideLayers ? item.hideLayers.join(",") : "",
        };
      });
      const query = {
        id: payload.id,
        name: payload.name,
        remarks: payload.remark,
        modelArea: payload.modelArea,
        files: payload.fileIds,
        visual: visual.length ? visual[0] : null,
      };
      loading.value = true;
      try {
        if (payload.id) {
          query.devices = {
            deviceIds: deviceList.value?.map((d) => d.id),
          };
          await proxy.$api.updateTrafficAreas(query);
        } else {
          await proxy.$api.cerateTrafficAreas(query);
        }
        loading.value = false;
        message.success("保存成功");
        goBack();
      } catch {
        loading.value = false;
      }
    }
    // functions: 返回上一页
    function goBack() {
      history.back();
    }

    // functions: 加载详情数据并回显（与创建页结构一致）
    async function loadDetail() {
      try {
        const id = proxy?.$route?.query?.id;
        let res = null;
        if (proxy.$api.getTrafficAreasDetail) {
          res = await proxy.$api.getTrafficAreasDetail({ id });
        }
        const data = res?.data || res || {};
        form.id = data.id ?? form.id;
        form.name = data.name ?? form.name;
        form.region = data.areaId ?? form.region;
        form.imageUrl = data.imageUrl ?? form.imageUrl;
        form.remark = data.remarks ?? form.remark;
        form.modelArea = data.modelArea ?? form.modelArea;

        // 处理 files 数组回显
        if (Array.isArray(data.files) && data.files.length > 0) {
          form.fileIds = data.files.map((f) => f.id);
          upload.fileList = data.files.map((f) => ({
            uid: f.id,
            id: f.id,
            name: f.name || "图片",
            status: "done",
            url: f.endpointPath || f.path, // 优先使用完整路径 endpointPath
            response: { data: { id: f.id, path: f.path } },
          }));
          // 如果需要设置首张图为封面
          if (upload.fileList.length > 0) {
            form.imageUrl = upload.fileList[0].url;
          }
        } else if (data.fileId) {
          // 兼容旧逻辑
          form.fileIds = [data.fileId];
          upload.fileList = [
            {
              uid: data.fileId,
              id: data.fileId,
              url: form.imageUrl,
              name: "图片",
              status: "done",
              response: { data: { id: data.fileId, path: form.imageUrl } },
            },
          ];
        } else {
          upload.fileList = [];
        }

        viewAngles.value = Array.isArray(data.viewAngles) ? data.viewAngles : viewAngles.value;
        loadDetailView();
      } catch {}
    }
    async function loadDetailView() {
      try {
        const id = proxy?.$route?.query?.id;
        let res = null;
        if (proxy.$api.getTrafficViewDetail) {
          res = await proxy.$api.getTrafficViewDetail({ id });
        }
        const data = res?.data || res || {};
        if (data.visualConfig) {
          viewAngles.value = [
            {
              id: data.id,
              name: "默认",
              center: data.centerAddress,
              params: data.visualConfig,
              hideLayers: data.hiddenBuilding?.split(","),
              //todo
              region: form.region,
            },
          ];
        }
      } catch {}
    }
    const deviceList = ref([]);
    async function fetchDevices() {
      const id = proxy?.$route?.query?.id;
      if (!id) return;
      try {
        const params = {
          id: id,
          pageNumber: 1,
          pageSize: 999,
        };
        const res = await getTrafficAreasDevices(params);
        deviceList.value = res.records || [];
      } catch (error) {}
    }
    onMounted(() => {
      fetchDevices();
      fetchAreaTree();
      if (proxy?.$route?.query?.id) {
        loadDetail();
        //  loadDetailView()
      }
    });

    return {
      formRef,
      detailMode,
      form,
      upload,
      regionOptions,
      viewAngles,
      viewAngleColumns,
      drawer,
      onUploadChange,
      openViewAngleDrawer,
      confirmViewAngle,
      editViewAngle,
      removeViewAngle,
      handleSubmit,
      goBack,
      areaTreeData,
      fieldNames,
      getRegionName,
      loading,
      fetchDevices,
      deviceList,
    };
  },
});
</script>

<style lang="less" scoped>
.page-container {
  background: #fff;
  height: calc(100% - 38px);
  padding: 16px;
  overflow-y: auto;
}
.section {
  margin-bottom: 16px;
}
.section-title {
  padding: 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: #333;
  border-left: 4px solid #1890ff;
  margin-bottom: 12px;
}
.toolbar {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}
.footer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  z-index: 100;
  position: fixed;
  bottom: 16px;
  right: 16px;
}
</style>
