<template>
  <div class="w-full flex flex-col lg:flex-row lg:h-[100vh] bg-white">
    <!-- 左侧图片区 -->
    <div class="relative w-full lg:w-[39.2708vw] lg:h-full min-h-[60vw] lg:min-h-0 overflow-hidden">
      <img
        :src="backgroundImage"
        alt=""
        class="absolute inset-0 w-full h-full object-cover"
      >
    </div>

    <!-- 右侧表单区 -->
    <div class="flex-1 flex flex-col justify-center items-center px-[5vw] lg:px-[7.2917vw] py-[8vw] lg:py-0 lg:h-full">
      <div class="w-full lg:max-w-[25.3125vw]">
        <h3 class="text-[5vw] lg:text-[1.875vw] font-medium text-[#07101c]">
          {{ formTitle }}
        </h3>
        <p v-if="formSubtitle" class="mt-[2vw] lg:mt-[1vw] text-fluid-sm lg:text-[0.8333vw] text-[#585c60]">
          {{ formSubtitle }}
        </p>

        <form class="mt-[3vw] lg:mt-[2vw] space-y-[1.5vw] lg:space-y-[1.5vw]" @submit.prevent="handleSubmit">
          <label class="block text-fluid-sm lg:text-[0.8333vw] text-[#182b44] mb-[1vw] lg:mb-[0.5208vw]">
            <span class="text-red-500">{{ nameLabel.charAt(0) }}</span>{{ nameLabel.slice(1) }}
          </label>
          <input
            v-model="form.name"
            type="text"
            :placeholder="namePlaceholder"
            class="w-full h-[10vw] lg:h-[2.6042vw] px-[3vw] lg:px-[1.0417vw] text-fluid-sm lg:text-[0.8333vw] text-[#182b44] bg-white border border-gray-200 rounded-sm outline-none focus:border-primary placeholder:text-[#c4cbd5]"
          >

          <label class="block text-fluid-sm lg:text-[0.8333vw] text-[#182b44] mb-[1vw] lg:mb-[0.5208vw]">
            <span class="text-red-500">{{ contactLabel.charAt(0) }}</span>{{ contactLabel.slice(1) }}
          </label>
          <input
            v-model="form.contact"
            type="text"
            :placeholder="contactPlaceholder"
            class="w-full h-[10vw] lg:h-[2.6042vw] px-[3vw] lg:px-[1.0417vw] text-fluid-sm lg:text-[0.8333vw] text-[#182b44] bg-white border border-gray-200 rounded-sm outline-none focus:border-primary placeholder:text-[#c4cbd5]"
          >

          <label class="block text-fluid-sm lg:text-[0.8333vw] text-[#182b44] mb-[1vw] lg:mb-[0.5208vw]">
            {{ companyLabel }}
          </label>
          <input
            v-model="form.company"
            type="text"
            :placeholder="companyPlaceholder"
            class="w-full h-[10vw] lg:h-[2.6042vw] px-[3vw] lg:px-[1.0417vw] text-fluid-sm lg:text-[0.8333vw] text-[#182b44] bg-white border border-gray-200 rounded-sm outline-none focus:border-primary placeholder:text-[#c4cbd5]"
          >

          <label class="block text-fluid-sm lg:text-[0.8333vw] text-[#182b44] mb-[1vw] lg:mb-[0.5208vw]">
            {{ sceneLabel }}
          </label>
          <input
            v-model="form.scene"
            type="text"
            :placeholder="scenePlaceholder"
            class="w-full h-[10vw] lg:h-[2.6042vw] px-[3vw] lg:px-[1.0417vw] text-fluid-sm lg:text-[0.8333vw] text-[#182b44] bg-white border border-gray-200 rounded-sm outline-none focus:border-primary placeholder:text-[#c4cbd5]"
          >

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full h-[11vw] lg:h-[2.9167vw] mt-[2vw] lg:mt-0 bg-primary text-white text-fluid-base lg:text-[1.0417vw] font-medium rounded-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? '提交中...' : submitText }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  backgroundImage: string
  formTitle: string
  formSubtitle?: string
  nameLabel?: string
  contactLabel?: string
  companyLabel?: string
  sceneLabel?: string
  namePlaceholder?: string
  contactPlaceholder?: string
  companyPlaceholder?: string
  scenePlaceholder?: string
  submitText?: string
  submitApi?: string
  submitMethod?: string
  successMessage?: string
  errorMessage?: string
  tenant?: string
}

const props = withDefaults(defineProps<Props>(), {
  formSubtitle: '',
  nameLabel: '*姓名',
  contactLabel: '*联系方式',
  companyLabel: '企业名称',
  sceneLabel: '应用场景',
  namePlaceholder: '您的姓名',
  contactPlaceholder: '联系方式',
  companyPlaceholder: '企业名称',
  scenePlaceholder: '应用场景',
  submitText: '提交',
  submitApi: '',
  submitMethod: 'POST',
  successMessage: '提交成功，我们将尽快与您联系！',
  errorMessage: '提交失败，请稍后重试',
  tenant: '',
})

const form = ref({
  name: '',
  contact: '',
  company: '',
  scene: '',
})

const isSubmitting = ref(false)

async function handleSubmit() {
  if (!form.value.name.trim() || !form.value.contact.trim()) {
    alert('请填写姓名和联系方式')
    return
  }

  if (!props.submitApi) {
    alert(props.successMessage)
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      userName: form.value.name,
      contactWay: form.value.contact,
      companyName: form.value.company,
      applicationScenario: form.value.scene,
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (props.tenant) {
      headers.tenant = props.tenant
    }
    const response = await fetch(props.submitApi, {
      method: props.submitMethod,
      headers,
      body: JSON.stringify(payload),
    })
    if (response.ok) {
      alert(props.successMessage)
      form.value = { name: '', contact: '', company: '', scene: '' }
    } else {
      alert(props.errorMessage)
    }
  } catch {
    alert(props.errorMessage)
  } finally {
    isSubmitting.value = false
  }
}
</script>
