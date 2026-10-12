<template>
  <a-modal centered v-model:visible="showModal" title="关联系统区域" @ok="handleOk" @cancel="handleCancel" :confirmLoading="loading" width="640px">
    <a-form :model="formState" :rules="rules" ref="formRef" :label-col="{span: 4, offset: 0}" style="max-height: 600px;overflow: auto;">
      <a-form-item label="当前区域">
        {{ hikData.name  || '--'}}
      </a-form-item>
      <a-form-item label="关联系统区域" name="areaId">
        <a-cascader 
          v-model:value="formState.areaId" 
          placeholder="请选择系统区域" 
          style="width: 260px;"
          :fieldNames="{label: 'name', value: 'id', children: 'children'}" 
          :options="areaOptions"
          change-on-select
         />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button key="back" @click="handleCancel">取消</a-button>
      <a-button type="primary" :loading="loading" @click="handleOk">确定</a-button>
    </template>
  </a-modal>
</template>

<script lang="jsx">
import { defineComponent, getCurrentInstance, onMounted, reactive, ref, } from "vue";
import { refHikMapArea } from '@/api/lingchuanhik.ts';
import { cubeMdataService } from "@/api/service.ts";

export default defineComponent({
  components: {
  },
  setup(props, { emit, expose }) {
    const { proxy } = getCurrentInstance();
    const showModal = ref(false)
    const loading = ref(false)
    const areaOptions = ref([])
    const formState = reactive({
      areaId: [],
    })
    const formRef = ref()
    const checkArea = async (rule, value) => {
      if (!value) {
        return Promise.reject('请选择系统区域');
      }
    };
    const rules = {
      areaId: [{ required: true, validator: checkArea, trigger: 'change' }],
    }
    const hikData = ref()
    const openModal = async (record) => {
      showModal.value = true
      hikData.value = record
      await initData()
    }

    const findMatchingAreaIds = (areaOptions, targetId) => {
      const result = [];
      const matchedPath = searchAreaIdRecursively(areaOptions, targetId);
      if (matchedPath) {
          result.push(...matchedPath);
      }
      return result;
    }
    const searchAreaIdRecursively = (areaList, targetId) => {
      for (const area of areaList) {
          if (area.id === targetId) {
              return [area.id];
          }
          if (area.children && Array.isArray(area.children)) {
              const found = searchAreaIdRecursively(area.children, targetId);
              if (found) {
                  return [area.id, ...found];
              }
          }
      }
      return null;
    }
    const initData = async () => {
      try {
        const res = await cubeMdataService.getAreaTree()
        areaOptions.value = res
        // 前端处理完整的areaId回显
        const areaId = hikData.value?.systemArea?.id
        if (areaId) {
          formState.areaId = findMatchingAreaIds(areaOptions.value, areaId)
        }
      } catch {
      }
    }
    const handleOk = () => {
      formRef.value.validate().then(async () => {
        try {
          loading.value = true
          const params = {
            code: hikData.value?.code,
            areaId: formState.areaId[formState.areaId?.length - 1]
          }
          await refHikMapArea(params)
          proxy.$message.success('操作成功')
          showModal.value = false
          emit('enter')
        } catch (error) {
        } finally {
          loading.value = false
        }
      })
    }
    const handleCancel = () => {
      showModal.value = false
      reset()
    }
    const reset = () => {
      for (const key in formState) {
        formState[key] = null
      }
    }
    expose({
      openModal
    })
    return {
      showModal,
      formState,
      loading,
      openModal,
      formRef,
      handleCancel,
      handleOk,
      reset,
      areaOptions,
      hikData,
      rules,
      checkArea
    };
  },
});
</script>
<style scoped lang="less">
</style>
