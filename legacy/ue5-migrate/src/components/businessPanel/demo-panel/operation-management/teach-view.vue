<template>
    <div class="teachBox" v-for="item in contentList" :key="item.name">
        <VisitingDataPic class="teachBox-left" :img="getAssetsImage(item.img)" />
        <div class="teachBox-right">
            <div>{{ item.name }}</div>
            <div>
                <count-to :startVal="0" :endVal="item.value" :duration="2000" separator="" decimals="0"></count-to>
                <span>{{ item.unit }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted } from 'vue'
import VisitingDataPic from "@/components/businessPanel/triage-queue/components/visiting-data-pic.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { getAssetsImage } from '@/utils/getImage';
interface list {
    name: string;
    value: number;
    img: string;
    unit: string;
}
interface Props {
    contentList: list[];
}
const props = withDefaults(defineProps<Props>(), {});
</script>
<style scoped lang="less">
.teachBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 15px;

    .teachBox-left {
        // width:114px;
    }

    .teachBox-right {
        background: url('/resource/v1/ue5-migrate/assets/images/overView42.png');
        width: 244px;
        height: 50px;
        background-repeat: no-repeat;
        background-size: 100% 100%;
        font-size: 14px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
     :deep(.gh-count-to){
        font-size: 18px;
     }
        span {
            font-size: 12px;
        }
    }
}</style>