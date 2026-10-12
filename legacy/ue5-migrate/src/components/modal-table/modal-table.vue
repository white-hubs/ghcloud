<template>
    <Modal :title="title" :show="showModal">
        <div class="modal-layout">
            <template v-if="(selectItem && selectItem.length)">
                <div class="table-top">
                    <Form 
                        ref="selectForm"
                        name="select"
                        :formItem="selectItem || []"
                        >
                        <template v-slot:[formSlot(item)]="{ formData, key }" v-for="item in (selectItem ? selectItem : [])">
                            <slot :name="item.slotName" :formData="formData" :key="key"  v-if="item.type === 'slot'" />
                        </template>
                    </Form>
                </div>
            </template>
            <a-table :dataSource="dataSource" :columns="columns" pagination="bottomRight"></a-table>
        </div>
    </Modal>
</template>
<script setup lang="ts">
import Modal from "./modal.vue";
import Form from "./form.vue";
import type {FormItem} from "./type";
import type { TableColumnType } from 'ant-design-vue';
import { onMounted, ref } from "vue";
interface Props {
    title:string,
    showModal:boolean,
    selectItem: FormItem[],
    dataSource:unknown[],
    columns:TableColumnType[],
    requestData?:Function
}
const selectForm = ref()
const props = withDefaults(defineProps<Props>(),{
    title:'报警记录',
    showModal:false,
    selectItem: () =>[],
    dataSource: () =>[],
    columns: () =>[],
})

// 解析表单插槽名
const formSlot = (item: FormItem) => {
    return item.slotName ? item.slotName : 'noSlot'
}

const getTableData = () =>{
    // props.requestData(selectForm.value.onSubmit())
}
onMounted(() => {
    getTableData()
})
</script>

<style lang="less" scoped>
    
</style>