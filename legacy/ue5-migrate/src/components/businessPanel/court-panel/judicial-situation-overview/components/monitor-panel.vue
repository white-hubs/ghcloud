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
                <div class="monitorPanel-name">{{ monitorPanelData.name }}</div>
                <div class="monitorPanel-line"></div>
                <div class="monitorPanel-count">
                    <span>{{ monitorPanelData.value }}</span>
                    <span class="unit">{{ monitorPanelData.unit }}</span>
                </div>
            </div>
            <div class="ringRatio" v-if="monitorPanelData.chainRatio">
                <span>环比</span>
                <!-- <div :class="['downtriangle', monitorPanelData.chainRatio > 0 && 'uptriangle']"></div> -->
                <div :class="[monitorPanelData.chainRatio > 0 ? 'up' : 'down']">{{ monitorPanelData.chainRatio + "%" }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getAssetsImage } from "@/utils/getImage";
interface data {
    imgPath: string;
    value: string;
    name: string;
    unit: string;
    chainRatio?:number;
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
            width: 100px;
            height: 80px;
            perspective: 200;

            img {
                width: 100%;
                height: 100%;
            }

            .rotate {
                position: absolute;
                width: 35px;
                height: 35px;
                left: 35px;
                top: 8px;
                transform: rotateY(45deg);
            }
        }
    }

    .monitorPanel-right {
        .monitorPanel-data {
            font-size: 16px;
            color: #fff;
            height: 80px;
            display: flex;
            flex-direction: column;
            justify-content: space-around;

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
            font-size: 12px;
            font-family: Source Han Sans CN-Regular, Source Han Sans CN;
            font-weight: 400;
            color: #ABB8CB;
        }

        .monitorPanel-count {
            font-size: 18px;
            color: #fff;
            display: flex;
            align-items: center;

            .unit {
                font-size: 12px;
                margin-left: 2px;
                align-self: flex-end;
            }
        }
    }
}

.ringRatio {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #fff;

    .down {
        color: #2ae8bd;
        margin-left: 2px;
        font-family: Roboto-Regular, Roboto;
    }

    .up {
        color: #f14545;
        margin-left: 2px;
        font-family: Roboto-Regular, Roboto;
    }
}
</style>