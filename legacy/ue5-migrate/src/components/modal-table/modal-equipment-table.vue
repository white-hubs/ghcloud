<template>
  <Modal title="设备列表" :show="showModal && !show" @close="closeModal" wrapClassName="modal-table-device">
    <div class="modal-layout">
      <div class="table-top">
        <a-form ref="selectForm" :model="datainfo" layout="inline">
          <a-form-item label="设备名称">
            <a-input style="width: 150px" v-model:value="datainfo.keyword"></a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" size="middle" @click="query" :loading="loading">查询</a-button>
            <a-button size="middle" style="margin-left: 15px" @click="reset">重置</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div style="margin-top: 15px">
        <div class="table_header">
          <div v-for="item in table_header">{{ item }}</div>
        </div>
        <a-spin :spinning="loading">
          <div class="table_content">
            <div v-if="dataSource.length === 0" class="no-content">
              <NoData />
            </div>
            <div v-for="(item, index) in dataSource">
              <div class="content">
                <div>{{ index + 1 }}</div>
                <div>{{ item.code }}</div>
                <div>{{ item.name }}</div>
                <div>{{ item.productName }}</div>
                <div>{{ item.departmentName }}</div>
                <div>{{ item.areaName }}</div>
                <div>
                  <a @click="detail(item)">详情</a>
                  &nbsp;&nbsp;&nbsp;
                  <a @click="position(item)">定位</a>
                </div>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
      <div style="height: 30px">
        <a-pagination
          style="float: right; margin-top: 15px"
          v-model:current="datainfo.pageNumber"
          v-model:page-size="datainfo.pageSize"
          @change="onShowSizeChange"
          :total="datainfo.total"
        />
      </div>
    </div>
  </Modal>
  <Equ :id="equid" v-if="show" @close="show = false" :isequ="true"></Equ>
</template>
<script setup lang="ts">
import { message } from "ant-design-vue";
import { nextTick, onMounted, reactive, ref, watch } from "vue";
import { onBeforeUnmount } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import { clearEquipmentTableQueryCache, getEquipmentTableQueryCache, setEquipmentTableQueryCache } from "./equipment-table-query-cache";
import Modal from "./modal.vue";
import { satalarmlevels } from "@/api/alarm";
import { getDeviceListBuyScene } from "@/api/device";
import NoData from "@/components/businessPanel/public/noData.vue";
import Equ from "@/components/equipmentdetails/index.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const ueClient = UeClient.getInstance();

interface Props {
  parameter?: any;
  showModal: boolean;
}
const loading = ref(false);
const selectForm = ref();
const emit = defineEmits(["close"]);

const props = withDefaults(defineProps<Props>(), {
  title: "设备列表",
  showModal: false,
  parameter: {},
});
const datainfo = reactive({
  keyword: "",
  pageSize: 10,
  pageNumber: 1,
  total: 0,
  sceneType: globalState.business.currentMenu,
  areaId: globalState.business.currentAreaId,
});

const dataSource = ref([]);
const equid = ref("");
const show = ref(false);
/** 恢复缓存时忽略分页组件的回写，避免 total=0 时把页码钳成 1 */
const restoring = ref(false);

const getCurrentSceneType = () => {
  return globalState.business.currentMenu || datainfo.sceneType || "";
};

const resetQueryState = () => {
  datainfo.keyword = "";
  datainfo.pageNumber = 1;
  datainfo.pageSize = 10;
  datainfo.total = 0;
};

const saveQueryCache = () => {
  const sceneType = getCurrentSceneType();
  // 已切到其他业务菜单时，禁止旧实例把脏查询条件写回缓存
  if (datainfo.sceneType && datainfo.sceneType !== sceneType) {
    return;
  }
  setEquipmentTableQueryCache({
    sceneType,
    keyword: datainfo.keyword ?? "",
    pageNumber: Number(datainfo.pageNumber) || 1,
    pageSize: Number(datainfo.pageSize) || 10,
    total: Number(datainfo.total) || 0,
  });
};

const restoreQueryCache = () => {
  datainfo.sceneType = globalState.business.currentMenu;
  datainfo.areaId = globalState.business.currentAreaId;
  const sceneType = getCurrentSceneType();
  const cached = getEquipmentTableQueryCache();

  // 业务菜单已切换：丢掉上一次缓存，从默认条件开始
  if (!cached || cached.sceneType !== sceneType) {
    clearEquipmentTableQueryCache();
    resetQueryState();
    return;
  }

  restoring.value = true;
  // 先写 total/pageSize，再写 pageNumber，避免 Pagination 在 total=0 时把 current 打回 1
  datainfo.total = Math.max(cached.total, cached.pageNumber * cached.pageSize);
  datainfo.pageSize = cached.pageSize;
  datainfo.pageNumber = cached.pageNumber;
  datainfo.keyword = cached.keyword;
  nextTick(() => {
    datainfo.pageNumber = cached.pageNumber;
    datainfo.pageSize = cached.pageSize;
    datainfo.keyword = cached.keyword;
    restoring.value = false;
  });
};

const detail = (item) => {
  equid.value = item.deviceId;
  show.value = true;
};
/**
 * 设备定位
 */
const position = async (item) => {
  // 记录当前的视角
  await ueClient.saveNowViewPoint();
  // 全局查找属性匹配的目标
  ueClient.send("getActorById", { id: item.code }, function (res) {
    if (res.id) {
      closeModal();
      ueClient.send("focusActor", { id: res.id });
      ueClient.send("showShell", { id: res.id });
    } else {
      message.error("模型中未找到对应设备");
    }
  });
};

const level = ref([]);
const table_header = ["序号", "设备编码", "设备名称", "设备品类", "部门名称", "所属区域", "操作"];

const onShowSizeChange = (current, size) => {
  if (restoring.value) return;
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  saveQueryCache();
  getData();
};
const getTableData = async () => {
  level.value = await satalarmlevels();
};
const getData = async () => {
  const requestPage = Number(datainfo.pageNumber) || 1;
  const requestSize = Number(datainfo.pageSize) || 10;
  const requestKeyword = datainfo.keyword ?? "";
  try {
    loading.value = true;
    // let data = await cubeDeviceCenterService.getDeviceInstancePageAll({...datainfo,...props.parameter});
    let data = await getDeviceListBuyScene({
      ...datainfo,
      ...props.parameter,
      pageNumber: requestPage,
      pageSize: requestSize,
      keyword: requestKeyword,
    });
    dataSource.value = data.records.map((d) => ({
      code: d.code,
      name: d.name,
      productName: d.prodCategory.name,
      departmentName: d.department ? d.department.val : "--",
      areaName: d.area?.pathName,
      deviceId: d.id,
    }));
    datainfo.total = data.total;
    // 接口返回后强制回写，防止分页组件在请求期间把页码钳回 1 并污染缓存
    datainfo.pageNumber = requestPage;
    datainfo.pageSize = requestSize;
    datainfo.keyword = requestKeyword;
    saveQueryCache();
  } catch (error) {
  } finally {
    loading.value = false;
  }
};
const query = () => {
  datainfo.pageNumber = 1;
  saveQueryCache();
  getData();
};
const reset = () => {
  clearEquipmentTableQueryCache();
  resetQueryState();
  getData();
};
const closeModal = () => {
  saveQueryCache();
  emit("close");
};
const openModalWithCache = () => {
  restoreQueryCache();
  getData();
};
watch(
  () => props.showModal,
  (visible) => {
    if (visible) {
      openModalWithCache();
    } else {
      saveQueryCache();
    }
  },
);
/** 切换业务菜单面板时清空上一次查询缓存 */
watch(
  () => globalState.business.currentMenu,
  (menu, prevMenu) => {
    if (menu === prevMenu) return;
    clearEquipmentTableQueryCache();
    resetQueryState();
    datainfo.sceneType = menu;
  },
);
onMounted(() => {
  window.addEventListener("keydown", handleEsc);
  getTableData();
  if (props.showModal) {
    openModalWithCache();
  }
});
// esc按键返回事件
const handleEsc = (event) => {
  if (event.key !== "Escape") return;
  if (document.querySelector(".alarmDetail-modal")) {
    show.value = false;
    return;
  }
};
onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEsc);
});
</script>

<style lang="less" scoped>
:deep(.ant-select-selection-item) {
  color: #fff;
}

:deep(.ant-form-item-label > label) {
  color: #fff;
}

:deep(.ant-picker-input > input) {
  color: #fff;
}

:deep(.ant-picker-input > input::placeholder) {
  color: #fff;
}

:deep(.ant-table-thead > tr > th) {
  color: #fff;
}

:deep(.ant-table-tbody > tr > td) {
  color: #fff;
}

:deep(.ant-table-tbody > tr > td.ant-table-cell-row-hover) {
  background-color: transparent;
}

:deep(.ant-select-selector) {
  background: rgba(216, 216, 216, 0.1) !important;
  border: 1px solid rgba(96, 112, 128, 0.6) !important;
}

:deep(.ant-picker-range) {
  background: rgba(216, 216, 216, 0.1) !important;
  border: 1px solid rgba(96, 112, 128, 0.6) !important;
}

:deep(.ant-table-cell) {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  border-bottom: rgba(16, 40, 68, 0.8);
}

.modal-layout {
  padding: 16px 20px 20px;
}

.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;

  div {
    flex: 1;
    min-width: 0;
    text-align: center;
    padding: 0 8px;

    &:first-child {
      flex: 0 0 56px;
    }
  }
}

.table_content {
  // display: flex;
  color: #fff;
  min-height: 200px;

  .no-content {
    display: flex;
    justify-content: center;

    :deep(.content) {
      margin-top: 10%;
    }
  }

  .content {
    display: flex;

    div {
      flex: 1;
      min-width: 0;
      line-height: 48px;
      text-align: center;
      height: 48px;
      border-bottom: 1px solid rgba(105, 116, 140, 0.5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &:first-child {
        flex: 0 0 56px;
      }
    }
  }
}

:deep(.ant-pagination-item-ellipsis) {
  color: #fff !important;
}

.overflow {
  overflow: hidden; //超出的文本隐藏
  text-overflow: ellipsis; //溢出用省略号显示
  white-space: nowrap;
}

:deep(.ant-pagination-item-link) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

:deep(.ant-pagination-item) {
  background: rgba(255, 255, 255, 0.1);

  a {
    color: #fff;
  }
}

:deep(.ant-pagination-item-active) {
  background: #1890ff;

  a {
    color: #fff;
  }
}

:deep(.ant-modal-content) {
  background: rgba(4, 17, 32, 0.8) !important;
}

:deep(.modal-width) {
  width: 940px !important;
}
</style>
<style lang="less">
.modal-table-device {
  .modal-width {
    width: 940px !important;
  }

  .ant-modal {
    // top: 200px !important;
  }

  a {
    color: #2989ff;
  }
}
</style>
