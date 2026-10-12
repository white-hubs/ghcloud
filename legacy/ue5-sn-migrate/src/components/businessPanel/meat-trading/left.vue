<template>
    <div class="panel">
        <SubPanelTemplate title="市场简介">
            <div class="hospitalInfo">
                <img v-if="tenantData.logo" :src="tenantData.logo.path" alt="">
                <div class="hospitalInfo-text">
                    <div class="hospitalInfo-title"></div>
                    <div class="scroll_box">
                        <div class="scroll-text">
                            {{ tenantData.remark }}
                        </div>
                    </div>
                </div>
            </div>
        </SubPanelTemplate>
    </div>
</template>

<script setup lang="ts">
import { TenantType } from '@/api/models/ouaa'
import { getTenantInfo } from '@/api/ouaa'
import { getNowEnterprise } from '@/utils/auth'
import { reactive,onMounted } from 'vue'


const tenantData = reactive<TenantType>({
    address: '',
    areaCovered: 0,
    building: 0,
    code: '',
    files: [],
    id: '',
    location: '',
    logo: {
        id: '',
        name: '',
        path: '',
        size: '',
        suffix: ''
    },
    name: '',
    remark: ''
})


onMounted(async ()=>{
    let res = await getTenantInfo(getNowEnterprise().code)
    Object.assign(tenantData, res)
})
</script>
<style scoped lang="less">
.hospitalInfo {
    padding: 10px;

    img {
        max-width: 344px;
        width: 100%;
        height: 194px;
    }

    .hospitalInfo-text {
        color: #fff;
        text-align: center;

        .hospitalInfo-title {
            margin: 5px 0;
            font-size: 14px;
        }

        .scroll_box {
            text-align: left;
            overflow: hidden;

            .scroll-text {
                animation: scroll 10s linear infinite;
                color: #D9E7FF;
                font-size: 16px;
                text-indent: 32px;
            }
        }
    }
}


.chart {
    width: 160px;
    height: 160px;
    margin: auto;
}

.deviceList {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;
    padding: 0 10px;

    .deviceBox {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 150px;
        height: 24px;
        background: rgba(142, 172, 206, 0.1);
        margin-bottom: 8px;
        padding: 0 10px;

        .deviceBox_left {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .deviceBox_color {
            display: inline-block;
            width: 10px;
            height: 10px;
        }

        .deviceBox_name {
            color: #D0DEEE;
            font-size: 12px;
            margin-left: 5px;
        }

        .deviceBox_right {
            color: #FFFFFF;
            font-size: 16px;
        }
    }
}

.deviceTypeList {
    height: 250px;
    overflow-y: auto;


    .deviceTypeBox {
        width: 336px;
        height: 40px;
        background-image: url("/resource/v1/ue5-sn-migrate/assets/images/overView48.png");
        background-repeat: no-repeat;
        background-size: 100% 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px;
        margin-bottom: 10px;

        .deviceTypeBox_left {
            display: flex;
            align-items: center;

            .iconStyle {
                font-size: 26px;
                color: #A6CFFF;
            }

            span {
                font-size: 14px;
                color: #D0DEEE;
                text-align: center;
                padding-left: 10px;
                display: inline-block;
                border-left: 1px dashed rgba(255, 255, 255, 0.3);
            }
        }

        .deviceTypeBox_right {
            color: #fff;
            font-size: 18px;

            span {
                font-size: 12px;
            }
        }
    }
}

::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    /* 设置滚动条的宽度 */
}
</style>