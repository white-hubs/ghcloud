<template>
    <div class="overViewList">
        <div class="overViewBox">
            <div class="overViewBox-left">
                <div class="overViewBox-name">
                    {{ overPanelData.panelName1 }}
                </div>
                <div class="overViewBox-line">
                </div>
                <div class="overViewBox-data">
                    <span>
                        {{ overPanelData.panelData1 }}
                    </span>
                    <div class="ringRatio">
                        <div :class="[overPanelData.panelRatio1 > 0 ? 'up' : 'down']">{{ overPanelData.panelRatio1 + "%"
                            }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="overViewBox" style="transform: rotateY(180deg);">
            <div class="overViewNest" style="transform: rotateY(180deg);">
                <div class="overViewBox-right right">
                    <div class="overViewBox-name">
                        {{ overPanelData.panelName2 }}
                        <CountTo v-if="overPanelData.rightNum2" :startVal="0" :endVal="overPanelData.rightNum2"
                            :duration="2000" separator="" />
                    </div>
                    <div class="overViewBox-line">
                    </div>
                    <div class="overViewBox-data">
                        <span>
                            {{ overPanelData.panelData2 }}
                        </span>
                        <div class="ringRatio">
                            <div :class="[overPanelData.panelRatio2 > 0 ? 'up' : 'down']">{{ overPanelData.panelRatio2 +
                                "%"
                                }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="overViewBox" style="transform: rotateX(180deg)">
            <div class="overViewNest" style="transform: rotateX(180deg)">
                <div class="overViewBox-left">
                    <div class="overViewBox-name">
                        {{ overPanelData.panelName3 }}
                        <CountTo v-if="overPanelData.rightNum3" :startVal="0" :endVal="overPanelData.rightNum3"
                            :duration="2000" separator="" />
                    </div>


                    <div class="overViewBox-line">
                    </div>
                    <div class="overViewBox-data">
                        <span>
                            {{ overPanelData.panelData3 }}
                        </span>
                        <div class="ringRatio">
                            <div :class="[overPanelData.panelRatio3 > 0 ? 'up' : 'down']">{{
                                overPanelData.panelRatio3 + "%"
                                }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="overViewBox" style="transform:rotate(180deg);">
            <div class="overViewNest" style="transform:rotate(180deg);">
                <div class="overViewBox-right right">

                    <div class="overViewBox-name">
                        {{ overPanelData.panelName4 }}
                        <CountTo v-if="overPanelData.rightNum4" :startVal="0" :endVal="overPanelData.rightNum4"
                            :duration="2000" separator="" />
                    </div>

                    <div class="overViewBox-line">
                    </div>
                    <div class="overViewBox-data">
                        <span>
                            {{ overPanelData.panelData4 }}
                        </span>
                        <div class="ringRatio">
                            <div :class="[overPanelData.panelRatio4 > 0 ? 'up' : 'down']">{{ overPanelData.panelRatio4 +
                                "%"
                                }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="contentPie"></div>
        <div class="contentPie1">
            <div class="contentPie-value">{{ overPanelData.total }}</div>
            <div class="contentPie-rate">同比
                <span :class="[overPanelData.rate > 0 ? 'up' : 'down']">
                    {{ overPanelData.rate }}%
                </span>
            </div>
            <div class="contentPie-title">{{ overPanelData.tittle }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getAssetsImage } from '@/utils/getImage';
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { ref } from 'vue';
const chainRatio = ref(0)
interface data {
    tittle: string;
    rate:number;
    total: number;

    panelData1: string | number;
    panelRatio1: number;
    panelName1: string;
    rightNum1?: number;

    panelData2: string | number;
    panelRatio2: number;
    panelName2: string;
    rightNum2?: number;

    panelData3: string | number;
    panelRatio3: number;
    panelName3: string;
    rightNum3?: number;

    panelData4: string | number;
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
    height: 120px;
    padding: 0 2px;

    .overViewBox {
        width: 150px;
        height: 55px;
        background-image: url('/resource/v1/ue5-migrate/assets/images/overView97.png');
        background-repeat: no-repeat;
        background-size: 100% 100%;
        display: flex;
        justify-content: space-between;
        padding: 10px 15px;

        .overViewNest {
            display: flex;
            justify-content: space-between;
            width: 100%;
            position: relative;

            .right {
                position: absolute;
                right: 0;
            }
        }

        .overViewBox-name {
            color: #D0DEEE;
            font-size: 12px;
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
        }

        .overViewBox-data {
            font-size: 16px;
            font-family: Roboto-Regular, Roboto;
            font-weight: 400;
            color: #FFFFFF;
            display: flex;

            .ringRatio {
                margin-left: 10px;
            }
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
        border: 2px solid #4A667E;
    }

    .contentPie1 {
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        width: 100px;
        height: 100px;
        background-image: url('/resource/v1/ue5-migrate/assets/images/overView98.png');
        background-repeat: no-repeat;
        background-size: 100% 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .contentPie-value {
            font-size: 25px;
            color: #fff;
            font-weight: Regular;
        }

        .contentPie-rate {
            font-size: 11px;
            color: #fff;
        }

        .contentPie-title {
            font-size: 12px;
            color: #d0deee;
        }
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

}

.down {
    color: #2ae8bd;
    font-family: Roboto-Regular, Roboto;
}

.up {
    color: #f14545;
    font-family: Roboto-Regular, Roboto;
}
</style>
