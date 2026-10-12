<template>
  <div class="user-select-group">
    <VanNavBar class="nav" title="部门选择" left-text="取消" right-text="确认" @click-left="cancel" @click-right="confirm" />
    <VanCellGroup class="select-group">
      <template v-for="deptCell of deptCells" :key="deptCell.value.id">
        <VanCell clickable @click="cellClick(deptCell)">
          <template #title>
            <VanRow gutter="2">
              <VanCol span="4">{{ deptCell.value.name }}</VanCol>
            </VanRow>
          </template>
          <template #right-icon>
            <VanCheckbox :model-value="deptCell.checked" :shape="props.multiple ? 'square' : 'round'"/>
          </template>
        </VanCell>
      </template>
      <VanDivider>到底了</VanDivider>
    </VanCellGroup>
  </div>
</template>

<script setup lang="ts">
import { Dept } from '../../../domain/ouaa';
import { reactive, ref } from 'vue'
interface CheckboxCell<T> {
  value: T;
  checked: boolean;
}
const props = defineProps<{
  depts: Dept[];
  multiple:boolean
}>()
const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'confirm', selected: Dept[]): void;
}>()
const deptCells = reactive<CheckboxCell<Dept>[]>(props.depts.map(d => ({ checked: false, value: d })))
const selected = ref<Dept[]>([])

function cellClick(deptCell: CheckboxCell<Dept>) {
  if(!props.multiple){
    deptCells.map(e=>e.checked=false)
  }
  deptCell.checked = !deptCell.checked
}
function cancel() {
  deptCells.forEach(cell => {
    cell.checked = !!selected.value.find(d => d.id === cell.value.id)
  })
  emit('cancel')
}
function confirm() {
  selected.value = deptCells.filter(d => d.checked).map(d => d.value)
  emit('confirm', selected.value)
}
function resetDeptCells(data:Dept[]){
  deptCells.forEach(cell => {
    cell.checked = !!data.find(d => d.id === cell.value.id)
  })
}

defineExpose({
  resetDeptCells
})
</script>

<style scoped lang="less">
.user-select-group {
  background-color: #fff;
  height: 100vh;
  width: 100vw;
  overflow: hidden;

  .select-group {
    overflow: auto;
    height: calc(100% - var(--van-nav-bar-height));
  }
}
</style>
<style scoped>
.van-row{
  white-space: nowrap;
}
</style>