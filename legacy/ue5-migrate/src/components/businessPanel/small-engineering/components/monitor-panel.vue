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
                <div class="monitorPanel-value">
                    <CountTo class="count" @click="handelClick" :startVal="0" :endVal="monitorPanelData.value"
                        :duration="2000" separator="" />
                    <div :class="[monitorPanelData.ratio > 0 ? 'up' : 'down']">{{ monitorPanelData.ratio || 0 + "%" }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getAssetsImage } from "@/utils/getImage";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { ref, reactive, toRefs, onMounted } from 'vue'
interface data {
    imgPath: string;
    value: number;
    ratio?: number;
    name: string;
}
interface Props {
    monitorPanelData: data
}
const emit = defineEmits(["handelClickItemize"]);
const props = withDefaults(defineProps<Props>(), {
});
const handelClick = () => {
    emit("handelClickItemize", props.monitorPanelData);
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
            .monitorPanel-value{
                display: flex;
                justify-content: space-between;
                align-items: center;
                .count {
                    cursor: pointer;
                }
    
                .down {
                    color: #2ae8bd;
                    font-family: Roboto-Regular, Roboto;
                    font-size: 12px;
                }
    
                .up {
                    color: #f14545;
                    font-family: Roboto-Regular, Roboto;
                    font-size: 12px;
                }
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
    }
}
</style>