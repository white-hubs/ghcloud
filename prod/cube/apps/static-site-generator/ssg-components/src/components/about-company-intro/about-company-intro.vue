<template>
  <section class="w-full bg-white">
    <!-- Mobile / Tablet: stacked layout -->
    <div class="lg:hidden px-[5vw] py-[8vw]">
      <h2 class="text-center text-fluid-2xl font-bold text-[#182b44] mb-[6vw]">
        {{ title }}
      </h2>
      <img
        :src="image"
        :alt="companyName"
        class="w-full h-auto rounded-lg object-cover mb-[4vw]"
      />
      <h3 class="text-fluid-xl font-medium text-[#3d3d3d] mb-[2vw]">
        {{ companyName }}
      </h3>
      <div
        class="text-fluid-sm text-[#3d3d3d] leading-[1.8]"
        v-html="description"
      />
    </div>

    <!-- Desktop (lg+): match original Nuxt proportions with vw fluid scaling -->
    <div class="hidden lg:block lg:relative lg:w-full lg:h-[32.96875vw]">
      <h2
        class="absolute left-1/2 -translate-x-1/2 top-[4.1667vw] text-[1.5625vw] font-bold text-[#182b44] whitespace-nowrap"
      >
        {{ title }}
      </h2>

      <img
        :src="image"
        :alt="companyName"
        class="absolute left-[15.625vw] top-[8.4375vw] w-[31.4583vw] h-[19.375vw] rounded-lg object-cover"
      />

      <h3
        class="absolute left-[48.6458vw] top-[8.2292vw] text-[1.4583vw] font-medium text-[#3d3d3d] whitespace-nowrap"
      >
        {{ companyName }}
      </h3>

      <div
        class="absolute left-[48.6458vw] top-[10.9375vw] w-[36.9792vw] h-[19.7917vw] text-[0.7292vw] text-[#3d3d3d] leading-[1.6667vw] overflow-hidden"
        v-html="description"
      />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '企业简介',
  },
  image: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});
</script>
