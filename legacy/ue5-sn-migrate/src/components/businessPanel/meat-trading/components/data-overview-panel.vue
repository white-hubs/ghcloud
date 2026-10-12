<template>
    <div class="dataPanel-wrap">
        <div v-for="item in overviewData">
            <div class="dataPanel">
                <div class="dataPanel-left">
                    <div class="bg">
                        <img :src="getAssetsImage(item.imgPath)" alt="" />
                    </div>
                </div>
                <div class="dataPanel-right">
                    <div class="monitorPanel-data">
                        <div class="monitorPanel-name">{{ item.name }}</div>
                        <div class="monitorPanel-num">
                            <CountTo class="count" @click="handelClick" :startVal="0" :endVal="item.value" :duration="2000"
                                separator="" />
                            <span class="unit">{{ item.unit }}</span>
                        </div>
                    </div>
                </div>
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
    unit: string;
}
interface Props {
    overviewData: data[]
}
const emit = defineEmits(["handelClickItemize"]);
const props = withDefaults(defineProps<Props>(), {
});
const handelClick = (item) => {
    emit("handelClickItemize", item);
};
</script>
<style scoped lang="less">
.dataPanel-wrap{
    display: flex;
    align-items: center;
    justify-content: space-around;
}
.dataPanel {
    display: flex;
    align-items: center;
    .dataPanel-left {
        .bg {
            position: relative;
            width: 64px;
            height: 64px;
            perspective: 200;

            img {
                width: 100%;
                height: 100%;
            }
        }
    }

    .dataPanel-right {
        .monitorPanel-data {
            font-size: 24px;
            color: #fff;
            margin: 10px 0;
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
            font-size: 14px;
            font-family: Source Han Sans CN-Regular, Source Han Sans CN;
            font-weight: 400;
            color: #fff;
        }
        .unit{
            font-size: 14px;
            display: inline;
            margin-left: 1px;
        }
        .monitorPanel-num{
            display: flex;
            align-items: center;
        }
    }
}
</style>