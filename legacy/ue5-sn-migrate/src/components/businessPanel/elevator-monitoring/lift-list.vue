<template>
    <div class="liftBox" v-for="item in elevatorStatistics" :key="item.name">
        <div class="liftBox-left">
            <div class="liftBox-text ">{{ item.name }}</div>
            <div class="liftBox-data aniamtion-floating">{{ item.total }}</div>
            <img :src="getAssetsImage('overView17.png')" alt="">
        </div>
        <div class="liftBox-right">
            <div class="liftBox-righ-list">
                <div class="liftBox-righ-box">
                    <div class="liftBox-righ-color"></div>
                    <div class="liftBox-righ-title">正常数</div>
                </div>
                <div class="liftBox-righ-data">{{ item.normalValue }}</div>
            </div>
            <div class="liftBox-righ-list">
                <div class="liftBox-righ-box">
                    <div class="liftBox-righ-color" style="background-color: #D0DEEE;"></div>
                    <div class="liftBox-righ-title">停用数</div>
                </div>
                <div class="liftBox-righ-data" style="color: #D0DEEE;"> {{ item.DeactivateValue }}</div>
            </div>
            <div class="liftBox-righ-list">
                <div class="liftBox-righ-box">
                    <div class="liftBox-righ-color" style="background-color: #FFC700;"></div>
                    <div class="liftBox-righ-title">故障数</div>
                </div>
                <div class="liftBox-righ-data" style="color: #FFC700;"> {{ item.faultValue }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getAssetsImage } from "../../../utils/getImage";
import { ref, reactive, toRefs, onMounted } from 'vue'
interface data {
    name: string,
    total: number,
    normalValue: number,
    DeactivateValue: number,
    faultValue: number,
}
interface Props {
    elevatorStatistics: data[]
}
const props = withDefaults(defineProps<Props>(), {})

</script>
<style scoped lang="less">
.liftBox {
    padding: 0 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .liftBox-left {
        width: 82px;
        height: 90px;
        position: relative;
        color: #fff;

        img {
            width: 82px;
            height: 90px;
            position: absolute;
            top: 8px
        }

        .liftBox-text {
            text-align: center;
            position: absolute;
            width: 82px;
            height: 22px;
            background: linear-gradient(270deg, rgba(41, 112, 255, 0) 0%, rgba(41, 112, 255, 0.7) 54%, rgba(41, 112, 255, 0) 100%);
            font-size: 12px;
        }

        .liftBox-data {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
            width: 31px;
            height: 20px;
            text-align: center;
            // transform: translate(-50%, -50%);
            font-size: 22px;
            font-family: YouSheBiaoTiHei-Bold, YouSheBiaoTiHei;
            color: #FFFFFF;
            line-height: 20px;
            z-index: 10;
        }
    }

    .liftBox-right {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        width: 200px;

        .liftBox-righ-list {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 85px;
            margin-top: 10px;

            .liftBox-righ-box {
                display: flex;
                align-items: center;

                .liftBox-righ-color {
                    width: 6px;
                    height: 6px;
                    background: #35D93D;
                    border-radius: 50%;
                    margin-right: 5px;
                }

                .liftBox-righ-title {
                    color: #D0DEEE;
                    font-size: 12px;
                }
            }

            .liftBox-righ-data {
                font-size: 16px;
                font-family: YouSheBiaoTiHei-Bold, YouSheBiaoTiHei;
                font-weight: 400;
                color: #35D93D;
                line-height: 20px;
            }
        }
    }
}
</style>