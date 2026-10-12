<template>
    <div class="trafficList">
        <div class="trafficBox">
            <div class="trafficBoxLfet">
                <div class="icon" :style="{ background: props.trafficInfo.color }"></div>
                <div>{{ props.trafficInfo.label }}</div>
            </div>
            <span class="trafficBoxRight">{{ props.trafficInfo.value }}{{props.unit }}</span>
        </div>
    </div>
</template>
<script lang="ts" setup>
interface data {
    color: string,
    label: string,
    value: number|string,
}
interface Props {
    trafficInfo: data
    unit?:string
}
const props = withDefaults(defineProps<Props>(), {});
</script>
<style lang="less" scoped>
.trafficList {

    .trafficBox {
        width: 162px;
        height: 55px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 0px 0px 0px 0px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px 0 10px;

        .trafficBoxLfet {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            color: #fff;

            .icon {
                width: 8px;
                height: 8px;
                background: #2989FF;
                border-radius: 50%;
                margin-right: 6px;
            }
        }

        .trafficBoxRight {
            font-size: 24px;
            color: #fff;
        }

    }
}
</style>