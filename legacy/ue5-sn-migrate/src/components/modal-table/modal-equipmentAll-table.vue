<template>
  <Modal title="设备列表" :modalStyle="{ width: '900px'}" :show="showModal && !show" @close="closeModal" wrapClassName="modal-table-device">
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
            <div v-for="item in dataSource">
              <div class="content">
                <div>{{ item.code }}</div>
                <div>{{ item.name }}</div>
                <div>{{ item.productName }}</div>
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
        <a-pagination style="float: right; margin-top: 15px" v-model:current="datainfo.pageNumber"
          v-model:page-size="datainfo.pageSize" @change="onShowSizeChange" :total="datainfo.total" />
      </div>
    </div>
  </Modal>
    <Equ :id="equid" v-if="show" @close="show = false" :isequ="true"></Equ>
</template>
<script setup lang="ts">
import Modal from "./modal.vue";
import { message } from "ant-design-vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import { satalarmlevels } from "@/api/alarm";
import Equ from "@/components/equipmentdetails/index.vue";
import {UeClient} from "@ghcloud/cube-visual-sdk";
import { cubeDeviceCenterService } from '@/api/service'
import { getDeviceListBuyScene } from '@/api/device'
import { storeArea } from '@/piniaStore/area'
import { storeMenu } from '@/piniaStore/menu'
import { setSpecialCamera } from "@/views";

const piniaStoreArea = storeArea();
const piniaStoreMenu = storeMenu();
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
const columnNum = computed(() => {
  if (show.value) {
    return 1000
  }else{
    return 1000
  }
});
const showIndex = 1000
const datainfo = reactive({
  keyword: "",
  pageSize: 10,
  pageNumber: 1,
  total: 0,
  sceneType:piniaStoreMenu.currentMenu,
  areaId:piniaStoreArea.currentAreaId,
});

const dataSource = ref([]);
const equid = ref("");
const show = ref(false);

const detail = (item) => {
  equid.value = item.deviceId;
  show.value = true;
};
/**
 * 设备定位
 */
const position = async (item) => {
  // 全局查找属性匹配的目标
  ueClient.send('getActorById', { id: item.code }, function (res) {
    if (res.id) {
      closeModal()
      setSpecialCamera(item.productName,item.code)
    } else {
      message.error("模型中未找到对应设备")
    }
  });
};

const level = ref([]);
const table_header = ["设备编码", "设备名称", "设备品类", "所属区域", "操作"];

const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};
const getTableData = async () => {
  level.value = await satalarmlevels();
};
const getData = async () => {
  try {
    loading.value = true;
    let data = await cubeDeviceCenterService.getDeviceInstancePageAll({...datainfo,...props.parameter});
    dataSource.value = data.records.map((d) => ({
      code: d.code,
      name: d.name,
      productName: d.productInfo.productCategory?.name,
      departmentName: d.department?.name,
      areaName: d.area?.pathName,
      deviceId: d.id,
    }));
    datainfo.total = data.total;
  } catch (error) {
  } finally{
    loading.value = false;
  }
};
const query = () => {
  getData();
};
const reset = () => {
  Object.assign(datainfo, {
    ...props.parameter,
    keyword: "",
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  });
  getData();
};
const closeModal = () => {
  emit("close");
};
watch(
  () => props.showModal,
  () => {
    if (props.showModal) {
      getData();
    }
  }
);
onMounted(() => {
  getTableData();
  getData();
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

.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;

  div {
    width: 20%;
    text-align: center;
    padding: 0 15px;
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
      width: 20%;
      line-height: 48px;
      text-align: center;
      height: 48px;
      border-bottom: 1px solid rgba(105, 116, 140, 0.5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
  background-color: rgba(4, 17, 32, 0.92) !important;
}

:deep(.modal-width) {
  width: 940px !important;
}
</style>
<style lang="less" scoped>
.modal-table-device {
  .modal-width {
    width: 540px !important;
  }

  a {
    color: #2989FF;
  }
}
.alarmDetail-wrap{
   height: 0;
   width: 0;
}

</style>