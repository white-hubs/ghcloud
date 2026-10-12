<template>
    <div class="eventList">
        <div class="eventBox" v-for="(item, index) in props.alarmList" :key="index">
            <div class="eventBox-left">{{ item.time }}</div>
            <img class="eventBox-centre" :src="getAssetsImage(props.typeList[item.levels])">
            <div class="eventBox-right">
                <div class="info-panel-triple"></div>
                <div>
                    <div>{{ item.type }}</div>
                    <div>{{ item.content }}</div>
                </div>
                <div :class="[item.status ? 'success' : 'warn']">{{ item.status ? '已确认' : '待确认' }}</div>
            </div>
            <div v-show="index !== alarmList.length - 1" class="line"></div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { getAssetsImage } from "../../../../utils/getImage";
interface list {
    time: string,
    levels: number,
    type: string,
    content: string,
    status: string
}
interface Props {
    typeList: object;
    alarmList: list[];
}
const props = withDefaults(defineProps<Props>(), {});

</script>
<style lang="less" scoped>
.eventList {
    .eventBox {
        display: flex;
        color: #fff;
        align-items: center;
        font-size: 12px;
        justify-content: space-between;
        margin-top: 4px;
        position: relative;
        height: 64px;

        .eventBox-left {
            width: 68px;
            height: 34px;
            font-size: 12px;
            font-weight: normal;
            color: #FFFFFF;
            line-height: 17px;
            text-align: center;
        }

        .eventBox-centre {
            width: 30px;
            height: 30px;
        }

        .eventBox-right {
            width: 215px;
            height: 41px;
            background: rgba(255, 255, 255, 0.1);
            box-shadow: inset 0px 2px 2px 0px rgba(255, 255, 255, 0.25), inset 0px -2px 2px 0px rgba(255, 255, 255, 0.25);
            border-radius: 0px 0px 0px 0px;
            opacity: 1;
            display: flex;
            align-items: center;
            padding: 0 5px 0 11px;
            justify-content: space-between;
            position: relative;

            .info-panel-triple {
                width: 0;
                height: 0;
                border: 8px solid transparent;
                border-bottom-color: hsla(255, 255, 255, 0.1);
                position: absolute;
                left: -16px;
                top: 11px;
                transform: rotate(-90deg);
            }
        }

        .line {
            width: 1px;
            height: 19px;
            border: 1px solid #FFFFFF;
            position: absolute;
            top: 48px;
            left: 98px;
        }
    }
}
</style>