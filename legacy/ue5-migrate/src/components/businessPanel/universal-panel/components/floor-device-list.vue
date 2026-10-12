<template>
  <div>
    <SubPanelTemplate title="设备数据" class="device_panel">
      <div class="search flex-between">
        <a-select placeholder="设备状态" ref="select" v-model:value="deviceQuery.status" style="width: 40%" @change="getData">
          <a-select-option value="ONLINE">在线</a-select-option>
          <a-select-option value="OFFLINE">离线</a-select-option>
        </a-select>
        <a-input-search
          enter-button
          v-model:value="deviceQuery.keyword"
          placeholder="按设备名称搜索"
          style="width: 55%; margin-left: 4px"
          @search="getData"
        />
      </div>
      <div class="device_list">
        <div class="header flex-between">
          <div class="table-th" v-for="(td, index) in column" :key="index" :style="styleItem(td)">
            <a-checkbox
              class="checkbox-box"
              @change.stop="allChangeCheck"
              v-model:checked="allChecked"
              style="color: #fff"
              v-if="td.dataIndex === 'name'"
            >
              {{ td.title }}</a-checkbox
            >
            <span v-else>
              {{ td.title }}
            </span>
          </div>
        </div>
        <div class="device_item">
          <template v-for="(tr, index) in tableData" :key="tr?.key || index">
            <div class="table-tr flex-between" @click="($event) => clickTableRow($event, tr)">
              <div class="table-td" v-for="(td, j) in column" :key="index + '_' + j" :style="styleItem(td)">
                <template v-if="td.dataIndex === 'status'">
                  <span v-show="tr[td.dataIndex] === 'NORMAL'" style="color: #58fab6">在线</span>
                  <span v-show="tr[td.dataIndex] === 'OFFLINE'" style="color: #d9e7ff">离线</span>
                </template>
                <div style="color: #2989ff" v-else-if="td.dataIndex === 'operate'" class="flex-between">
                  <div @click.stop="positioning(tr)">
                    <environment-outlined />
                    <span>定位</span>
                  </div>
                  <div @click.stop="detailsRow(tr)">
                    <profile-outlined />
                    <span>详情</span>
                  </div>
                </div>
                <div v-else-if="td.dataIndex === 'name'" class="flex-between">
                  <a-checkbox @change.stop="changeCheck(tr)" v-model:checked="tr.checked" style="color: #fff" v-if="tr.isCheck">
                    {{ tr[td.dataIndex] }}</a-checkbox
                  >
                  <span v-else style="margin-left: 20px">{{ tr[td.dataIndex] }}</span>
                </div>
                <span v-else>{{ tr[td.dataIndex] }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
      <a-pagination
        class="pagination"
        @change="getData"
        v-model:current="deviceQuery.pageNumber"
        v-model:pageSize="deviceQuery.pageSize"
        :total="deviceQuery.total"
        show-less-items
        :showSizeChanger="false"
      />
    </SubPanelTemplate>
    <MonitorGridsModal v-model:visible="visible" :cameraList="cameraList" />
  </div>
</template>

<script setup lang="ts">
import { EnvironmentOutlined, ProfileOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { ref, reactive, onMounted, computed, watch, onBeforeUnmount } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import { getDeviceListBuyScene } from "@/api/device";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import MonitorGridsModal from "@/components/monitor-grids-modal/monitor-grids-modal.vue";
import { eventInstance } from "@/pages/event/event";
import { useStateStore } from "@/pages/state/use-state-store";
import { openDeviceModalSimplify } from "@/pages/widget/modal/device-model-simplify/device-model-simplify";
import { storeMarket } from "@/piniaStore/other";
import bus from "@/utils/bus";

const { globalState } = useStateStore();

const deviceQuery = reactive({
  status: null,
  keyword: "",
  pageSize: 20,
  pageNumber: 1,
  total: 0,
  pages: 0,
});
const loopInterval = ref();
const allChecked = ref(false);
const cameraList = ref([]);
const visible = ref(false);
const piniaStoreMarket = storeMarket();
const modal = reactive({
  visible: false,
  name: "设备名称",
  status: "NORMAL",
  code: "",
  areaName: "",
});
const styleItem = computed(() => (item: any) => {
  let style: any = {};
  if (item?.width) {
    style = { ...style, width: item.width + "px" };
  }
  if (item?.align) {
    style = { ...style, textAlign: item.align };
  }
  return style;
});
const column = [
  {
    title: "设备名称",
    dataIndex: "name",
    width: 250,
  },
  {
    title: "状态",
    dataIndex: "status",
    width: 50,
  },
  {
    title: "操作",
    dataIndex: "operate",
    width: 110,
  },
];
const columnNum = computed(() => {
  return 100 / column.length;
});
const tableData = ref<any[]>([]);

const positioning = async (data: any) => {
  openDeviceModalSimplify({
    title: data.name,
    deviceId: data.id,
    onClose: () => {
      eventInstance.emitEvent("verifyModelStatus");
    },
  });
  eventInstance.emitEvent("locateToDevice", {
    deviceCode: data.code,
  });
};
const backModal = () => {
  modal.visible = false;
};
watch(
  () => [piniaStoreMarket.selectDevice, globalState.business.currentAreaId],
  () => {
    getData();
  },
);
const getData = async () => {
  let query = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    pageNumber: deviceQuery.pageNumber,
    pageSize: deviceQuery.pageSize,
    status: deviceQuery.status,
    keyword: deviceQuery.keyword,
  };
  const DEVICE = await getDeviceListBuyScene(query);
  tableData.value = DEVICE.records;
  tableData.value.forEach((e) => {
    e.status = e.status.onlineState ? "NORMAL" : "OFFLINE";
    //@ts-ignore
    if (piniaStoreMarket.selectDevice.id === e.id) {
      e.checked = true;
    } else {
      e.checked = false;
    }

    if (e?.prodCategory?.name?.includes("摄像")) {
      e.isCheck = true;
    } else {
      e.isCheck = false;
    }
  });
  deviceQuery.total = DEVICE.total;
  deviceQuery.pages = DEVICE.pages;
};
const detailsRow = (tr: any) => {
  modal.visible = false;
  globalState.panel.rightPanelName = "";
  // 缓存设备返回到预案面板
  // if (globalState.panel.rightPanelName = 'emergency-drill') {
  //   globalState.business.emergencyDeviceBack = {
  //     ...globalState.panel
  //   }
  //   globalState.panel.rightPanelName = 'emergency-drill'
  // } else {
  //   globalState.panel.rightPanelName = ''
  // }
  globalState.panel.leftPanelName = "deviceDetailsPanel";
  globalState.panel.universalPanelVo.left = null;
  globalState.panel.universalPanelVo.right = null;
  globalState.business.panelCurrentDeviceId = tr.id;
};
const allChangeCheck = () => {
  let isChecked = 0;
  tableData.value.forEach((e) => {
    if (e.isCheck && allChecked.value && isChecked < 9) {
      e.checked = true;
      isChecked++;
    } else if (e.isCheck && !allChecked.value) {
      e.checked = false;
    }
  });
  changeCheck();
};
const changeCheck = (tr?: any) => {
  clearInterval(loopInterval.value);
  backModal();
  const arr = tableData.value.filter((e) => {
    return e.isCheck && e.checked;
  });
  if (arr.length === tableData.value.filter((e) => e.isCheck).length) {
    allChecked.value = true;
  } else {
    allChecked.value = false;
  }
  if (arr.length > 9) {
    tr.checked = false;
    message.warning("最多选择9个设备");
    return;
  } else {
    cameraList.value = arr as any;
  }
  if (cameraList.value.length) {
    visible.value = true;
    loopInterval.value = setInterval(
      () => {
        loopVideoEvent();
      },
      1000 * 60 * 10,
    );
  } else {
    visible.value = false;
    clearInterval(loopInterval.value);
  }
};
const lastIndex = ref(0); // 记录当前页的选中位置

const loopVideoEvent = async () => {
  const totalDevices = tableData.value.length;
  const selectedCount = cameraList.value.length;

  // 如果设备总数不足，直接返回
  if (totalDevices === 0 || selectedCount === 0) return;

  // 清空当前选中状态
  tableData.value.forEach((e) => (e.checked = false));

  // 从 lastIndex 开始，选中 selectedCount 个设备
  const newSelectedDevices = [];
  let remainingDevices = selectedCount;

  while (remainingDevices > 0) {
    // 当前页剩余设备数量
    const availableDevices = totalDevices - lastIndex.value;

    // 选中当前页的设备
    const count = Math.min(remainingDevices, availableDevices);
    for (let i = 0; i < count; i++) {
      const index = lastIndex.value + i;
      if (tableData.value[index]) {
        tableData.value[index].checked = true;
      }
      newSelectedDevices.push(tableData.value[index]);
    }

    // 更新剩余需要选中的设备数量
    remainingDevices -= count;

    // 如果当前页设备不足，加载下一页
    if (remainingDevices > 0) {
      // 增加页码
      deviceQuery.pageNumber += 1;

      // 加载下一页数据
      await getData();

      // 重置 lastIndex
      lastIndex.value = 0;
    } else {
      // 更新 lastIndex
      lastIndex.value += count;
    }
  }

  // 更新 cameraList
  cameraList.value = newSelectedDevices as any;
  // 如果已经是最后一页，回到第一页
  if (deviceQuery.pageNumber > deviceQuery.pages) {
    deviceQuery.pageNumber = 1;
    await getData();
    lastIndex.value = 0;
  }
};
const clickTableRow = async (event: any, data: any) => {
  bus.emit("closeDevicePanel");
  if (event.target.className === "ant-checkbox-input") return;
  //保存当前视角
  await UeClient.getInstance().saveNowViewPoint();
  Object.assign(modal, data);
  modal.visible = true;
};
onMounted(() => {
  getData();
});
onBeforeUnmount(() => {
  clearInterval(loopInterval.value);
});
</script>

<style lang="less" scoped>
.device_list {
  margin-top: 10px;

  .header {
    padding: 0 10px;
    width: 100%;
    height: 30px;
    color: #ffffff;
    font-size: 14px;
    background: rgba(97, 148, 247, 0.20) // border: 1px solid rgba(86, 142, 255, 0.3);
  }
}

.device_item {
  cursor: pointer;
}

.table-tr {
  padding: 0 10px;
  background: rgb(83 82 82 / 15%);
  height: 35px;
  font-size: 12px;
  color: #d9e7ff;
  cursor: pointer;


  &:nth-child(2n) {
    background: transparent;
  }
}

.table-th,
.table-td {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: calc(v-bind(columnNum) * 1%);
}


.device_panel {
  position: relative;
  height: 900px;

  .pagination {
    position: absolute;
    bottom: 0px;
    right: 0;
  }
}

.checkbox-box {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}
</style>
