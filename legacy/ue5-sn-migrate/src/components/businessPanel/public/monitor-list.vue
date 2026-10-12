<template>
    <div class="monitor">
        <div class="monitorBox" v-for="item in monitorData" @click="emit('item-click',item)">
            <div class="monitorList">
                <div class="monitorColor" :style="{ background: item.color }"></div>
                <div> {{ item.name }} </div>
            </div>
            <div>
                {{ item.value }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted } from 'vue'
interface list {
    name: string;
    color: string;
    value: number;
}
interface Props {
    monitorData: list[];
}
const props = withDefaults(defineProps<Props>(), {});
const emit = defineEmits(['item-click'])
</script>
<style scoped lang="less">
.monitor {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;

    .monitorBox {
        width: 70px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #fff;

        .monitorList {
            display: flex;
            align-items: center;

            .monitorColor {
                width: 10px;
                height: 10px;
                background: #2AE8BD;
                margin-right: 5px;
            }
        }
    }
}</style>