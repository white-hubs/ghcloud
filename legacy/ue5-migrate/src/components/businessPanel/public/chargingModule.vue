<template>
    <div class="collectFeesBox">
        <div class="imgBox">
            <img :src="getAssetsImage(props.collectFeesData.img)">

        </div>
        <div class="box1">{{ props.collectFeesData.value ?? 0 }}</div>
        <div class="box2">{{ props.collectFeesData.label }}</div>
        <div class="ringRatio">
            <span>环比</span>
            <!-- uptriangle 向上三角根据Prop改变 -->
            <div :class="['downtriangle', props.collectFeesData.ringRatio > 0 && 'uptriangle']"></div>
            <div :class="[props.collectFeesData.ringRatio > 0 ? 'up' : 'down']">{{ props.collectFeesData.ringRatio + '%' }}
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { getAssetsImage } from "../../../utils/getImage";

interface data {
    img: string,
    value: number,
    label: string,
    ringRatio: number
}

interface Props {
    collectFeesData: data
}
const props = withDefaults(defineProps<Props>(), {});

</script>
<style lang="less" scoped>
.collectFeesBox {
    width: 110px;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;

    .imgBox {
        background: url("/resource/v1/ue5-migrate/assets/images/hexahedron.png")no-repeat;
        width: 72px;
        height: 72px;
        background-size: 100% 100%;
        position: relative;
    }

    img {
        width: 24px;
        height: 24px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .box1 {
        font-size: 24px;
    }

    .box2 {
        font-size: 12px;
    }

    .ringRatio {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        margin-left: 6px;
    }
}
</style>