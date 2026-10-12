<template>
    <div class="faultBox" v-for="item in data" :key="item.name">
        <div class="faultBox-left">
            <span class="faultBox-data" :style="{ backgroundColor: item.color }"></span>
            <span class="faultBox-value">{{ item.name }}</span>
        </div>
        <div class="faultBox-right">
            <CountTo :startVal="0" :endVal="item.value" :duration="2000" separator="" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted } from 'vue'
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";

interface List {
    color: string;
    name: string;
    value: number;
}
interface Props {
    data: List[]
}
const props = defineProps<Props>();
</script>
<style scoped lang="less">
.faultBox {
    width: 154px;
    height: 70px;
    background: rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    margin-bottom: 20px;

    span {
        display: inline-block;
    }

    .faultBox-data {
        width: 8px;
        height: 8px;
        background: #2989FF;
        border-radius: 50%;
        display: inline-block;
        margin-right: 5px;
    }

    .faultBox-value {
        font-size: 12px;
        color: #D0DEEE;
    }

    .faultBox-right {
        font-size: 20px;
        font-family: Source Han Sans CN-Medium, Source Han Sans CN;
        font-weight: 500;
        color: #FFFFFF;
    }

}
</style>