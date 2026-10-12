<template>
    <div class="Box">
        <div class="equipmentStatus">
            <div class="statusBar">
                <span>设备状态</span>
                <span>{{ equipmentInfo.communicationStatus }}</span>
            </div>
        </div>
        <img style="width: 332px;height: 142px;" v-if="props.equipmentInfo.images.length > 0"
            :src="props.equipmentInfo.images[0]">
        <img style="width: 160px;height: 142px;margin-left: 90px;" v-else :src="getAssetsImage('noData.png')">
        <div style="color: #D0DEEE;text-align: center;">暂无图片</div>
        <div class="equipmentInfoRow">
            <span>设备名称：</span>
            <span>{{ props.equipmentInfo.name }}</span>
        </div>
        <div class="equipmentInfoRow">
            <span>设备型号：</span>
            <span>{{ props.equipmentInfo.modelName }}</span>
        </div>
        <div class="equipmentInfoRow">
            <span>所属区域：</span>
            <span>{{ props.equipmentInfo.areaName }}</span>
        </div>

        <!-- <div class="equipmentInfoRow">
            <span>其他信息：</span>
            <span>{{ props.equipmentInfo.otherInfo }}</span>
        </div> -->
    </div>
</template>
<script lang="ts" setup>
import { getAssetsImage } from "../../../../utils/getImage";
interface info {
    id: string,
    name: string,
    modelName: string,
    areaName: string,
    deviceStatus: string,
    communicationStatus: string,
    images: string[]
}
interface Props {
    equipmentInfo: info,
}
const statusList = {
    'ALARM': '#F14545',
    'TROUBLE': '#FFC700',
    'OFFLINE': '#74AEE7',
    'ONLINE': '#00F27B',
    'NORMAL': '#00F27B',
}
const attributeData = []
const props = withDefaults(defineProps<Props>(), {});
</script>
<style lang="less" scoped>
.Box {
    .equipmentStatus {
        .statusBar {
            margin: auto;
            width: 332px;
            height: 40px;
            // background: rgba(42, 232, 189, 0.1);
            box-shadow: inset 0px 0px 10px 0px rgb(149 177 170 / 80%);
            border-radius: 4px 4px 4px 4px;
            // border: 1px solid rgba(42, 232, 189, 0.8);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 18px 0 12px;
            color: #fff;
            font-size: 14px;
            margin-bottom: 10px;
        }
    }

    img {
        margin-left: 6px;
    }

    .equipmentInfoRow {
        margin-top: 9px;
        color: #fff;
        margin-left: 22px;
    }


}
</style>