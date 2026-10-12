<template>
    <Modal :modalStyle="{width:'700px'}" :title="noticeData.title"  :show="showModal" @close="closeModal">
        <div class="scroll-text" v-html="noticeData.content"></div>
    </Modal>
</template>

<script setup lang="ts">
import Modal from "@/components/modal-table/modal.vue";

interface Props {
  noticeData: any;
  showModal: boolean;
}
const emit = defineEmits(["close"]);
const props = withDefaults(defineProps<Props>(), {
  showModal: true,
});
const closeModal = ()=>{
  emit("close");
}
</script>
<style lang="less" scoped>
.scroll-text{
    color: #fff;
    max-height: 500px;
    overflow-y: auto;
}
.notification-modal{
    width: 300px;
}
:deep(.modal-width){
  width: 600px !important;
}
</style>