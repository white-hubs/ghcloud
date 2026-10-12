<template>
    <div class="dataPanel">
        <div class="dataPanel-left">
            <img :src="getAssetsImage(props.groupControlData.img)">
        </div>
        <div class="dataPanel-right">
            <div class="valueBox">
                <CountTo :startVal="0" :endVal="Number(props.groupControlData.value)" :duration="2000" separator="" />
            </div>
            <div class="labelBox">{{ props.groupControlData.label }}</div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { getAssetsImage } from "../../../utils/getImage";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
interface data {
    img: string,
    value: number,
    label: string
}
interface Props {
    groupControlData: data
}
const props = withDefaults(defineProps<Props>(), {})

</script>
<style lang="less" scoped>
.dataPanel {
    display: flex;
    align-items: center;
    margin-top: 10px;

    .dataPanel-left {
        background: url("/resource/v1/ue5-migrate/assets/images/business-icon/triage-queue/5.png")no-repeat;
        width: 72px;
        height: 72px;
        background-size: 100%;
        position: relative;

        img {
            position: absolute;
            top: 26%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 22px;
            height: 22px;
        }

    }

    .dataPanel-right {
        .valueBox {
            font-size: 24px;
            font-weight: bold;
            color: #fff;
        }

        .labelBox {
            color: #d9e7ff;
            font-size: 12px;
        }
    }
}
</style>