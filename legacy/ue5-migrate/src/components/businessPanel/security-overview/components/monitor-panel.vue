<template>
    <div class="monitorPanel">
        <div class="monitorPanel-left">
            <div class="bg">
                <img :src="getAssetsImage('overView4.png')" alt="" />
                <img class="rotate aniamtion-electric-fan" :src="getAssetsImage(monitorPanelData.imgPath)" alt="" />
            </div>
        </div>
        <div class="monitorPanel-right">
            <div class="monitorPanel-data">
                <CountTo class="count" @click="handelClick" :startVal="0" :endVal="monitorPanelData.value" :duration="2000"
                    separator="" />
                <div class="monitorPanel-line"></div>
                <div class="monitorPanel-name">{{ monitorPanelData.name }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getAssetsImage } from "@/utils/getImage";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
interface data {
    imgPath: string;
    value: number;
    name: string;
    color?: string;
}
interface Props {
    monitorPanelData: data
}
const emit = defineEmits(["handelClickItemize"]);
const props = withDefaults(defineProps<Props>(), {
});
const handelClick = (item) => {
    emit("handelClickItemize", item);
};
</script>
<style scoped lang="less">
.monitorPanel {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .monitorPanel-left {
        .bg {
            position: relative;
            width: calc(var(--font-size-scale) * 100px);
            height: calc(var(--font-size-scale) * 80px);
            perspective: 200;

            img {
                width: 100%;
                height: 100%;
            }

            .rotate {
                position: absolute;
                width: calc(var(--font-size-scale) * 35px);
                height: calc(var(--font-size-scale) * 35px);
                left: calc(var(--font-size-scale) * 30px);
                top: calc(var(--font-size-scale) * 8px);
                transform: rotateY(45deg);
            }
        }
    }

    .monitorPanel-right {
        .monitorPanel-data {
            font-size: calc(var(--font-size-scale) * 12px);
            color: #fff;

            .count {
                cursor: pointer;
            }
        }

        .monitorPanel-line {
            width: 63px;
            height: 2px;
            background: linear-gradient(100deg, #2989FF 0%, rgba(41, 137, 255, 0) 100%);
        }

        .monitorPanel-name {
            margin-top: 10px;
            font-size: calc(var(--font-size-scale) * 12px);
            font-family: Source Han Sans CN-Regular, Source Han Sans CN;
            font-weight: 400;
            color: #ABB8CB;
        }
    }
}
</style>