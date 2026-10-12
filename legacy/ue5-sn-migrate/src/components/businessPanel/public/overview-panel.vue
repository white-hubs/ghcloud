<template>
    <div class="overViewList">
        <div class="overViewBox">
            <div class="overViewBox-left">
                <div class="overViewBox-data">
                    <CountTo v-if="typeof overPanelData.panelData1 == 'number'" :startVal="0"
                        :endVal="overPanelData.panelData1" :duration="2000" separator="" />
                    <span v-else>
                        {{ overPanelData.panelData1 }}
                    </span>
                </div>
                <div v-if="overPanelData.panelRatio1" class="ringRatio">
                    <span>环比</span>
                    <!-- uptriangle 向上三角根据Prop改变 -->
                    <div :class="['downtriangle', overPanelData.panelRatio1 > 0 && 'uptriangle']"></div>
                    <div :class="[overPanelData.panelRatio1 > 0 ? 'up' : 'down']">{{ overPanelData.panelRatio1 + "%" }}
                    </div>
                </div>
                <div class="overViewBox-line">
                </div>
                <div class="overViewBox-name">
                    {{ overPanelData.panelName1 }}
                    <CountTo v-if="overPanelData.rightNum1" :startVal="0"
                        :endVal="overPanelData.rightNum1" :duration="2000" separator="" />
                </div>
            </div>
            <div class="overViewBox-right">
                <img :src="getAssetsImage(overPanelData.panelImg1)" alt="">
            </div>
        </div>
        <div class="overViewBox" style="transform: rotateY(180deg);">
            <div class="overViewNest" style="transform: rotateY(180deg);">
                <div class="overViewBox-left">
                    <img :src="getAssetsImage(overPanelData.panelImg2)" alt="">
                </div>
                <div class="overViewBox-right">
                    <div class="overViewBox-data">
                        <CountTo v-if="typeof overPanelData.panelData2 == 'number'" :startVal="0"
                            :endVal="overPanelData.panelData2" :duration="2000" separator="" />
                        <span v-else>
                            {{ overPanelData.panelData2 }}
                        </span>
                    </div>
                    <div v-if="overPanelData.panelRatio2" class="ringRatio">
                        <span>环比</span>
                        <!-- uptriangle 向上三角根据Prop改变 -->
                        <div :class="['downtriangle', overPanelData.panelRatio2 > 0 && 'uptriangle']"></div>
                        <div :class="[overPanelData.panelRatio2 > 0 ? 'up' : 'down']">{{ overPanelData.panelRatio2 + "%" }}
                        </div>
                    </div>
                    <div class="overViewBox-line">
                    </div>
                    <div class="overViewBox-name">
                        {{ overPanelData.panelName2 }}
                        <CountTo v-if="overPanelData.rightNum2" :startVal="0"
                            :endVal="overPanelData.rightNum2" :duration="2000" separator="" />
                    </div>
                </div>
            </div>
        </div>
        <div class="overViewBox" style="transform: rotateX(180deg)">
            <div class="overViewNest" style="transform: rotateX(180deg)">
                <div class="overViewBox-left">
                    <div class="overViewBox-data">
                        <CountTo v-if="typeof overPanelData.panelData3 == 'number'" :startVal="0"
                            :endVal="overPanelData.panelData3" :duration="2000" separator="" />
                        <span v-else>
                            {{ overPanelData.panelData3 }}
                        </span>
                    </div>
                    <div v-if="overPanelData.panelRatio3" class="ringRatio">
                        <span>环比</span>
                        <!-- uptriangle 向上三角根据Prop改变 -->
                        <div :class="['downtriangle', overPanelData.panelRatio3 > 0 && 'uptriangle']"></div>
                        <div :class="[overPanelData.panelRatio3 > 0 ? 'up' : 'down']">{{ overPanelData.panelRatio3 + "%" }}
                        </div>
                    </div>
                    <div class="overViewBox-line">
                    </div>
                    <div class="overViewBox-name">
                        {{ overPanelData.panelName3 }}
                        <CountTo v-if="overPanelData.rightNum3" :startVal="0"
                            :endVal="overPanelData.rightNum3" :duration="2000" separator="" />
                    </div>
                </div>
                <div class="overViewBox-right" style="align-self:flex-end">
                    <img :src="getAssetsImage(overPanelData.panelImg3)" alt="">
                </div>
            </div>
        </div>
        <div class="overViewBox" style="transform:rotate(180deg);">
            <div class="overViewNest" style="transform:rotate(180deg);">
                <div class="overViewBox-left" style="align-self:flex-end">
                    <img :src="getAssetsImage(overPanelData.panelImg4)" alt="">
                </div>
                <div class="overViewBox-right">
                    <div class="overViewBox-data">
                        <CountTo v-if="typeof overPanelData.panelData4 == 'number'" :startVal="0"
                            :endVal="overPanelData.panelData4" :duration="2000" separator="" />
                        <span v-else>
                            {{ overPanelData.panelData4 }}
                        </span>
                    </div>
                    <div v-if="overPanelData.panelRatio4" class="ringRatio">
                        <span>环比</span>
                        <!-- uptriangle 向上三角根据Prop改变 -->
                        <div :class="['downtriangle', overPanelData.panelRatio4 > 0 && 'uptriangle']"></div>
                        <div :class="[overPanelData.panelRatio4 > 0 ? 'up' : 'down']">{{ overPanelData.panelRatio4 + "%" }}
                        </div>
                    </div>
                    <div class="overViewBox-line">
                    </div>
                    <div class="overViewBox-name">
                        {{ overPanelData.panelName4 }}
                        <CountTo v-if="overPanelData.rightNum4" :startVal="0"
                            :endVal="overPanelData.rightNum4" :duration="2000" separator="" />
                    </div>
                </div>
            </div>
        </div>
        <div class="contentPie"></div>
        <div class="contentPie1"></div>
        <img class="bgImg aniamtion-rotate" :src="getAssetsImage('overView23.png')" alt="">
        <!-- <img  :src="getAssetsImage(imgPath)" alt=""> -->
        <div class="central-circle">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getAssetsImage } from '@/utils/getImage';
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { ref } from 'vue';
const chainRatio = ref(0)
interface data {
    panelData1: string | number;
    panelImg1: string;
    panelRatio1: number;
    panelName1: string;
    rightNum1?: number;

    panelData2: string | number;
    panelImg2: string;
    panelRatio2: number;
    panelName2: string;
    rightNum2?: number;

    panelData3: string | number;
    panelImg3: string;
    panelRatio3: number;
    panelName3: string;
    rightNum3?: number;

    panelData4: string | number;
    panelImg4: string;
    panelRatio4: number;
    panelName4: string;
    rightNum4?: number;
}
interface Props {
    overPanelData: data
}
const props = withDefaults(defineProps<Props>(), {
});
</script>
<style scoped lang="less">
.overViewList {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    position: relative;
    height: 210px;
    padding: 0 2px;

    .overViewBox {
        width: 166px;
        height: 92px;
        background-image: url('/resource/v1/ue5-sn-migrate/assets/images/overView22.png');
        background-repeat: no-repeat;
        background-size: 100% 100%;
        display: flex;
        justify-content: space-between;
        padding: 10px 15px;

        .overViewNest {
            display: flex;
            justify-content: space-between;
            width: 100%;
        }

        .overViewBox-name {
            font-size: 12px;
            color: #ABB8CB;
        }

        .overViewBox-name {
            border-top: 1px solid;
            border-image: linear-gradient(282deg, rgba(255, 255, 255, 0.15000000596046448), rgba(255, 255, 255, 0)) 1 1;
        }


        .ringRatio {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;

            span {
                font-size: 12px;
                color: #D0DEEE;
            }

            .downtriangle {
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-bottom: 8px solid #d2fff3;
                margin: 0 3px;
                transform: rotate(180deg);
            }

            .uptriangle {
                border-bottom: 8px solid #ffcece;
                transform: rotate(0deg);
            }

            .down {
                color: #2ae8bd;
                font-family: Roboto-Regular, Roboto;
            }

            .up {
                color: #f14545;
                font-family: Roboto-Regular, Roboto;
            }
        }

        .overViewBox-data {
            font-size: 22px;
            font-family: Roboto-Regular, Roboto;
            font-weight: 400;
            color: #FFFFFF;
        }

        img {
            width: 24px;
            height: 24px;
        }
    }

    .contentPie {
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        width: 112px;
        height: 112px;
        border: 12px solid rgba(255, 255, 255, 0.04);
    }

    .contentPie1 {
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        width: 76px;
        height: 76px;
        border: 8px solid rgba(255, 255, 255, 0.04);
    }

    .bgImg {
        position: absolute;
        width: 76px;
        height: 76px;
        top: 50%;
        left: 50%;
        margin-top: -38px;
        margin-left: -38px;
    }

    .central-circle {
        width: 26px;
        height: 26px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
}
</style>
