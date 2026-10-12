<template>
  <div class="w-full h-[832px] bg-[#f9fcff] relative">
    <h2 class="absolute left-1/2 -translate-x-1/2 top-[80px] text-[30px] font-bold text-[#182b44] font-['SOURCEHANSANSSC-BOLD']">
      联系我们
    </h2>
    <div class="absolute top-[162px] left-1/2 -translate-x-1/2 flex bg-white w-[1320px] h-[590px] shadow-[0_0_36px_rgba(3,9,26,0.06)]">
      <!-- Left tabs -->
      <div class="h-full p-[20px] w-[326px] border-r border-[#f0f0f0] box-border">
        <div
          v-for="(item, i) in locations"
          :key="i"
          @click="switchLocation(i)"
          class="w-[238px] h-[74px] flex items-center px-[20px] text-[18px] font-normal cursor-pointer transition-all box-border"
          :class="
            activeIndex === i
              ? 'text-[#f2f7fd] shadow-[0_0_10px_rgba(3,9,26,0.04)] bg-gradient-to-r from-primary to-primary/10'
              : 'text-[#020a15] bg-white'
          "
        >
          {{ item.name }}
        </div>
      </div>
      <!-- Right content -->
      <div class="flex-1 h-full pl-5 pt-[50px] box-border">
        <div class="flex items-center mb-3">
          <span class="text-[16px] font-medium text-[#182b44] font-['SourceHanSansCN-Medium-2']">联系电话：</span>
          <span class="text-[16px] text-[#585c60] font-['SOURCEHANSANSSC-REGULAR']">{{ locations[activeIndex].phone }}</span>
        </div>
        <div class="flex items-center mb-3">
          <span class="text-[16px] font-medium text-[#182b44] font-['SourceHanSansCN-Medium-2']">{{ locations[activeIndex].name }}：</span>
          <span class="text-[16px] text-[#585c60] font-['SOURCEHANSANSSC-REGULAR']">{{ locations[activeIndex].address }}</span>
        </div>
        <div
          ref="mapContainer"
          class="w-[944px] h-[420px] mt-[30px] bg-[#eef6ff] flex items-center justify-center text-[#585c60] text-[16px] font-['SOURCEHANSANSSC-REGULAR']"
        >
          <div v-if="!hasMapKey || mapError" class="text-center">
            <div class="mb-2">地图区域</div>
            <div class="text-[14px] text-[#999]">{{ locations[activeIndex].address }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
interface LocationInfo {
  name: string;
  phone: string;
  address: string;
  lng?: number;
  lat?: number;
}
const props = defineProps<{
  locations: LocationInfo[];
  mapKey?: string;
}>();
const activeIndex = ref(0);
const mapContainer = ref<HTMLDivElement | null>(null);
const mapError = ref(false);
const hasMapKey = ref(!!props.mapKey);

let mapInstance: any = null;
let markerInstance: any = null;
let amapScriptLoaded = false;

const loadAMap = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).AMap) {
      resolve((window as any).AMap);
      return;
    }
    if (!props.mapKey) {
      reject(new Error("No mapKey"));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${props.mapKey}`;
    script.onerror = () => reject(new Error("AMap script load error"));
    script.onload = () => resolve((window as any).AMap);
    document.head.appendChild(script);
  });
};

const initMap = async () => {
  if (!props.mapKey || !mapContainer.value) return;
  try {
    const AMap = await loadAMap();
    amapScriptLoaded = true;
    mapError.value = false;
    const loc = props.locations[activeIndex.value];
    const center: [number, number] = loc.lng && loc.lat ? [loc.lng, loc.lat] : [104.056715, 30.5859133];
    mapInstance = new AMap.Map(mapContainer.value, {
      resizeEnable: true,
      center,
      zoom: 17,
    });
    markerInstance = new AMap.Marker({
      position: center,
    });
    markerInstance.setMap(mapInstance);
    const text = new AMap.Text({
      position: center,
      text: "古河云科技有限公司",
      style: {
        fontSize: "12px",
        color: "black",
        background: "white",
        padding: "5px",
        marginTop: "-25px",
        marginLeft: "-45px",
        border: "none",
      },
    });
    text.setMap(mapInstance);
  } catch (e) {
    mapError.value = true;
  }
};

const updateMapCenter = () => {
  if (!amapScriptLoaded || !mapInstance) return;
  const loc = props.locations[activeIndex.value];
  const center: [number, number] = loc.lng && loc.lat ? [loc.lng, loc.lat] : [104.056715, 30.5859133];
  mapInstance.setCenter(center);
  markerInstance?.setPosition(center);
};

const switchLocation = (i: number) => {
  activeIndex.value = i;
};

watch(activeIndex, () => {
  if (amapScriptLoaded) {
    updateMapCenter();
  }
});

onMounted(() => {
  if (props.mapKey) {
    nextTick(() => initMap());
  }
});
</script>
