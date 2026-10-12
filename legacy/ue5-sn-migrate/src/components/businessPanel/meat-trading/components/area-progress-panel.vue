<template>
    <div class="dataPanel" v-for="item in overviewData">
        <div class="top">
            <div class="text">
                <span class="name">{{ item.statistic.name }}</span>
                （<CountTo :startVal="0" :endVal="item.statistic.total" :duration="2000" separator="" />）㎡
                <a-progress :percent="item.statistic.ratio" :strokeWidth="5" :stroke-color="'#FFAB10'" trailColor="rgba(255, 255, 255, 0.3)" />
            </div>
            <a class="link" @click="detile(item)">详情</a>
        </div>
        <div class='count'>
            <div class='item'>
                <img :src="getAssetsImage(item.buildData.imgPath)" alt="" />
                <div class='text'>
                    <span class='name'>楼栋数量</span>
                    <div class='num'>
                        <CountTo :startVal="0" :endVal="item.buildData.total" :duration="2000" separator="" /> 栋
                    </div>
                </div>
            </div>
            <div class='item'>
                <img :src="getAssetsImage(item.businessData.imgPath)" alt="" />
                <div class='text'>
                    <span class='name'>商户数量</span>
                    <div class='num'>
                        <CountTo :startVal="0" :endVal="item.businessData.total" :duration="2000" separator="" /> 栋
                    </div>
                </div>
            </div>
        </div>
        <div class='info'>
            <div class='item'>
                <div class="cell">
                    <img :src="getAssetsImage(item.buildData.imgPath)" alt="" />
                    <span class='name'>档位：</span>
                    <div class='num'>
                        <CountTo :startVal="0" :endVal="item.buildData.total" :duration="2000" separator="" /> 个
                    </div>
                </div>
                <div class="cell">
                    <span class='name'>已租：</span>
                    <div class='num'>
                        <CountTo :startVal="0" :endVal="item.buildData.rented" :duration="2000" separator="" />
                    </div>
                </div>
                <div class="cell">
                    <span class='name'>未租：</span>
                    <div class='num'>
                        <CountTo :startVal="0" :endVal="item.buildData.UnRent" :duration="2000" separator="" />
                    </div>
                </div>
                <a class="link" @click="detile(item)">详情</a>
            </div>
            <div class='item'>
                <div class="cell">
                    <img :src="getAssetsImage(item.businessData.imgPath)" alt="" />
                    <span class='name'>档位：</span>
                    <div class='num'>
                        <CountTo :startVal="0" :endVal="item.businessData.total" :duration="2000" separator="" /> 个
                    </div>
                </div>
                <div class="cell">
                    <span class='name'>在线：</span>
                    <div class='num'>
                        <CountTo :startVal="0" :endVal="item.businessData.online" :duration="2000" separator="" />
                    </div>
                </div>
                <div class="cell">
                    <span class='name'>离线：</span>
                    <div class='num'>
                        <CountTo :startVal="0" :endVal="item.businessData.offline" :duration="2000" separator="" />
                    </div>
                </div>
                <a class="link" @click="detile(item)">详情</a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getAssetsImage } from "@/utils/getImage";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { AreaProgressData } from '../../public/types'

const props = withDefaults(defineProps<{
    overviewData: AreaProgressData[];
}>(), {
    overviewData: () => [],
})
const emit = defineEmits(["detaile"]);
const detile = (item) => {
    emit("detaile", item);
};
</script>
<style scoped lang="less">
.dataPanel {
    color: #fff;
    margin-bottom: 20px;
    .top{
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1px 8px;
        background: rgba(41,137,255,0.2);
        font-family: PingFang SC-Semibold, PingFang SC;
        line-height: 14px;
        .text{
            flex:1;
            color: #FFFFFF;
            font-size: 12px;
            font-family: PingFang SC-Regular, PingFang SC;
            font-weight: 400;
        }
        .name{
            padding-left: 10px;
            font-size: 14px;
            color: #FFFFFF;
            font-weight: 600;
            position: relative;
            &::after{
                position: absolute;
                content: '';
                width: 4px;
                height: 4px;
                border-radius: 100%;
                background: #FFAB10;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
            }
        }

    }
    .link{
        font-size: 12px;
        color: #2989FF;
        position: relative;
        padding-right: 10px;
        cursor: pointer;
        &::after{
            position: absolute;
            content: '';
            display: inline-block;
            border:  5px solid ;
            border-color: transparent transparent transparent  #2989FF;
            right: -5px;
            top: 4px;
        }
    }
    .count{
        margin: 15px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding-bottom: 20px;
        &::after{
            position: absolute;
            content: '';
            display: inline-block;
            width: 100%;
            left: 0;
            bottom: 0;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .item{
            display: flex;
            align-items: center;
            img{
                width: 32px;
                height: 32px;
            }
            .text{
                margin-left: 6px;
                .name{
                    font-size: 14px;
                    font-family: PingFang SC-Regular, PingFang SC;
                    font-weight: 400;
                    color: #FFFFFF;
                    margin-bottom: 6px;
                    display: inline-block;
                }
                .num{
                    font-size: 12px;
                    font-family: PingFang SC-Regular, PingFang SC;
                    font-weight: 400;
                    color: #FFFFFF;
                    line-height: 14px;
                    :deep(.gh-count-to) {
                        font-size: 24px;
                        font-family: DINAlternate-Bold-Regular, DINAlternate-Bold;
                        font-weight: 400;
                        color: #2989FF;
                    }
                }
            }
        }
    }
    .info{

        .item{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
            .cell{
            display: flex;
            align-items: center;
                img{
                    width: 16px;
                    height: 16px;

                }
                .name{
                    font-size: 14px;
                    font-family: PingFang SC-Regular, PingFang SC;
                    font-weight: 400;
                    color: #FFFFFF;
                }
                .num{
                    font-size: 12px;
                    font-family: PingFang SC-Regular, PingFang SC;
                    font-weight: 400;
                    color: #FFFFFF;
                    :deep(.gh-count-to) {
                        font-size: 16px;
                        font-family: DINAlternate-Bold-Regular, DINAlternate-Bold;
                        font-weight: 400;
                        color: #fff;
                    }
                }
            }
        }
            
        .link{
            font-size: 12px;
            color: #2989FF;
            position: relative;
            padding-right: 10px;
            cursor: pointer;
            &::after{
                right: -5px;
                top: 6px;
            }
        }
    }

}

:deep(.ant-progress) {
    width: 84px;
    margin-left: 10px;
    .ant-progress-text {
        color: #FFFFFF;
        font-size: 12px;
        font-family: PingFang SC-Regular, PingFang SC;
        font-weight: 400;
    }
}
:deep(.gh-count-to) {
    // font-size: 14px;
    color: #FFFFFF;
    font-family: PingFang SC-Semibold, PingFang SC;
    font-weight: 600;
}
</style>