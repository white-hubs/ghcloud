<template>
  <div class="alarmDetail-wrap">
    <div class="alarmDetail-modal">
      <div class="alarmDetail-modal-header">
        <div class="header-title">{{ infoData.name }}</div>
        <div class="flex-between">
          <div class="header-close" @click="backModal">
            <fullscreen-exit-outlined />
          </div>
          <div class="header-close" @click="closeModal">
            <CloseOutlined />
          </div>
        </div>
      </div>
      <div class="alarmDetail-modal-content flex-column">
        <div class="content-tabs">
          <div v-for="item in tabsList" :key="item" :class="item === activeTabs ? 'active' : ''" @click="activeTabs = item">
            <div>{{ item }}</div>
          </div>
        </div>
        <div class="conent-body">
          <div v-if="activeTabs === '基本信息'" class="info-content">
            <div class="info-img">
              <a-image v-if="riskData?.files.length" width="150px" height="100%" :src="riskData.files[0].path"></a-image>
              <div v-else style="color: #fff">暂无图片</div>
            </div>
            <div class="info-item" style="width: 80%">
              <div style="width: 45%">
                <div class="info-name">
                  风险源编码: <span>{{ riskData.serialNumber || "--" }}</span>
                </div>
                <div class="info-name">
                  风险源分类: <span>{{ riskData.typeName || "--" }}</span>
                </div>
                <div class="info-name">
                  关联档位: <span>{{ riskData.stallName || "--" }}</span>
                </div>
                <div class="info-name">
                  属性: <span>{{ riskData.attribute || "--" }}</span>
                </div>
                <div class="info-name">
                  维护部门: <span>{{ riskData.maintenanceDepName }}</span>
                </div>
                <div class="info-name">
                  使用人: <span>{{ riskData.receiveUserName }}</span>
                </div>
                <div class="info-name">
                  使用到期日期: <span>{{ riskData.usageDate ? dayjs(riskData.usageDate).format("YYYY-MM-DD") : "--" }}</span>
                </div>
              </div>
              <div style="width: 50%; margin-left: 20px">
                <div class="info-name">
                  风险源名称: <span>{{ riskData.name || "--" }}</span>
                </div>
                <div class="info-name">
                  所在区域: <span>{{ riskData.areaName || "--" }}</span>
                </div>
                <div class="info-name">
                  关联现场点: <span>{{ riskData.sitePointName || "--" }}</span>
                </div>
                <div class="info-name">
                  数量: <span>{{ riskData.number || "--" }}</span>
                </div>
                <div class="info-name">
                  使用部门: <span>{{ riskData.receiveDepName }}</span>
                </div>
                <div class="info-name">
                  联系方式: <span>{{ riskData.receiveUserPhone }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="activeTabs === '配件信息'">
            <a-table
              style="margin-top: 6px"
              :scroll="{ y: 300 }"
              :dataSource="riskData.partsDetails"
              :columns="columns"
              :pagination="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CloseOutlined, FullscreenExitOutlined } from "@ant-design/icons-vue";
import { Popover } from "ant-design-vue";
import dayjs from "dayjs";
import { ref, reactive, onMounted, h } from "vue";

import { getCodePropertyDetailed, getCodeRiskDetailed, getPropertyDetailed, getPropertyHistoryList, getRiskDetailed } from "@/api/property";
import { getAssetsImage } from "@/utils/getImage";

const props = defineProps({
  id: {
    type: [String],
    default: "",
  },
  code: {
    type: [String],
    default: "",
  },
  isequ: {
    type: Boolean,
    default: false,
  },
  PanelName: {
    type: Object,
    default: false,
  },
});
const emit = defineEmits(["close"]);
const tabsList = ref(["基本信息", "配件信息"]);
const activeTabs = ref("基本信息");
const columns = [
  {
    title: "配件编号",
    align: "center",
    dataIndex: "code",
  },
  {
    title: "配件名称",
    align: "center",
    dataIndex: "name",
  },
  {
    title: "到期时间",
    dataIndex: "expireDate",
    align: "center",
    customRender: ({ text }: { text: string }) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "备注",
    dataIndex: "remarks",
    align: "center",
  },
];
const riskData = ref({
  serialNumber: "",
  typeName: "",
  attribute: "",
  stallName: "",
  maintenanceDepName: "",
  receiveUserName: "",
  usageDate: "",
  name: "",
  areaName: "",
  sitePointName: "",
  number: "",
  receiveUserPhone: "",
  receiveDepName: "",
  files: [{ path: "" }],
  partsDetails: [],
});
const infoData = ref({
  name: "风险源信息",
});
const backModal = () => {
  emit("close", false);
};
const closeModal = () => {
  emit("close", true);
};
const getPropertyDetail = async () => {
  if (props.id) {
    riskData.value = await getRiskDetailed(props.id);
  } else if (props.code) {
    riskData.value = await getCodeRiskDetailed(props.code);
  }
};
onMounted(() => {
  getPropertyDetail();
});
</script>
<style lang="less" scoped>
.alarmDetail-wrap {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  // z-index: 9000;
}

.alarmDetail-modal {
  width: 800px;
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 99999999;
  transform: translate(-50%, -50%);
  background: transparent;
  border-bottom: 2px solid rgba(41, 137, 255, 1);

  &.full {
    width: 100%;
    height: 100%;
  }

  .alarmDetail-modal-header {
    height: 30px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid rgba(41, 137, 255, 1);
    background-image: url("/resource/v1/ue5-sn-migrate/assets/images/modal-title.png");
    background-size: 100%95%;
    background-repeat: no-repeat;

    .header-title {
      font-size: 14px;
      font-weight: 400;
      color: #ffffff;
    }

    .header-close {
      width: 24px;
      height: 24px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      span {
        font-size: 13px;
      }
    }
  }

  .info-img {
    text-align: center;
    margin-right: 20px;
  }

  .alarmDetail-modal-content {
    max-height: 515px;
    width: 100%;
    padding: 0 16px;
    padding-bottom: 20px;
    overflow: hidden;
    background: rgba(1, 11, 23, 0.78);
    margin-top: 2px;

    .content-tabs {
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 14px;
      font-family: PingFang SC-Regular;
      font-weight: 400;
      color: #ffffff;

      > div {
        width: 68px;
        height: 26px;
        opacity: 1;
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 500;
        color: #ffffff;
        cursor: pointer;
        transition: all 0.3s ease-in-out;

        &.active {
          background: linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, rgba(41, 137, 255, 0.5) 100%);
        }
      }
    }

    .conent-body {
      min-height: 340px;

      width: 100%;

      .info-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;

        .info-item {
          display: flex;

          :deep(.box .content) {
            margin-top: 15%;
          }

          .info-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-top: 15px;
            color: #b7c5d3;
            text-align: left;
          }

          .info-name > span {
            margin-left: 10px;
          }
        }
      }
    }
  }
}

.content-tabs {
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 14px;
  font-family: PingFang SC-Regular;
  font-weight: 400;
  color: #ffffff;

  > div {
    width: 68px;
    height: 26px;
    opacity: 1;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.3s ease-in-out;

    &.active {
      background: linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, rgba(41, 137, 255, 0.5) 100%);
    }
  }
}

.page {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;

  :deep(.ant-pagination-total-text) {
    color: white;
  }
}

:deep(.ant-table) {
  background-color: transparent;
}

:deep(.ant-table-container) {
  background-color: transparent;
}

:deep(.ant-table-content) {
  background-color: transparent;
}

:deep(.ant-table-thead) {
  th {
    background-color: rgba(16, 40, 68, 0.4x);
  }
}

:deep(.ant-table-tbody) {
  td {
    background-color: transparent;
    border-bottom: thin solid rgba(105, 116, 140, 0.5);
  }

  tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected) > td {
    //自定义table行hover上去的背景颜色
    background: transparent;
    cursor: default;
  }
}

.ant-form-item {
  .ant-picker,
  .ant-input-affix-wrapper {
    color: #ffffff;
    background: rgba(96, 112, 128, 0.6);
    border: 1px solid rgba(96, 112, 128, 0.6);
  }
}

:deep(.ant-empty) {
  color: #d0deee;
}
</style>
