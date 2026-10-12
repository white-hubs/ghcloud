<template>
  <g-layout-no-footer title="客流区域-详情/编辑">
    <template v-slot:content-table>
      <div class="page-container">
        <div class="section">
          <h3 class="section-title">基本信息</h3>
          <a-form :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="名称">
                  <span>{{ form.name || "--" }}</span>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="模型区域编码">
                  <span>{{ form.modelArea || "--" }}</span>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="备注">
                  <span>{{ form.remark || "--" }}</span>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="车场图片">
                  <div v-if="upload.fileList && upload.fileList.length > 0">
                    <a-image
                      v-for="file in upload.fileList"
                      :key="file.uid"
                      :src="file.url"
                      :width="100"
                      style="margin-right: 8px; margin-bottom: 8px"
                    />
                  </div>
                  <span v-else>--</span>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>

        <div class="section">
          <h3 class="section-title">设备信息</h3>
          <a-table
            :columns="deviceColumns"
            :data-source="deviceList"
            :pagination="devicePagination"
            row-key="code"
            @change="onDeviceTableChange"
            size="small"
          />
        </div>

        <div class="section">
          <h3 class="section-title">区域视角</h3>
          <a-table :columns="viewAngleColumns" :data-source="viewAngles" row-key="id" :pagination="false" size="small" />
        </div>

        <div class="footer-actions">
          <a-space>
            <a-button @click="goBack">返回</a-button>
          </a-space>
        </div>

        <a-modal v-model:visible="radiusModal.visible" title="设置" :confirm-loading="radiusModal.loading" @ok="submitSetRadius">
          <a-form :label-col="{ span: 7 }" :wrapper-col="{ width: '100px' }">
            <a-form-item label="半径" required>
              <a-input v-model:value="radiusModal.radius" placeholder="请输入半径" addon-after="cm" />
            </a-form-item>
            <a-form-item label="中心点" required>
              <a-textarea v-model:value="radiusModal.centerAddress" placeholder="请输入中心点" />
            </a-form-item>
            <a-form-item label="父级模型区域编码">
              <a-input v-model:value="radiusModal.parentModelArea" placeholder="请输入父级模型区域编码" />
            </a-form-item>
          </a-form>
        </a-modal>
      </div>
    </template>
  </g-layout-no-footer>
</template>

<script lang="jsx">
import { EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { defineComponent, reactive, ref, onMounted, getCurrentInstance } from "vue";

import { getTrafficAreasDevices, getInstanceList, modifyTrafficAreaDevice } from "../../../api";
import { cubeOuaaService } from "../../../api/service";

export default defineComponent({
  name: "ParkingDetail",
  setup() {
    const { proxy } = getCurrentInstance();

    const formRef = ref();
    const form = reactive({
      id: undefined,
      name: "",
      totalNum: undefined,
      region: undefined,
      imageUrl: "",
      location: "",
      remark: "",
      modelArea: "",
      fileIds: [],
    });
    const upload = reactive({ fileList: [] });

    const deviceFilter = reactive({ region: undefined, keyword: "", pageNum: 1, pageSize: 10 });
    const deviceList = ref([]);
    const devicePagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showTotal: (total) => `共 ${total} 条`,
      showSizeChanger: true,
    });

    const viewAngles = ref([]);

    const areaTreeData = ref([]);
    const fieldNames = { children: "children", label: "name", key: "id", value: "sequence" };

    const radiusModal = reactive({
      visible: false,
      radius: "",
      centerAddress: "",
      loading: false,
      currentDevice: null,
      parentModelArea: null,
    });

    const handleSetRadius = (record) => {
      radiusModal.currentDevice = record;
      try {
        if (record.trafficDetectionAreaConfig && record.trafficDetectionAreaConfig.deviceConfig) {
          const config = JSON.parse(record.trafficDetectionAreaConfig.deviceConfig);
          radiusModal.radius = config.radius || "";
          radiusModal.centerAddress = config.centerAddress || "";
          radiusModal.parentModelArea = config.parentModelArea || "";
        } else if (record.deviceConfig) {
          const config = JSON.parse(record.deviceConfig);
          radiusModal.radius = config.radius || "";
          radiusModal.centerAddress = config.centerAddress || "";
          radiusModal.parentModelArea = config.parentModelArea || "";
        } else {
          radiusModal.radius = "";
          radiusModal.centerAddress = "";
          radiusModal.parentModelArea = "";
        }
      } catch (e) {
        radiusModal.radius = "";
        radiusModal.centerAddress = "";
        radiusModal.parentModelArea = "";
      }
      radiusModal.visible = true;
    };

    const submitSetRadius = async () => {
      if (!radiusModal.radius) {
        message.warning("请输入半径");
        return;
      }
      if (!radiusModal.centerAddress) {
        message.warning("请输入中心点");
        return;
      }
      radiusModal.loading = true;
      try {
        let config = {};
        try {
          if (radiusModal.currentDevice.deviceConfig) {
            config = JSON.parse(radiusModal.currentDevice.deviceConfig);
          }
        } catch (e) {
          // ignore error
        }
        config.radius = radiusModal.radius;
        config.centerAddress = radiusModal.centerAddress;
        config.parentModelArea = radiusModal.parentModelArea;

        const payload = {
          id: form.id,
          deviceId: radiusModal.currentDevice.id,
          deviceConfig: JSON.stringify(config),
        };
        await modifyTrafficAreaDevice(payload);
        message.success("设置成功");
        radiusModal.visible = false;
        fetchDevices();
      } catch (error) {
      } finally {
        radiusModal.loading = false;
      }
    };

    const editParentModelArea = (record) => {
      record.parentModelAreaTemp = record.parentModelArea;
      record.isEditingParentModelArea = true;
    };

    const cancelEditParentModelArea = (record) => {
      record.isEditingParentModelArea = false;
    };

    const saveParentModelArea = async (record) => {
      const newValue = record.parentModelAreaTemp;
      try {
        let config = {};
        try {
          if (record.trafficDetectionAreaConfig && record.trafficDetectionAreaConfig.deviceConfig) {
            config = JSON.parse(record.trafficDetectionAreaConfig.deviceConfig);
          } else if (record.deviceConfig) {
            config = JSON.parse(record.deviceConfig);
          }
        } catch (e) {
          // ignore
        }
        config.parentModelArea = newValue;

        const newDeviceConfigStr = JSON.stringify(config);
        const payload = {
          id: form.id,
          deviceId: record.id,
          deviceConfig: newDeviceConfigStr,
        };
        await modifyTrafficAreaDevice(payload);
        message.success("设置成功");
        record.parentModelArea = newValue;
        record.isEditingParentModelArea = false;

        // 更新本地配置数据，避免刷新列表导致其他行编辑状态丢失
        if (record.trafficDetectionAreaConfig) {
          record.trafficDetectionAreaConfig.deviceConfig = newDeviceConfigStr;
        } else {
          record.deviceConfig = newDeviceConfigStr;
        }
      } catch (error) {}
    };

    const deviceColumns = [
      {
        title: "设备编号",
        dataIndex: "code",
        key: "code",
        customRender: ({ text }) => (
          <a-popover placement="topLeft" content={text || "--"}>
            {text || "--"}
          </a-popover>
        ),
      },
      {
        title: "设备名称",
        dataIndex: "name",
        key: "name",
        customRender: ({ text }) => (
          <a-popover placement="topLeft" content={text || "--"}>
            {text || "--"}
          </a-popover>
        ),
      },
      {
        title: "所属产品",
        dataIndex: ["productInfo", "name"],
        key: "productInfo.name",
        ellipsis: true,
        customRender: ({ record }) => {
          const text = record.productInfo?.name || "--";
          return (
            <a-popover placement="topLeft" content={text}>
              {text}
            </a-popover>
          );
        },
      },
      {
        title: "维护部门",
        dataIndex: ["department", "name"],
        key: "department.name",
        ellipsis: true,
        customRender: ({ record }) => {
          const text = record.department?.name || "--";
          return (
            <a-popover placement="topLeft" content={text}>
              {text}
            </a-popover>
          );
        },
      },
      {
        title: "所在区域",
        dataIndex: ["area", "name"],
        key: "area.name",
        ellipsis: true,
        customRender: ({ record }) => {
          const text = record.area?.name || "--";
          return (
            <a-popover placement="topLeft" content={text}>
              {text}
            </a-popover>
          );
        },
      },
      {
        title: "父级模型区域编码",
        dataIndex: "parentModelArea",
        key: "parentModelArea",
        width: 220,
        customRender: ({ record }) => {
          if (record.isEditingParentModelArea) {
            return (
              <div style="display: flex; align-items: center; justify-content: center;">
                <a-input
                  value={record.parentModelAreaTemp}
                  onUpdate:value={(val) => {
                    record.parentModelAreaTemp = val;
                  }}
                  maxlength={20}
                  showCount
                  onPressEnter={() => saveParentModelArea(record)}
                  style="width: 160px; margin-right: 8px"
                  placeholder="模型区域编码"
                />
                <CheckOutlined
                  title="保存"
                  style="color: #1890ff; cursor: pointer; margin-right: 8px;"
                  onClick={() => saveParentModelArea(record)}
                />
                <CloseOutlined title="取消" style="color: #999; cursor: pointer;" onClick={() => cancelEditParentModelArea(record)} />
              </div>
            );
          }
          return (
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 8px; min-width: 20px;">{record.parentModelArea || "--"}</span>
              <EditOutlined
                class="row-hover-icon"
                title="修改"
                style="color: #1890ff; cursor: pointer;"
                onClick={() => editParentModelArea(record)}
              />
            </div>
          );
        },
      },
      {
        title: "操作",
        key: "action",
        width: 120,
        customRender: ({ record }) => (
          <a-button type="link" onClick={() => handleSetRadius(record)}>
            设置
          </a-button>
        ),
      },
    ];
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
    ];

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

    // functions: 查询设备列表（编辑模式）
    async function fetchDevices() {
      if (!form.id) return;
      try {
        const params = {
          id: form.id,
          regionId: deviceFilter.region,
          keyword: deviceFilter.keyword,
          pageNumber: deviceFilter.pageNum,
          pageSize: deviceFilter.pageSize,
        };
        const res = await getTrafficAreasDevices(params);
        deviceList.value = (res.records || []).map((item) => {
          let parentModelArea = "";
          try {
            if (item.trafficDetectionAreaConfig && item.trafficDetectionAreaConfig.deviceConfig) {
              const config = JSON.parse(item.trafficDetectionAreaConfig.deviceConfig);
              parentModelArea = config.parentModelArea || "";
            } else if (item.deviceConfig) {
              const config = JSON.parse(item.deviceConfig);
              parentModelArea = config.parentModelArea || "";
            }
          } catch (e) {
            // ignore
          }
          return {
            ...item,
            parentModelArea,
            parentModelAreaTemp: parentModelArea,
            isEditingParentModelArea: false,
          };
        });
        devicePagination.total = res.total || 0;
      } catch (error) {}
    }

    // functions: 设备表格分页变更（编辑模式）
    function onDeviceTableChange(pagination) {
      devicePagination.current = pagination.current;
      devicePagination.pageSize = pagination.pageSize;
      deviceFilter.pageNum = pagination.current;
      deviceFilter.pageSize = pagination.pageSize;
      fetchDevices();
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
        form.id = id; // Ensure ID is set for device fetching
        form.name = data.name ?? form.name;
        form.totalNum = data.totalNum ?? form.totalNum;
        form.region = data.areaId ?? form.region;
        form.imageUrl = data.imageUrl ?? form.imageUrl;
        form.location = data.address ?? form.location;
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

        deviceList.value = Array.isArray(data.devices) ? data.devices : deviceList.value;
        viewAngles.value = Array.isArray(data.viewAngles) ? data.viewAngles : viewAngles.value;
        loadDetailView();
        fetchDevices(); // Fetch devices if needed
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
              centerAddress: data.centerAddress,
              params: data.visualConfig,
              hideLayers: data.hiddenBuilding?.split(","),
              region: form.region,
            },
          ];
        }
      } catch {}
    }

    onMounted(() => {
      fetchAreaTree();
      if (proxy?.$route?.query?.id) {
        loadDetail();
        //  loadDetailDevice()
      }
    });

    return {
      formRef,
      form,
      upload,
      deviceFilter,
      deviceList,
      devicePagination,
      deviceColumns,
      viewAngles,
      viewAngleColumns,
      fetchDevices,
      onDeviceTableChange,
      goBack,
      areaTreeData,
      fieldNames,
      getRegionName,
      radiusModal,
      handleSetRadius,
      submitSetRadius,
      editParentModelArea,
      cancelEditParentModelArea,
      saveParentModelArea,
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
  align-items: centerAddress;
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

:deep(.ant-table-row) .row-hover-icon {
  display: none;
}
:deep(.ant-table-row:hover) .row-hover-icon {
  display: inline-block;
}
</style>
