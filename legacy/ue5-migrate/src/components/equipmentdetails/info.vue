<template>
  <div class="info-content">
    <div class="info">
      <div class="info-img">
        <a-image v-if="dataInfo.productInfo.path" width="100%" height="100%" :src="dataInfo.productInfo.path"></a-image>
        <!-- <div v-else style="color:#fff">暂无图片</div> -->
        <a-image v-else width="100%" height="100%" :src="getAssetsImage('overView45.png')"></a-image>
      </div>
      <div style="width: 33%">
        <div class="info-name">
          设备编码: <span>{{ dataInfo.baseArchivesInfo.code || "暂无" }}</span>
        </div>
        <div class="info-name">
          所属区域:<span>{{ dataInfo.baseArchivesInfo.area?.pathName || "暂无" }}</span>
        </div>
        <div class="info-name">
          管理人员:<span>{{ dataInfo.baseArchivesInfo.manager?.name || "暂无" }}</span>
        </div>
        <div class="info-name">
          部门名称:<span>{{ dataInfo.baseArchivesInfo.department?.name || "暂无" }}</span>
        </div>
      </div>
      <div style="width: 36%">
        <div class="info-name">
          设备品类:<span>{{ dataInfo.productInfo.productCategory.name || "暂无" }}</span>
        </div>
        <!-- <div class="info-name">设备品牌:<span>{{ dataInfo.brandName || '暂无' }}</span></div> -->
        <div class="info-name">
          设备型号:<span>{{ dataInfo.productInfo.modelName || "暂无" }}</span>
        </div>
        <!-- <div class="info-name">所属科室:<span>{{ dataInfo.belongto || '暂无' }}</span></div> -->
        <div class="info-name">
          设备状态:<span v-if="dataInfo.baseArchivesInfo.status.onlineState" style="color: #5ccd4d"> 在线 </span>
          <span v-else style="color: #fba33f"> 离线 </span>
        </div>
        <div class="info-name">
          使用寿命:<span>{{
            dataInfo.expandInfo?.factoryInfo?.usefulLife ? `${dataInfo.expandInfo?.factoryInfo?.usefulLife}月` : "暂无"
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";

import { cubeDeviceCenterService, cubeFileService } from "@/api/service";
import { getAssetsImage } from "@/utils/getImage";

const props = defineProps({
  id: {
    type: String,
    default: "1747863908008361984",
  },
});

const dataInfo = ref<any>({
  baseArchivesInfo: {
    picture: "",
    code: "",
    area: {
      name: "",
    },
    manager: {
      name: "",
    },
    department: {
      name: "",
    },
    status: {
      onlineState: false,
    },
  },
  productInfo: {
    productCategory: {
      name: "",
    },
    modelName: "",
  },
  expandInfo: {
    factoryInfo: {
      usefulLife: "",
    },
  },
});

onMounted(async () => {
  dataInfo.value = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: props.id });
  if (dataInfo.value.productInfo.picture) {
    cubeFileService.getFileInfo(dataInfo.value.productInfo.picture).then((res) => {
      dataInfo.value.productInfo.path = res.path;
    });
  }
});
</script>

<style lang="less" scoped>
.info-content {
  font-size: 14px;
  height: 340px;
  display: flex;
  align-items: center;

  .info {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .info-img {
    width: 150px;
    text-align: center;
    // line-height: 10px;
    height: 110px;
  }

  .info-name {
    margin-top: 15px;
    color: #b7c5d3;
  }

  .info-name > span {
    margin-left: 10px;
  }

  .title {
    font-weight: 500;
    color: #ffffff;
    font-size: 20px;
    margin-top: 10px;
  }

  .state {
    height: 400px;
    overflow-y: auto;
  }

  .fireControlMsg {
    display: flex;
    justify-content: flex-start;
    width: 100%;
    flex-wrap: wrap;
    margin-bottom: 20px;
    overflow-y: auto;
    height: 200px;

    .fireControlMsg-item {
      width: 30%;
      display: flex;
      justify-content: flex-start;
      margin-top: 20px;
      margin-left: 20px;
      font-size: 15px;

      .fireControlMsg-item-left {
        font-weight: 400;
        color: #b7c5d3;
      }

      .fireControlMsg-item-right {
        margin-left: 10px;
        color: #fff;
      }
    }

    .bg {
      width: 82px;
      height: 82px;
      background: #f8f8f8;
      border-radius: 4px 4px 4px 4px;
      opacity: 1;
      border: 1px solid #f2f2f2;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
